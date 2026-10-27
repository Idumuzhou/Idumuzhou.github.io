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
    try { localStorage.setItem(key, value); } catch (_) { /* Private browsing may disable storage. */ }
  };
  const savedTheme = read('dumu-theme');
  let theme = ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';
  let language = read('dumu-language') === 'en' ? 'en' : 'zh';

  root.classList.add('js');

  function applyTheme() {
    const effectiveTheme = theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme;
    root.dataset.theme = effectiveTheme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = effectiveTheme === 'dark' ? '#111112' : '#f8f8f7';
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
      mountActiveSvga();
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
    if (theme === 'system') {
      applyTheme();
      mountActiveSvga();
    }
  });

  const svgaStage = document.querySelector('[data-visual-stage]');
  const svgaCanvases = [...document.querySelectorAll('[data-svga]')];
  const svgaPlayers = new Map();

  async function mountSvga(canvas) {
    if (!svgaStage || !canvas || !window.SVGA?.Parser || !window.SVGA?.Player) return false;
    if (svgaPlayers.has(canvas)) {
      const mounted = await svgaPlayers.get(canvas);
      if (mounted) svgaStage.classList.add('is-svga-ready');
      return mounted;
    }
    const promise = (async () => {
      try {
        const parser = new SVGA.Parser({ isDisableWebWorker: false });
        const data = await parser.load(canvas.dataset.svga);
        const player = new SVGA.Player(canvas);
        await player.mount(data);
        if (!reducedMotion.matches) player.start();
        canvas.dataset.svgaMounted = 'true';
        return true;
      } catch (_) {
        canvas.dataset.svgaMounted = 'false';
        return false;
      }
    })();
    svgaPlayers.set(canvas, promise);
    const mounted = await promise;
    if (mounted) svgaStage.classList.add('is-svga-ready');
    return mounted;
  }

  function mountActiveSvga() {
    if (!svgaStage || !svgaCanvases.length) return;
    svgaStage.classList.remove('is-svga-ready');
    const activeClass = root.dataset.theme === 'light' ? 'light-art' : 'dark-art';
    const canvas = svgaCanvases.find((item) => item.classList.contains(activeClass));
    mountSvga(canvas);
  }

  applyTheme();
  applyLanguage();
  mountActiveSvga();

  const revealItems = document.querySelectorAll('[data-reveal]');
  const tagWords = document.querySelectorAll('[data-tag-word]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
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
})();
