(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const appearance = document.querySelector('.appearance');
  const summary = appearance ? appearance.querySelector('summary') : null;
  const menuToggle = document.querySelector('.menu-toggle');
  const siteHeader = document.querySelector('.site-header');
  const isNotFound = body.dataset.page === '404';

  const read = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) {}
  };

  const savedTheme = read('dumu-theme');
  let theme = ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';
  let language = read('dumu-language') === 'en' ? 'en' : 'zh';

  root.classList.add('js');

  function getEffectiveTheme() {
    return theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme;
  }

  function applyTheme() {
    const effective = getEffectiveTheme();
    root.dataset.theme = effective;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = effective === 'dark' ? '#07080a' : '#f8fafc';
    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      const selected = button.dataset.themeChoice === theme;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function applyLanguage() {
    const english = language === 'en';
    root.lang = english ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh][data-en]').forEach((element) => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-aria-zh]').forEach((element) => {
      element.setAttribute('aria-label', element.getAttribute(`data-aria-${language}`));
    });
    document.querySelectorAll('[data-alt-zh]').forEach((element) => {
      element.alt = element.getAttribute(`data-alt-${language}`);
    });
    document.querySelectorAll('[data-lang]').forEach((button) => {
      const selected = button.dataset.lang === language;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.title = isNotFound
      ? (english ? 'Page not found · Dumuzhou' : '页面未找到 · 独木舟')
      : (english ? 'Dumuzhou · Personal digital space' : '独木舟 · 个人数字空间');
    const description = english
      ? 'Dumuzhou is an Android developer and product builder exploring ideas, systems, and useful products.'
      : '独木舟的个人数字空间：Android 开发、产品构建与持续学习。';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }

  function setMenu(open) {
    if (!siteHeader || !menuToggle) return;
    siteHeader.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open
      ? (language === 'en' ? 'Close menu' : '关闭菜单')
      : (language === 'en' ? 'Open menu' : '打开菜单'));
    body.classList.toggle('menu-open', open);
  }

  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      theme = button.dataset.themeChoice;
      save('dumu-theme', theme);
      applyTheme();
      if (appearance) appearance.open = false;
      summary?.focus();
    });
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      language = button.dataset.lang;
      save('dumu-language', language);
      applyLanguage();
      if (siteHeader?.classList.contains('menu-open')) setMenu(true);
    });
  });

  menuToggle?.addEventListener('click', () => {
    setMenu(!siteHeader.classList.contains('menu-open'));
  });

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.querySelector('.identity')?.addEventListener('click', () => setMenu(false));

  document.addEventListener('click', (event) => {
    if (appearance && !appearance.contains(event.target)) appearance.open = false;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (appearance?.open) {
        appearance.open = false;
        summary?.focus();
      }
      if (siteHeader?.classList.contains('menu-open')) {
        setMenu(false);
        menuToggle?.focus();
      }
    }
  });

  systemTheme.addEventListener('change', () => {
    if (theme === 'system') applyTheme();
  });

  applyTheme();
  applyLanguage();

  // Reveal animations & Active link observer
  const revealItems = document.querySelectorAll('[data-reveal]');
  const tagWords = document.querySelectorAll('[data-tag-word]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));

    if (tagWords.length) {
      const tagObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.45 });
      tagWords.forEach((word) => tagObserver.observe(word));
    }

    const navLinks = [...document.querySelectorAll('[data-nav-link]')];
    const sections = navLinks.map((link) => document.getElementById(link.dataset.navLink)).filter(Boolean);
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.dataset.navLink === entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => activeObserver.observe(section));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    tagWords.forEach((word) => word.classList.add('is-visible'));
  }

  /* -------------------------------------------------------------
     1. Full-screen Voyage Canvas: Fluid currents, particles & wake
     ------------------------------------------------------------- */
  const voyageCanvas = document.getElementById('voyage-canvas');
  if (voyageCanvas) {
    const ctx = voyageCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;
    let particles = [];
    let ripples = [];
    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, prevX: -1000, prevY: -1000, active: false };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      voyageCanvas.width = Math.floor(width * dpr);
      voyageCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const count = Math.min(Math.floor((width * height) / 12000), 130);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() * 0.4 + 0.15),
          vy: (Math.random() - 0.5) * 0.15,
          ox: 0,
          oy: 0,
          radius: Math.random() * 1.6 + 0.8,
          alpha: Math.random() * 0.55 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.008 + 0.004
        });
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.active = true;

      // Spawn subtle wake ripples when moving swiftly
      const speed = Math.hypot(mouse.vx, mouse.vy);
      if (speed > 4 && Math.random() < 0.35) {
        ripples.push({
          x: mouse.x,
          y: mouse.y,
          radius: 4,
          maxRadius: Math.min(speed * 4 + 40, 120),
          alpha: 0.35,
          growSpeed: 1.4
        });
      }
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('click', (e) => {
      // Sonic ping ripple on click
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: Math.min(width, height) * 0.45,
        alpha: 0.65,
        growSpeed: 3.5
      });
    }, { passive: true });

    let lastTime = 0;
    function renderVoyage(time) {
      if (document.hidden) {
        animationId = requestAnimationFrame(renderVoyage);
        return;
      }
      const t = time * 0.001;
      const isDark = getEffectiveTheme() === 'dark';

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle topological stream currents
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        const baseY = height * (0.22 + w * 0.22);
        const waveFreq = 0.0022 - w * 0.0003;
        const waveSpeed = 0.4 + w * 0.2;
        const waveAmp = 22 + w * 12;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 18) {
          // Curvature + gentle mouse disturbance
          const distToMouse = Math.hypot(x - mouse.x, baseY - mouse.y);
          const mouseDeflect = mouse.active && distToMouse < 180
            ? (1 - distToMouse / 180) * (mouse.vy * 0.8 || -18)
            : 0;

          const y = baseY
            + Math.sin(x * waveFreq + t * waveSpeed + w) * waveAmp
            + Math.cos(x * waveFreq * 1.5 - t * waveSpeed * 0.8) * (waveAmp * 0.35)
            + mouseDeflect;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = isDark
          ? `rgba(13, 242, 147, ${0.035 + w * 0.018})`
          : `rgba(5, 150, 105, ${0.035 + w * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw & update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.growSpeed;
        r.alpha *= 0.965;

        if (r.alpha < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(13, 242, 147, ${r.alpha})`
          : `rgba(5, 150, 105, ${r.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 3. Update & render particle constellations
      const pLen = particles.length;
      for (let i = 0; i < pLen; i++) {
        const p = particles[i];

        // Wave bobbing
        p.x += p.vx;
        p.y += p.vy + Math.sin(t * 1.5 + p.phase) * 0.25;

        // Wrap around boundaries
        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0.01) {
            const force = (1 - dist / 130) * 2.8;
            p.ox += (dx / dist) * force;
            p.oy += (dy / dist) * force;
          }
        }

        p.ox *= 0.92;
        p.oy *= 0.92;

        const drawX = p.x + p.ox;
        const drawY = p.y + p.oy;

        // Particle node
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(13, 242, 147, ${p.alpha * 0.85})`
          : `rgba(5, 150, 105, ${p.alpha * 0.75})`;
        ctx.fill();

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < pLen; j++) {
          const p2 = particles[j];
          const cdx = drawX - (p2.x + p2.ox);
          const cdy = drawY - (p2.y + p2.oy);
          const cdist = Math.hypot(cdx, cdy);
          if (cdist < 85) {
            const lineAlpha = (1 - cdist / 85) * 0.18;
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(p2.x + p2.ox, p2.y + p2.oy);
            ctx.strokeStyle = isDark
              ? `rgba(13, 242, 147, ${lineAlpha})`
              : `rgba(5, 150, 105, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      if (!reducedMotion.matches) {
        animationId = requestAnimationFrame(renderVoyage);
      }
    }

    if (!reducedMotion.matches) {
      animationId = requestAnimationFrame(renderVoyage);
    } else {
      renderVoyage(0);
    }
  }

  /* -------------------------------------------------------------
     2. Hero 3D Vessel Canvas: Mathematical Wireframe Canoe & Radar
     ------------------------------------------------------------- */
  const vesselStage = document.getElementById('visual-stage');
  const vesselCanvas = document.getElementById('vessel-canvas');
  if (vesselCanvas && vesselStage) {
    const ctx = vesselCanvas.getContext('2d');
    let width = 1200;
    let height = 800;
    let dpr = 1;
    let vesselAnimId = null;
    let isVisible = true;

    // Viewport observer to pause 3D math when scrolled away
    if ('IntersectionObserver' in window) {
      const stageObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      stageObserver.observe(vesselStage);
    }

    function resizeVessel() {
      const rect = vesselStage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 220);
      vesselCanvas.width = Math.floor(width * dpr);
      vesselCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeVessel, { passive: true });
    resizeVessel();

    // Mouse tracking for 3D parallax tilt
    let targetRotY = -0.58;
    let targetRotX = 0.32;
    let currentRotY = targetRotY;
    let currentRotX = targetRotX;

    window.addEventListener('pointermove', (e) => {
      const rect = vesselStage.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) - 0.5;
      const ny = ((e.clientY - rect.top) / rect.height) - 0.5;
      targetRotY = -0.58 + nx * 0.45;
      targetRotX = 0.32 - ny * 0.28;
    }, { passive: true });

    // Floating stardust sparks
    const sparks = [];
    for (let i = 0; i < 28; i++) {
      sparks.push({
        x: (Math.random() - 0.5) * 360,
        y: Math.random() * 80 - 40,
        z: (Math.random() - 0.5) * 360,
        vy: -(Math.random() * 0.6 + 0.3),
        alpha: Math.random() * 0.7 + 0.2,
        size: Math.random() * 1.6 + 0.6
      });
    }

    // FPS Telemetry
    let frameCount = 0;
    let lastFpsTime = performance.now();
    const fpsElem = document.querySelector('.fps-counter');
    const driftElem = document.querySelector('.drift-readout');

    function project(x, y, z, rotX, rotY, cx, cy, fov) {
      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective scale
      const dist = fov + z2;
      if (dist <= 10) return null;
      const scale = fov / dist;

      return {
        x: cx + x1 * scale,
        y: cy + y1 * scale,
        z: z2,
        scale
      };
    }

    function renderVessel(time) {
      if (document.hidden || !isVisible) {
        vesselAnimId = requestAnimationFrame(renderVessel);
        return;
      }

      // FPS tracking
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 500) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        if (fpsElem) fpsElem.textContent = `${fps} FPS`;
        if (driftElem) {
          const drift = (Math.sin(time * 0.001) * 0.18 + 0.42).toFixed(2);
          driftElem.textContent = `DRIFT +${drift}`;
        }
        frameCount = 0;
        lastFpsTime = now;
      }

      const t = time * 0.001;
      const isDark = getEffectiveTheme() === 'dark';

      ctx.clearRect(0, 0, width, height);

      // Interpolate rotation
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentRotX += (targetRotX - currentRotX) * 0.06;

      // Subtle aquatic heave & roll
      const heaveY = Math.sin(t * 1.4) * 8;
      const rollRot = Math.cos(t * 1.1) * 0.04;
      const pitchRot = Math.sin(t * 0.8) * 0.03;

      const rotX = currentRotX + pitchRot;
      const rotY = currentRotY;
      const cx = width * 0.5;
      const cy = height * 0.52 + heaveY;
      const fov = 480;

      // Color palette
      const primaryColor = isDark ? '#0df293' : '#059669';
      const wireColor = isDark ? 'rgba(244, 246, 250, 0.75)' : 'rgba(15, 23, 42, 0.7)';
      const softWireColor = isDark ? 'rgba(244, 246, 250, 0.22)' : 'rgba(15, 23, 42, 0.2)';
      const accentSoft = isDark ? 'rgba(13, 242, 147, 0.25)' : 'rgba(5, 150, 105, 0.25)';

      // 1. Radar water plane rings beneath canoe
      const planeY = 55;
      for (let r = 80; r <= 220; r += 70) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
          const px = Math.cos(a + t * 0.1) * r;
          const pz = Math.sin(a + t * 0.1) * r;
          const p = project(px, planeY, pz, rotX, rotY, cx, cy, fov);
          if (!p) continue;
          if (a === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = isDark ? 'rgba(13, 242, 147, 0.1)' : 'rgba(5, 150, 105, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Radar sweep ray
      const sweepAngle = t * 1.2;
      const sweepStart = project(0, planeY, 0, rotX, rotY, cx, cy, fov);
      const sweepEnd = project(Math.cos(sweepAngle) * 230, planeY, Math.sin(sweepAngle) * 230, rotX, rotY, cx, cy, fov);
      if (sweepStart && sweepEnd) {
        ctx.beginPath();
        ctx.moveTo(sweepStart.x, sweepStart.y);
        ctx.lineTo(sweepEnd.x, sweepEnd.y);
        ctx.strokeStyle = isDark ? 'rgba(13, 242, 147, 0.3)' : 'rgba(5, 150, 105, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Parametric 3D Canoe Geometry
      const lengthZ = 190;
      const maxBeam = 56;
      const keelDepth = 42;

      // Mathematical profile functions
      const getWidthAt = (u) => maxBeam * Math.pow(Math.max(0, 1 - u * u), 0.58) * (1 - 0.08 * u);
      const getRailY = (u) => -16 + 32 * (u * u);
      const getKeelY = (u) => 28 - 24 * Math.pow(u, 4);

      // Generate longitudinal points
      const stationSteps = 28;
      const leftRailPts = [];
      const rightRailPts = [];
      const keelPts = [];
      const midLeftPts = [];
      const midRightPts = [];

      for (let i = 0; i <= stationSteps; i++) {
        const u = -1 + (i / stationSteps) * 2;
        const z = u * lengthZ;
        const w = getWidthAt(u);
        const yRail = getRailY(u);
        const yKeel = getKeelY(u);
        const yMid = yRail + (yKeel - yRail) * 0.52;
        const wMid = w * 0.88;

        leftRailPts.push(project(-w, yRail, z, rotX, rotY, cx, cy, fov));
        rightRailPts.push(project(w, yRail, z, rotX, rotY, cx, cy, fov));
        keelPts.push(project(0, yKeel, z, rotX, rotY, cx, cy, fov));
        midLeftPts.push(project(-wMid, yMid, z, rotX, rotY, cx, cy, fov));
        midRightPts.push(project(wMid, yMid, z, rotX, rotY, cx, cy, fov));
      }

      // Helper to stroke a projected curve
      const strokeCurve = (pts, color, widthVal, dashed = false) => {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          if (!p) continue;
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = widthVal;
        if (dashed) ctx.setLineDash([3, 4]);
        ctx.stroke();
        if (dashed) ctx.setLineDash([]);
      };

      // Draw secondary longitudinal strakes
      strokeCurve(midLeftPts, softWireColor, 1);
      strokeCurve(midRightPts, softWireColor, 1);

      // Draw Transversal Cross Ribs (forming 3D volume)
      const ribCount = 12;
      for (let r = 1; r < ribCount; r++) {
        const u = -0.86 + (r / ribCount) * 1.72;
        const z = u * lengthZ;
        const w = getWidthAt(u);
        const yRail = getRailY(u);
        const yKeel = getKeelY(u);

        const pL = project(-w, yRail, z, rotX, rotY, cx, cy, fov);
        const pK = project(0, yKeel, z, rotX, rotY, cx, cy, fov);
        const pR = project(w, yRail, z, rotX, rotY, cx, cy, fov);

        if (pL && pK && pR) {
          ctx.beginPath();
          ctx.moveTo(pL.x, pL.y);
          ctx.quadraticCurveTo(pK.x - (pL.x - pK.x) * 0.15, pK.y, pK.x, pK.y);
          ctx.quadraticCurveTo(pK.x + (pR.x - pK.x) * 0.15, pK.y, pR.x, pR.y);
          ctx.strokeStyle = (r === 6 || r === 7) ? accentSoft : softWireColor;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Deck cross beam (thwart)
          if (r === 4 || r === 8) {
            ctx.beginPath();
            ctx.moveTo(pL.x, pL.y);
            ctx.lineTo(pR.x, pR.y);
            ctx.strokeStyle = wireColor;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw primary Keel & Rails
      strokeCurve(keelPts, primaryColor, 2);
      strokeCurve(leftRailPts, wireColor, 1.6);
      strokeCurve(rightRailPts, wireColor, 1.6);

      // Angled steering paddle / rudder
      const paddleZ = 85;
      const pTop = project(20, -45, paddleZ - 30, rotX, rotY, cx, cy, fov);
      const pBottom = project(55, 45, paddleZ + 35, rotX, rotY, cx, cy, fov);
      if (pTop && pBottom) {
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBottom.x, pBottom.y);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Paddle blade
        const pBladeTip = project(62, 58, paddleZ + 48, rotX, rotY, cx, cy, fov);
        if (pBladeTip) {
          ctx.beginPath();
          ctx.moveTo(pBottom.x, pBottom.y);
          ctx.lineTo(pBladeTip.x, pBladeTip.y);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }
      }

      // 3. Glowing Structural Nodes at Bow, Stern & Center
      const keyNodes = [
        project(0, getRailY(-1), -lengthZ, rotX, rotY, cx, cy, fov), // Bow
        project(0, getRailY(1), lengthZ, rotX, rotY, cx, cy, fov),   // Stern
        project(0, getKeelY(0), 0, rotX, rotY, cx, cy, fov),        // Keel Mid
        project(-maxBeam * 0.95, getRailY(0), 0, rotX, rotY, cx, cy, fov), // Mid Left
        project(maxBeam * 0.95, getRailY(0), 0, rotX, rotY, cx, cy, fov)   // Mid Right
      ];

      keyNodes.forEach((node) => {
        if (!node) return;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3 * node.scale, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Floating Stardust Sparks rising upward
      sparks.forEach((s) => {
        s.y += s.vy;
        if (s.y < -90) {
          s.y = 70;
          s.x = (Math.random() - 0.5) * 320;
          s.z = (Math.random() - 0.5) * 320;
        }

        const sp = project(s.x, s.y, s.z, rotX, rotY, cx, cy, fov);
        if (sp) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, s.size * sp.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(13, 242, 147, ${s.alpha * 0.8})`
            : `rgba(5, 150, 105, ${s.alpha * 0.7})`;
          ctx.fill();
        }
      });

      if (!reducedMotion.matches) {
        vesselAnimId = requestAnimationFrame(renderVessel);
      }
    }

    if (!reducedMotion.matches) {
      vesselAnimId = requestAnimationFrame(renderVessel);
    } else {
      renderVessel(0);
    }
  }
})();
