# 独木舟 · 数字航行

个人品牌静态网站，部署于 https://idumuzhou.github.io/ 。

- `index.html`：个人首页。
- `pocket.html`：互动掌机页面，支持屏幕按钮和键盘操作。
- `css/pocket.css`、`js/pocket.js`：掌机外观与菜单交互。
- `404.html`：GitHub Pages 为不存在的地址提供的自定义错误页。
- `css/site.css`、`js/site.js`：响应式布局、双语、主题和轻量视差。
- `assets/`：原创舟形 SVG Logo、PNG 图标、深浅两套独木舟主视觉及字体。

使用 `python3 -m http.server 8000` 可预览首页。Python 默认服务器不会自动使用 `404.html`；可直接打开它检查样式。线上 GitHub Pages 会用该文件处理旧文章等不存在的路径并返回 HTTP 404。

语言默认中文，主题默认跟随系统；浏览器偏好沿用 `dumu-language` 和 `dumu-theme`。禁用 JavaScript 时仍可阅读中文首页，主题通过系统配色自动匹配。

主视觉由内置 imagegen 生成，Logo 使用原创 SVG 路径。Barlow Condensed 许可证见 `assets/FONT-LICENSE.txt`。
