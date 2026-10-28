(() => {
  'use strict';
  const consoleEl = document.getElementById('console');
  const screen = document.getElementById('screen');
  const power = document.querySelector('.power-switch');
  if (!consoleEl || !screen || !power) return;
  document.title = '掌上独木舟 · Dumuzhou';

  const items = ['ABOUT ME', 'SELECTED WORK', 'MY TOOLKIT', 'SAY HELLO'];
  const person = `<svg class="pixel-person" viewBox="0 0 16 22" aria-hidden="true" shape-rendering="crispEdges"><path fill="#314b2b" d="M4 0h8v1h2v2h1v6h-2v2h-1v1h2v2h1v5h-3v-3h-1v6H8v-5H7v5H4v-6H3v3H0v-5h1v-2h3v-1H3V9H1V3h1V1h2z"/><path fill="#aabd79" d="M4 5h8v4h-1v2H5V9H4z"/><path fill="#314b2b" d="M5 6h1v1H5zm5 0h1v1h-1zM7 9h2v1H7z"/></svg>`;
  const content = [
    [
      { title: 'HELLO, I’M<br>DUMUZHOU.', text: 'Android developer and product builder.<br>I turn ideas into things people can use.', small: 'HANGZHOU · STILL BUILDING' },
      { title: 'KEEP<br>EXPLORING.', text: 'Learning in public, making sense of problems, and leaving room for the next attempt.', small: 'CURIOSITY IS THE CHEAT CODE' }
    ],
    [
      { title: 'BUILD.<br>SHIP. LEARN.', text: 'From a rough idea to something real.<br>Each release is a chance to learn.', small: 'PRODUCT · UI · ARCHITECTURE', symbol: '✳' },
      { title: 'OPEN<br>HORIZONS.', text: 'Explore the things I build and the ideas I share on GitHub.', small: 'A : VISIT GITHUB', symbol: '⌘', link: true }
    ],
    [
      { title: 'MOBILE<br>EXPERIENCES.', text: 'Android / Kotlin<br>Jetpack Compose<br>Interface systems', small: '01 / BUILD FOR PEOPLE', symbol: '▦' },
      { title: 'SYSTEMS<br>&amp; IDEAS.', text: 'Go / Redis / PostgreSQL<br>Product / Architecture<br>AI / Exploration', small: '02 / KEEP EXPLORING', symbol: '✦' }
    ],
    [
      { title: 'LET’S MAKE<br>SOMETHING GOOD.', text: 'Have an idea in mind?<br>Find me on GitHub.', small: 'A : VISIT GITHUB', symbol: '✉', link: true }
    ]
  ];
  let on = true;
  let selected = 0;
  let section = null;
  let page = 0;

  function render() {
    if (section === null) {
      screen.innerHTML = `<div class="screen-inner"><div class="screen-top"><span>PLAYER 01</span><span>♥ ♥ ♥</span></div><div class="screen-hero">${person}<div><strong>+ DUMU<br>ZHOU.</strong><small>DEVELOPER + BUILDER</small></div></div><div class="screen-menu">${items.map((item, i) => `<button type="button" data-menu="${i}" class="${i === selected ? 'selected' : ''}"><span>${i === selected ? '▶' : '&nbsp;'}</span><span>${item}</span><span>0${i + 1}</span></button>`).join('')}</div><div class="screen-bottom">■ A LITTLE CURIOUS? PRESS A.</div></div>`;
      return;
    }
    const detail = content[section][page];
    screen.innerHTML = `<div class="screen-inner"><div class="screen-top"><span>${items[section]}</span><span>${page + 1}/${content[section].length}</span></div><div class="screen-detail ${detail.symbol ? 'center' : ''}">${detail.symbol ? `<span class="pixel-symbol">${detail.symbol}</span><h2>${detail.title}</h2>` : `<div class="detail-heading">${person}<h2>${detail.title}</h2></div>`}<p>${detail.text}</p><span class="detail-small">${detail.small}</span>${detail.link ? '<button class="screen-cta" type="button" data-github>A : OPEN GITHUB ↗</button>' : ''}${content[section].length > 1 ? `<span class="screen-pages">◀ ${page + 1} / ${content[section].length} ▶</span>` : ''}</div><div class="screen-footer"><span>B : BACK</span><span>START : HOME</span></div></div>`;
  }

  function control(key) {
    if (!on) return;
    if (key === 'start') { section = null; page = 0; }
    else if (key === 'b' || key === 'select') { section = null; page = 0; }
    else if (section === null) {
      if (key === 'up' || key === 'left') selected = (selected + items.length - 1) % items.length;
      if (key === 'down' || key === 'right') selected = (selected + 1) % items.length;
      if (key === 'a') { section = selected; page = 0; }
    } else {
      if (key === 'left' || key === 'up') page = (page + content[section].length - 1) % content[section].length;
      if (key === 'right' || key === 'down') page = (page + 1) % content[section].length;
      if (key === 'a' && content[section][page].link) window.open('https://github.com/Idumuzhou', '_blank', 'noopener,noreferrer');
    }
    render();
  }

  power.addEventListener('click', () => {
    on = !on;
    consoleEl.classList.toggle('off', !on);
    power.setAttribute('aria-pressed', String(on));
    if (on) { section = null; page = 0; render(); }
  });
  document.querySelectorAll('[data-control]').forEach((button) => button.addEventListener('click', () => control(button.dataset.control)));
  screen.addEventListener('click', (event) => {
    if (!on) return;
    if (event.target.closest('[data-github]')) {
      window.open('https://github.com/Idumuzhou', '_blank', 'noopener,noreferrer');
      return;
    }
    const menu = event.target.closest('[data-menu]');
    if (!menu) return;
    selected = Number(menu.dataset.menu);
    section = selected; page = 0; render();
  });
  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && event.target.closest('a, button') && (event.key === 'Enter' || event.key === ' ')) return;
    const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', z: 'a', Z: 'a', x: 'b', X: 'b', Enter: 'start', Escape: 'b' };
    const action = keys[event.key];
    if (action) { event.preventDefault(); control(action); }
  });
  render();
})();
