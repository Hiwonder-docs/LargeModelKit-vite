# LargeModelKit 单版本部署说明

本项目只部署 `latest`。旧 ROSOrin 多版本模板已替换，不需要 `content/`、Starter、Standard 或 Advanced 目录。

## 目录结构

```text
docs/
├── index.md
├── docs/                  # 4 个章节；第三章单文件包含 16 节教学课程
├── _static/               # 源图片和 PDF
├── public/                # 图标、Logo
└── .vitepress/            # 配置和主题
scripts/                   # 单版本启动、构建和发布
projects/LargeModelKit/en/latest/  # 生成的静态站点
index.html                 # 仓库根目录入口
```

## 自有站点或 Nginx 代理

执行 `npm run build`，资源前缀默认为 `/projects/LargeModelKit/en/latest/`。
将生成目录放到站点根目录对应位置。无需 PHP 或后端服务即可阅读文档。

若继续使用 GitHub Pages 作为 Nginx 上游，GitHub Pages 设置为 `main` 分支的根目录，
代理位置和上游路径示例为：

```nginx
location /projects/LargeModelKit/en/latest/ {
    proxy_pass https://Hiwonder-docs.github.io/LargeModelKit-vite/projects/LargeModelKit/en/latest/;
    proxy_set_header Host Hiwonder-docs.github.io;
    proxy_ssl_server_name on;
}
```

此方案生成的资源路径面向代理域名；直接打开 GitHub Pages 时，资源可能因缺少仓库前缀而 404。
服务器已有配置应先检查再应用，上述配置未自动写入服务器。

## 直接访问 GitHub Pages

PowerShell 中执行：

```powershell
$env:DOCS_BASE = '/LargeModelKit-vite/projects/LargeModelKit/en/latest/'
npm run build
Remove-Item Env:DOCS_BASE
```

将源文件和 `projects/` 构建产物提交、推送后，设置 Pages 使用 `main`、`/(root)`。
保留根目录 `.nojekyll`，否则 `_static` 等目录可能被忽略。

地址：`https://Hiwonder-docs.github.io/LargeModelKit-vite/projects/LargeModelKit/en/latest/`。

## 发布前检查

1. `npm run build` 成功，且没有缺失资源警告。
2. 首页跳转到 `1. Kit Introduction.html`。
3. 侧栏包含 4 个章节，第三章的 16 节课程均跳转到合并页面内的对应标题。
4. 图片、搜索、章节跳转和 PDF 能打开。
5. 发布目录包含 `_static/shared/pdf/chapter_3/1.pdf`、`2.pdf` 和 `3.pdf`。
6. 发布资源的 URL 前缀与最终站点路径一致。

反馈组件默认使用 `https://www.hiwonder.net/english-course-feedback`。
若使用其他接口，在构建前设置 `VITE_FEEDBACK_API_URL`；接口可用性和 CORS 需在最终站点验证。
