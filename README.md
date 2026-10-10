# AiBlock Large Model Kit Documentation

本项目使用 VitePress，只提供 `latest` 单版本英文文档。

## 本地启动

已安装依赖时直接运行：

```powershell
npm run dev
```

打开终端显示的地址，默认是 `http://localhost:5173/projects/LargeModelKit/en/latest/`。
首次安装或重新下载项目时执行 `npm ci`，建议使用 Node.js 22 LTS。

## 编辑位置

- `docs/docs/`：Markdown 文档，包含 16 篇教学案例。
- `docs/_static/`：图片、PDF 等源资源。
- `docs/index.md` 和 `docs/docs/index.md`：跳转到 Kit Introduction 的入口。
- `docs/.vitepress/config.mts`：标题、发布路径、搜索、Markdown 配置。
- `docs/.vitepress/autoSidebar.mts`：按章节文件和同名目录自动生成侧栏。
- `docs/.vitepress/theme/`：页面布局、图片查看器、PDF 和反馈组件。

源文档和资源必须保留并提交；启动、构建不会复制或删除这些源目录。

## 构建和预览

```powershell
npm run build
npm run preview
```

`build` 先生成 `docs/.vitepress/dist/`，再发布到 `projects/LargeModelKit/en/latest/`，
同时转换 PNG/JPEG 为 WebP、复制 PDF；超过 4000 万像素的装配图保留原格式以避免编码内存不足。`preview` 预览 VitePress 原始构建目录，
发布目录还应检查图片和 PDF。

若只需构建、不生成发布目录，可用 `npm run docs:build`；之后执行
`npm run docs:stage-main` 生成发布目录。`build:latest` 和 `build:all` 均只构建 latest。

## 部署

默认资源路径是 `/projects/LargeModelKit/en/latest/`，适用于自有站点根目录或现有 Nginx 代理：

```text
https://wiki-test.hiwonder.com/projects/LargeModelKit/en/latest/
```

将 `projects/LargeModelKit/en/latest/` 放到站点的相同目录。
如果部署在 phpStudy 的项目子目录，须让 `DOCS_BASE` 包含实际 URL 子目录，或给项目配置独立站点。

若直接使用 GitHub Pages，需要额外包含仓库名，不能沿用默认 base：

```powershell
$env:DOCS_BASE = '/LargeModelKit-vite/projects/LargeModelKit/en/latest/'
npm run build
Remove-Item Env:DOCS_BASE
```

提交源文件和生成的 `projects/` 后，在 GitHub 的 Settings > Pages 选择
Deploy from a branch、`main`、`/(root)`，保留根目录 `.nojekyll`。
直接访问地址为：

```text
https://Hiwonder-docs.github.io/LargeModelKit-vite/projects/LargeModelKit/en/latest/
```

GitHub Pages 直接访问与 Nginx 代理的 URL 前缀不同，应按最终访问路径构建。
详细说明见 [部署说明](./MULTI_VERSION_DEPLOY.md)。
