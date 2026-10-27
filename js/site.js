(() => {
  'use strict';

  const root = document.documentElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const appearance = document.querySelector('.appearance');
  const summary = appearance.querySelector('summary');
  const isNotFound = document.body.dataset.page === '404';
  const read = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* Private browsing may disable storage. */ }
  };
  const savedTheme = read('dumu-theme');
  let theme = ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';
  let language = read('dumu-language') === 'en' ? 'en' : 'zh';

  function applyTheme() {
    const effectiveTheme = theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme;
    root.dataset.theme = effectiveTheme;
    document.querySelector('meta[name="theme-color"]').content = effectiveTheme === 'dark' ? '#0a0b0e' : '#f5f6f8';
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
      : (english ? 'Dumuzhou · A digital voyage' : '独木舟 · 数字航行');
    const description = english
      ? 'A personal space by Dumuzhou. Discipline gives me freedom. Learning and exploring technology.'
      : '独木舟的个人空间。自律给我自由，记录学习，探索技术。';
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
  }

  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      theme = button.dataset.themeChoice;
      save('dumu-theme', theme);
      applyTheme();
      appearance.open = false;
      summary.focus();
    });
  });
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      language = button.dataset.lang;
      save('dumu-language', language);
      applyLanguage();
    });
  });
  document.addEventListener('click', (event) => {
    if (!appearance.contains(event.target)) appearance.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && appearance.open) {
      appearance.open = false;
      summary.focus();
    }
  });
  systemTheme.addEventListener('change', () => {
    if (theme === 'system') applyTheme();
  });
  applyTheme();
  applyLanguage();

  const hero = document.querySelector('.hero');
  if (!hero) return;
  const motion = matchMedia('(pointer: fine) and (min-width: 901px) and (prefers-reduced-motion: no-preference)');
  const resetMotion = () => {
    hero.style.setProperty('--move-x', '0px');
    hero.style.setProperty('--move-y', '0px');
  };
  hero.addEventListener('pointermove', (event) => {
    if (!motion.matches) return;
    const bounds = hero.getBoundingClientRect();
    const x = Math.max(-8, Math.min(8, (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 16));
    const y = Math.max(-8, Math.min(8, (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 16));
    hero.style.setProperty('--move-x', `${x}px`);
    hero.style.setProperty('--move-y', `${y}px`);
  });
  hero.addEventListener('pointerleave', resetMotion);
  motion.addEventListener('change', resetMotion);
})();
