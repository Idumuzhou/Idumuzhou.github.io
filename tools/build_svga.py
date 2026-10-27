from pathlib import Path
import struct, zlib, math

ROOT = Path(__file__).resolve().parents[1]

# Tiny protobuf writer for the SVGA v2 MovieEntity schema.
def varint(value):
    out = bytearray()
    value = int(value)
    while value > 127:
        out.append((value & 127) | 128)
        value >>= 7
    out.append(value)
    return bytes(out)

def field_varint(number, value):
    return varint((number << 3) | 0) + varint(value)

def field_float(number, value):
    return varint((number << 3) | 5) + struct.pack('<f', float(value))

def field_bytes(number, value):
    return varint((number << 3) | 2) + varint(len(value)) + value

def field_string(number, value):
    return field_bytes(number, value.encode('utf-8'))

def message(fields):
    return b''.join(fields)

def layout(x, y, width, height):
    return message([field_float(1, x), field_float(2, y), field_float(3, width), field_float(4, height)])

def transform(a, b, c, d, tx, ty):
    return message([field_float(1, a), field_float(2, b), field_float(3, c), field_float(4, d), field_float(5, tx), field_float(6, ty)])

def frame(index, total):
    # A gentle 30fps orbital bob with a tiny tilt. The image itself stays crisp
    # while the full art direction remains expressed by the surrounding HUD.
    phase = (index / total) * math.tau
    x = math.sin(phase) * 12
    y = math.sin(phase * 2) * 7
    angle = math.sin(phase) * 0.012
    scale = 1 + math.sin(phase * 2) * 0.006
    return message([
        field_float(1, 1),
        field_bytes(2, layout(0, 0, 1536, 1024)),
        field_bytes(3, transform(scale * math.cos(angle), scale * math.sin(angle), -scale * math.sin(angle), scale * math.cos(angle), x, y)),
    ])

def sprite(image_key):
    total = 60
    return message([
        field_string(1, image_key),
        b''.join(field_bytes(2, frame(i, total)) for i in range(total)),
    ])

def build(src_name, out_name):
    image = (ROOT / 'assets' / src_name).read_bytes()
    params = message([
        field_float(1, 1536),
        field_float(2, 1024),
        field_varint(3, 30),
        field_varint(4, 60),
    ])
    image_entry = message([field_string(1, 'canoe'), field_bytes(2, image)])
    movie = message([
        field_string(1, '2.0'),
        field_bytes(2, params),
        field_bytes(3, image_entry),
        field_bytes(4, sprite('canoe')),
    ])
    (ROOT / 'assets' / out_name).write_bytes(zlib.compress(movie, 9))

build('canoe-dark.webp', 'canoe-dark.svga')
build('canoe-light.webp', 'canoe-light.svga')
