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

  /* A small wooden boat sailing through layered, rolling waves. */
  const vesselStage = document.getElementById('visual-stage');
  const vesselCanvas = document.getElementById('vessel-canvas');
  const sailingPosition = document.getElementById('sailing-position');
  if (vesselCanvas && vesselStage && sailingPosition) {
    const ctx = vesselCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let visible = true;
    let manual = false;
    let position = 0.5;
    let frame = 0;

    function resizeVessel() {
      const rect = vesselStage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      vesselCanvas.width = Math.round(width * dpr);
      vesselCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion.matches) draw(0);
    }

    function wave(y, depth, phase, top, bottom, time) {
      const x0 = 42, x1 = 558;
      const waveY = (x) => y + Math.sin((x - x0) * 0.055 + phase + time * 1.15) * 6;
      ctx.beginPath();
      ctx.moveTo(x0, waveY(x0));
      for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, waveY(x));
      ctx.bezierCurveTo(x1 + 12, y + 8, x1 + 12, y + depth - 6, x1, y + depth);
      for (let x = x1; x >= x0; x -= 4) ctx.lineTo(x, waveY(x) + depth);
      ctx.bezierCurveTo(x0 - 12, y + depth - 6, x0 - 12, y + 8, x0, waveY(x0));
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, y - 8, 0, y + depth + 8);
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, bottom);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(218, 239, 255, .38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = x0 + 2; x <= x1 - 2; x += 4) {
        if (x === x0 + 2) ctx.moveTo(x, waveY(x) + 2);
        else ctx.lineTo(x, waveY(x) + 2);
      }
      ctx.stroke();
    }

    function boat(x, y, time) {
      ctx.save();
      ctx.translate(x, y + Math.sin(time * 1.7 + x * .02) * 3);
      ctx.rotate(Math.sin(time * 1.35 + x * .02) * .025);
      // Sail and mast: softly shaded linen and pale wood.
      let sail = ctx.createLinearGradient(-105, -150, 55, -20);
      sail.addColorStop(0, '#fffefa');
      sail.addColorStop(.7, '#f8f5e9');
      sail.addColorStop(1, '#d8d4c7');
      ctx.fillStyle = sail;
      ctx.beginPath();
      ctx.moveTo(2, -160);
      ctx.bezierCurveTo(-9, -146, -43, -100, -105, -38);
      ctx.quadraticCurveTo(-54, -35, 2, -39);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(199, 191, 168, .38)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const mast = ctx.createLinearGradient(-2, 0, 5, 0);
      mast.addColorStop(0, '#a97839'); mast.addColorStop(.45, '#f3d39b'); mast.addColorStop(1, '#bf8b4c');
      ctx.fillStyle = mast;
      ctx.beginPath(); ctx.roundRect(-2, -162, 6, 177, 3); ctx.fill();
      // Dark inner rim, then curved wooden hull.
      ctx.fillStyle = '#b27c43';
      ctx.beginPath(); ctx.ellipse(0, 3, 100, 17, 0, 0, Math.PI * 2); ctx.fill();
      const inner = ctx.createLinearGradient(0, -12, 0, 22);
      inner.addColorStop(0, '#e4bd83'); inner.addColorStop(1, '#bd884d');
      ctx.fillStyle = inner;
      ctx.beginPath(); ctx.ellipse(0, 3, 95, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-100, 3); ctx.bezierCurveTo(-94, 22, -86, 48, -65, 56);
      ctx.bezierCurveTo(-38, 68, 38, 68, 65, 56);
      ctx.bezierCurveTo(86, 48, 94, 22, 100, 3);
      ctx.bezierCurveTo(75, 18, -75, 18, -100, 3); ctx.closePath();
      const wood = ctx.createLinearGradient(-100, 0, 100, 58);
      wood.addColorStop(0, '#f6d8a7'); wood.addColorStop(.35, '#e7bd82'); wood.addColorStop(.7, '#f5d6a1'); wood.addColorStop(1, '#c9955d');
      ctx.fillStyle = wood; ctx.fill(); ctx.clip();
      // Fine grain gives the hull a tactile, carved finish.
      for (let i = -90; i <= 90; i += 9) {
        ctx.beginPath(); ctx.moveTo(i, 7); ctx.bezierCurveTo(i - 3, 26, i + 4, 45, i + 1, 65);
        ctx.strokeStyle = i % 18 === 0 ? 'rgba(155, 105, 52, .15)' : 'rgba(255, 245, 216, .24)';
        ctx.lineWidth = 1.3; ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = '#fbe4bd'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 3, 99, 16, 0, 0, Math.PI); ctx.stroke();
      ctx.restore();
    }

    function draw(time) {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 600, height / 400);
      ctx.save();
      ctx.translate((width - 600 * scale) / 2, (height - 400 * scale) / 2 - 30 * scale);
      ctx.scale(scale, scale);
      wave(245, 62, 0, '#83b9f3', '#285caa', time);
      wave(255, 66, 1.2, '#a1c9f6', '#3975c7', time);
      wave(265, 67, 2.3, '#7eaff0', '#285fae', time);
      boat(150 + position * 300, 218, time);
      wave(286, 68, 3.1, '#a5cdf7', '#4d87d1', time);
      wave(300, 66, 4.2, '#a9cff7', '#699ee0', time);
      ctx.restore();
      sailingPosition.style.setProperty('--progress', `${position * 100}%`);
    }

    function animate(timestamp) {
      if (visible && !document.hidden) {
        const time = timestamp / 1000;
        if (!manual) {
          position = .5 + .43 * Math.sin(time * .28);
          sailingPosition.value = String(Math.round(position * 100));
        }
        draw(time);
      }
      frame = requestAnimationFrame(animate);
    }

    sailingPosition.addEventListener('input', () => {
      manual = true;
      position = Number(sailingPosition.value) / 100;
      if (reducedMotion.matches) draw(0);
    });
    window.addEventListener('resize', resizeVessel, { passive: true });
    reducedMotion.addEventListener('change', () => {
      cancelAnimationFrame(frame);
      if (reducedMotion.matches) draw(0);
      else frame = requestAnimationFrame(animate);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: .05 }).observe(vesselStage);
    }
    resizeVessel();
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
  }
})();
