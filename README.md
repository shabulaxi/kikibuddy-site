# KikiBuddy · 宠物护理

一个以视频和安静日常护理为主题的中英双语展示网站，使用原生 HTML、CSS 和 JavaScript。无需框架和运行时依赖。

演示地址：[KikiBuddy](https://heroic-treacle-4cae1d.netlify.app/)。线上版本由站点维护者部署，可能与仓库进度不同。

## 本地打开

安装 Node.js 22 或更新版本，在项目目录运行：

```sh
npm run dev
```

按住 Ctrl 点击终端显示的 `http://localhost:5173/`。`npm run dev:kiki` 也可以使用。若端口被占用，先停止旧的预览，或设置 `PORT` 环境变量。

## 构建与部署

```sh
npm run build
npm run preview
```

构建输出在 `dist/`。这个文件夹包含所有页面、图片和视频，可以上传至 Netlify Drop 或任何静态托管服务。`dist/` 由构建生成，不提交到 Git。

通过 GitHub 自动更新 Netlify：在现有 Netlify 项目的部署设置中选择关联 Git 仓库，授权 GitHub 并选择本仓库与 `main` 分支。项目已提供 `netlify.toml`，构建命令是 `npm run build`，发布目录是 `dist`。完成关联后，推送代码即可触发构建。关联需要在你自己的 Netlify 账号内完成。

## 修改网站

- `src/index.html`：页面结构、标题和静态内容。
- `src/main.js`：中英文字典、产品内容、视频映射和播放控制。
- `src/styles.css`：桌面与手机样式。
- `public/assets/`：压缩后的 WebP 海报。
- `public/fonts/`：本地字体和 OFL 许可，中文标题使用 Noto Serif SC，英文标题使用 Cormorant Garamond，正文使用 Noto Sans SC。
- `public/video/`：短片与产品循环素材。
- `scripts/`：本地服务及静态构建。

修改代码后刷新本地页面即可查看；发布前重新执行 `npm run build`。添加新图片后请使用新文件名，确保与内容对应的缓存不会显示旧图。

字号和区块留白统一在 `src/styles.css` 的 `--fs-*` 和 `--space-section` 变量中设置。当前字体是包含现有中英文文案的 WOFF2 子集；新增中文字符会使用系统后备字体，扩充文案时可重新生成字体子集。页面无需访问外部字体服务。

2026-11-18 的排版整改沿用现有图片与视频，五款护理产品均提供暂停和继续播放按钮。首屏提前加载与品牌故事相同的海报，其他图片继续按视口延迟加载。

## 视频与手机加载

全站共 25 个视频位，可见面积达到 30% 后才播放，全站最多同时播放两条。产品卡片桌面悬停播放，手机点按切换；离开视口暂停。手机首屏等待点击，省流量模式不自动播放，系统减少动效时显示海报。

海报接近视口才加载，首屏不等待整站图片下载。23 张海报合计约 0.97 MB，手机首屏海报约 26 KB。首屏使用 12 秒短循环，全宽影像带使用 18 秒短片，均优先尝试 WebM，再使用 MP4。仓库不包含本地 75 秒完整版。

八款概念产品使用其产品图片制作轻微推近动效，五款护理产品使用独立的特写与使用镜头。详情见 [素材说明](docs/media.md)。

## 验证

网站预览与构建不需要 npm 依赖。运行自动化检查时安装测试依赖与 Chromium：

```sh
npm ci
npx playwright install chromium
npm run build
npm test
```

如果本机已有 Google Chrome，可设置 `KIKI_BROWSER_CHANNEL=chrome` 使用它运行测试。持续集成使用 Chromium，覆盖视频播放限制、手机点播、减少动效、海报延迟加载、媒体失败回退及视频分段响应。

## 展示范围与许可

这是展示项目。价格、购买链接、部分政策、评价和联系方式仍是示例内容；订阅表单仅做前端演示，没有发送邮件或保存数据的后端。

代码采用 [MIT](LICENSE) 许可证；品牌、产品文案与图片视频素材的许可范围见 [NOTICE](NOTICE.md)。
