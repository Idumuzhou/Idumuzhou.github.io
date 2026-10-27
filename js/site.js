(() => {
  const translations = {
    'Dumuzhou | 个人主页与博客': 'Dumuzhou | Personal website & journal',
    '全部文章 | Dumuzhou': 'All articles | Dumuzhou',
    '2019 年文章 | Dumuzhou': 'Articles from 2019 | Dumuzhou',
    '2019 年 3 月文章 | Dumuzhou': 'Articles from March 2019 | Dumuzhou',
    'Android面试经 | Dumuzhou': 'Android interview notes | Dumuzhou',
    'Android动态获取权限 | Dumuzhou': 'Android runtime permissions | Dumuzhou',
    '跳转到正文': 'Skip to content', '首页': 'Home', '文章': 'Journal', '个人空间': 'DIGITAL JOURNAL',
    '自律给我自由！': 'Discipline gives me freedom.', '记录学习，分享思考。': 'Learning, building, and sharing ideas.',
    '在这里，留下关于技术的点滴。': 'A place for notes on technology.', '阅读文章': 'Explore the journal', '访问 GitHub': 'Visit GitHub',
    '文字': 'Ideas', '与': ' & ', '记录': 'notes', '一些关于 Android 与学习的记录。': 'Notes on Android and the process of learning.',
    '所有文章': 'All articles', '文章归档': 'JOURNAL ARCHIVE', '记录学习过程中的思考与发现。': 'Thoughts and discoveries from the journey of learning.',
    '3 篇文章': '3 ARTICLES', '关于 Android 的一张图。': 'A visual note on Android.', 'Android面试经': 'Android interview notes',
    'Java 与 Android 面试题的记录。': 'Notes on Java and Android interview questions.', 'Android动态获取权限': 'Android runtime permissions',
    '关于 Android 权限和权限组的笔记。': 'Notes on Android permissions and permission groups.',
    '保持好奇，': 'Stay curious,', '持续探索。': 'keep exploring.', '← 返回首页': '← Back to home', '← 返回文章归档': '← Back to journal',
    '继续阅读': 'READ NEXT', 'Java 面试题': 'Java interview questions', 'Android 面试题': 'Android interview questions',
    '敏感权限': 'Dangerous permissions', '权限组': 'Permission groups',
    '所有危险的 Android 系统权限都属于权限组。如果设备运行的是 Android 6.0（API 级别 23），并且应用的 targetSdkVersion 是 23 或更高版本，则当用户请求危险权限时系统会发生以下行为：': 'All dangerous Android system permissions belong to permission groups. On Android 6.0 (API level 23), when an app targets API level 23 or higher and requests a dangerous permission, the following behavior applies:',
    '如果应用请求其清单中列出的危险权限，而应用目前在权限组中没有任何权限，则系统会向用户显示一个对话框，描述应用要访问的权限组。对话框不描述该组内的具体权限。例如，如果应用请求 READ_CONTACTS 权限，系统对话框只说明该应用需要访问设备的联系信息。如果用户批准，系统将向应用授予其请求的权限。': 'If an app requests a dangerous permission listed in its manifest and has no permission in that group, the system displays a dialog describing the permission group, not the specific permission. For example, a request for READ_CONTACTS is described as access to contact information. If approved, the requested permission is granted.',
    '如果应用请求其清单中列出的危险权限，而应用在同一权限组中已有另一项危险权限，则系统会立即授予该权限，而无需与用户进行任何交互。例如，如果某应用已经请求并且被授予了 READ_CONTACTS 权限，然后它又请求 WRITE_CONTACTS，系统将立即授予该权限。': 'If an app requests a dangerous permission listed in its manifest and already has another dangerous permission in the same group, the system immediately grants it without further interaction. For example, if READ_CONTACTS was already granted, a subsequent request for WRITE_CONTACTS is granted immediately.',
    '任何权限都可属于一个权限组，包括正常权限和应用定义的权限。但权限组仅当权限危险时才影响用户体验。可以忽略正常权限的权限组。': 'Any permission may belong to a permission group, including normal and app-defined permissions. Permission groups affect the user experience only for dangerous permissions; groups for normal permissions can be ignored.',
    '如果设备运行的是 Android 5.1（API 级别 22）或更低版本，并且应用的 targetSdkVersion 是 22 或更低版本，则系统会在安装时要求用户授予权限。再': 'On Android 5.1 (API level 22) or earlier, when the app targets API level 22 or earlier, the system asks for permissions during installation. ',
    '次强调，系统只告诉用户应用需要的权限组，而不告知具体权限。': 'Again, it shows the required permission groups rather than individual permissions.',
    '表 1. 危险权限和权限组。': 'Table 1. Dangerous permissions and permission groups.', '| 权限组 | 权限 |': '| Permission group | Permissions |'
  };
  const read = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const languageButton = document.querySelector('.language-button');
  const themeSelect = document.querySelector('.theme-select');
  const themeLabel = document.querySelector('.theme-label');
  const originals = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, .site-controls')) continue;
    const key = node.nodeValue.trim();
    if (Object.prototype.hasOwnProperty.call(translations, key)) originals.push({ node, original: node.nodeValue, key });
  }
  const originalTitle = document.title;
  let language = read('dumu-language') === 'en' ? 'en' : 'zh';
  let theme = read('dumu-theme');
  if (!['system', 'light', 'dark'].includes(theme)) theme = 'system';
  function applyLanguage() {
    const english = language === 'en';
    document.documentElement.lang = english ? 'en' : 'zh-CN';
    originals.forEach(({ node, original, key }) => {
      node.nodeValue = english ? original.replace(key, translations[key]) : original;
    });
    document.title = english ? (translations[originalTitle] || originalTitle) : originalTitle;
    languageButton.innerHTML = english ? '中文 <span aria-hidden="true">↗</span>' : 'EN <span aria-hidden="true">↗</span>';
    languageButton.setAttribute('aria-label', english ? '切换到中文' : 'Switch to English');
    const label = english ? 'Color theme' : '主题';
    themeLabel.textContent = label;
    themeSelect.setAttribute('aria-label', label);
    const choices = english ? ['System', 'Light', 'Dark'] : ['跟随系统', '浅色', '深色'];
    Array.from(themeSelect.options).forEach((option, i) => { option.textContent = choices[i]; });
    document.querySelector('nav').setAttribute('aria-label', english ? 'Main navigation' : '主导航');
    document.querySelector('.brand').setAttribute('aria-label', english ? 'Dumuzhou home' : 'Dumuzhou 首页');
    document.querySelectorAll('.headerlink[title]').forEach((link) => {
      if (!link.dataset.originalTitle) link.dataset.originalTitle = link.title;
      link.title = english ? (translations[link.dataset.originalTitle] || link.dataset.originalTitle) : link.dataset.originalTitle;
    });
  }
  function applyTheme() {
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    themeSelect.value = theme;
  }
  languageButton.addEventListener('click', () => { language = language === 'zh' ? 'en' : 'zh'; save('dumu-language', language); applyLanguage(); });
  themeSelect.addEventListener('change', () => { theme = themeSelect.value; save('dumu-theme', theme); applyTheme(); });
  applyLanguage();
  applyTheme();
})();
