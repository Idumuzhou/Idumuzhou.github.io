"""Build the vector-only SVGA canoe scene used by the homepage.

The asset intentionally contains no raster image. The hull, paddle, wake,
scan arcs and navigation nodes are all SVGA shapes so the entire boat can
move as one animated scene.
"""
from pathlib import Path
import math
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]


def varint(value):
    out = bytearray()
    value = int(value)
    while value > 127:
        out.append((value & 127) | 128)
        value >>= 7
    out.append(value)
    return bytes(out)


def key(number, wire):
    return varint((number << 3) | wire)


def field_varint(number, value):
    return key(number, 0) + varint(value)


def field_float(number, value):
    return key(number, 5) + struct.pack('<f', float(value))


def field_bytes(number, value):
    return key(number, 2) + varint(len(value)) + value


def field_string(number, value):
    return field_bytes(number, value.encode('utf-8'))


def message(fields):
    return b''.join(fields)


def rgba(color):
    alpha = color[3] if color[3] > 1 else color[3] * 255
    return message([field_float(1, color[0]), field_float(2, color[1]), field_float(3, color[2]), field_float(4, alpha)])


def styles(fill=None, stroke=None, stroke_width=0, dashed=False):
    fields = []
    if fill is not None:
        fields.append(field_bytes(1, rgba(fill)))
    if stroke is not None:
        fields.append(field_bytes(2, rgba(stroke)))
    if stroke_width:
        fields.append(field_float(3, stroke_width))
        fields.append(field_varint(4, 1))  # round line caps
        fields.append(field_varint(5, 1))  # round line joins
    if dashed:
        fields.extend([field_float(7, 22), field_float(8, 16)])
    return message(fields)


def transform(a=1, b=0, c=0, d=1, tx=0, ty=0):
    return message([field_float(1, a), field_float(2, b), field_float(3, c), field_float(4, d), field_float(5, tx), field_float(6, ty)])


def shape_path(path, fill=None, stroke=None, width=0, dashed=False, local_transform=None):
    shape_args = message([field_string(1, path)])
    fields = [field_varint(1, 0), field_bytes(2, shape_args), field_bytes(10, styles(fill, stroke, width, dashed))]
    if local_transform:
        fields.append(field_bytes(11, transform(*local_transform)))
    return message(fields)


def ellipse(x, y, rx, ry, fill=None, stroke=None, width=0, dashed=False):
    ellipse_args = message([field_float(1, x), field_float(2, y), field_float(3, rx), field_float(4, ry)])
    return message([field_varint(1, 2), field_bytes(4, ellipse_args), field_bytes(10, styles(fill, stroke, width, dashed))])


def rect(x, y, width, height, radius, fill=None, stroke=None, stroke_width=0):
    rect_args = message([field_float(1, x), field_float(2, y), field_float(3, width), field_float(4, height), field_float(5, radius)])
    return message([field_varint(1, 1), field_bytes(3, rect_args), field_bytes(10, styles(fill, stroke, stroke_width))])


def frame(index, total, palette):
    phase = index / total * math.tau
    bob = math.sin(phase * 2) * 5
    drift = math.sin(phase) * 10
    angle = math.sin(phase) * 0.012
    scale = 1 + math.sin(phase * 2) * 0.004
    cos_a = scale * math.cos(angle)
    sin_a = scale * math.sin(angle)
    # Rotate around the scene centre, then add the soft orbital drift.
    tx = 600 - 600 * cos_a + 400 * sin_a + drift
    ty = 400 - 600 * sin_a - 400 * cos_a + bob

    p = palette
    wake_shift = math.sin(phase) * 12
    glow_alpha = 0.18 + (math.sin(phase) + 1) * 0.06
    shapes = [
        # Navigation rings and a moving wake are part of the SVGA scene itself.
        ellipse(600, 608, 482 + wake_shift, 86, None, (*p['cyan'][:3], glow_alpha), 4),
        ellipse(600, 615, 370 - wake_shift * .4, 52, None, (*p['blue'][:3], .36), 2, dashed=True),
        shape_path(f'M 142 {584 + wake_shift * .18:.2f} C 286 {552 + wake_shift * .1:.2f} 390 {572 - wake_shift * .15:.2f} 520 {590 + wake_shift * .08:.2f} C 676 {612 - wake_shift * .12:.2f} 820 {624 + wake_shift * .1:.2f} 1058 {560 - wake_shift * .2:.2f}', None, (*p['cyan'][:3], .82), 3),
        shape_path(f'M 208 {626 - wake_shift * .15:.2f} C 352 {600 + wake_shift * .1:.2f} 474 {624 - wake_shift * .08:.2f} 608 {636 + wake_shift * .12:.2f} C 752 {650 - wake_shift * .14:.2f} 864 {638 + wake_shift * .1:.2f} 1004 {604 - wake_shift * .08:.2f}', None, (*p['blue'][:3], .62), 2),
        # Main hull silhouette and its inner shadow.
        shape_path('M 172 414 C 258 494 414 526 632 516 C 824 508 956 450 1032 346 C 992 526 820 636 574 646 C 366 652 220 562 172 414 Z', p['hull'], p['edge'], 6),
        shape_path('M 204 430 C 320 490 452 504 634 496 C 808 488 942 436 1012 360 C 948 458 810 544 604 558 C 414 570 286 524 204 430 Z', p['inner'], None, 0),
        # Metallic highlight and keel line.
        shape_path('M 194 414 C 302 464 450 480 624 470 C 812 460 936 414 1024 340', None, p['bright'], 4),
        shape_path('M 224 532 C 350 616 524 628 692 606 C 842 586 948 506 1000 422', None, (*p['blue'][:3], .7), 3),
        # Three structural ribs / seats.
        rect(392, 454, 28, 124, 10, p['seat'], p['cyan'], 2),
        rect(566, 478, 28, 118, 10, p['seat'], p['cyan'], 2),
        rect(742, 462, 28, 104, 10, p['seat'], p['cyan'], 2),
        # Paddle shaft and blade, all vector paths.
        shape_path('M 824 170 C 794 286 758 392 688 556', None, p['bright'], 9),
        shape_path('M 814 166 C 848 142 886 126 922 118 C 908 160 884 194 846 216 Z', p['cyan'], p['bright'], 3),
        shape_path('M 682 548 C 662 584 632 610 598 630 C 626 634 650 624 670 606 C 690 588 700 568 704 548 Z', p['blue'], p['bright'], 2),
        # Small route markers complete the cockpit-like visual language.
        ellipse(164, 382, 8, 8, p['cyan'], p['bright'], 2),
        ellipse(1040, 332, 8, 8, p['cyan'], p['bright'], 2),
        ellipse(1010, 562, 5, 5, p['bright'], None, 0),
        ellipse(186, 610, 5, 5, p['bright'], None, 0),
    ]
    frame_fields = [field_float(1, 1), field_bytes(2, message([field_float(1, 0), field_float(2, 0), field_float(3, 1200), field_float(4, 800)])), field_bytes(3, transform(cos_a, sin_a, -sin_a, cos_a, tx, ty))]
    frame_fields.extend(field_bytes(5, shape) for shape in shapes)
    return message(frame_fields)


def build(out_name, light=False):
    if light:
        palette = {
            'hull': (.58, .66, .78, .96), 'inner': (.78, .84, .92, .96), 'edge': (.08, .28, .72, 1),
            'bright': (.03, .12, .3, .9), 'cyan': (.04, .48, .94, 1), 'blue': (.12, .28, .72, 1),
            'seat': (.48, .57, .7, .92),
        }
    else:
        palette = {
            'hull': (.24, .29, .37, .98), 'inner': (.055, .075, .12, .98), 'edge': (.57, .74, 1, 1),
            'bright': (.93, .97, 1, .96), 'cyan': (.24, .78, 1, 1), 'blue': (.24, .42, .94, 1),
            'seat': (.16, .22, .31, 1),
        }
    params = message([field_float(1, 1200), field_float(2, 800), field_varint(3, 30), field_varint(4, 72)])
    sprite = message([field_string(1, ''), b''.join(field_bytes(2, frame(i, 72, palette)) for i in range(72))])
    movie = message([field_string(1, '2.0'), field_bytes(2, params), field_bytes(4, sprite)])
    (ROOT / 'assets' / out_name).write_bytes(zlib.compress(movie, 9))


build('canoe-dark.svga')
build('canoe-light.svga', light=True)
