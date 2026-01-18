# 将脚本发布到 CDN 指南

## 概述

你的脚本编译后会生成 `dist/index.js`，可以通过以下几种方式发布到 CDN：

## 方案 1️⃣ - 使用 jsDelivr（推荐）

jsDelivr 是免费的 CDN，支持 GitHub 仓库。

### 步骤

1. **将代码上传到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/你的仓库.git
   git push -u origin main
   ```

2. **发布新版本**
   - 在 GitHub 上创建 Release，标签为 `v1.0.0`
   - jsDelivr 会自动镜像你的版本

3. **获取 CDN 链接**
   ```
   https://cdn.jsdelivr.net/gh/YixuanNan/nanyixuan-img-gen-helper@版本/dist/index.js
   ```

   **例如：**
   ```
   https://cdn.jsdelivr.net/gh/YixuanNan/nanyixuan-img-gen-helper@v1.0.0/dist/index.js
   ```

4. **在酒馆中使用**
   - 在酒馆助手脚本库中添加这个 URL

---

## 方案 2️⃣ - 使用 Vercel（更现代）

Vercel 是专业的边缘计算 CDN，自动部署更新。

### 步骤

1. **连接 GitHub**
   - 登录 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库

2. **配置 vercel.json**
   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": "dist"
   }
   ```

3. **自动部署**
   - 每次 push 到 GitHub 时，Vercel 会自动构建和部署
   - 获得 CDN URL：`https://你的项目.vercel.app/index.js`

---

## 方案 3️⃣ - 使用 GitHub Pages

直接用 GitHub Pages 托管静态文件。

### 步骤

1. **在 GitHub 仓库设置中启用 Pages**
   - Settings → Pages → 选择 main 分支

2. **创建 GitHub Actions 工作流**
   创建 `.github/workflows/build.yml`：
   ```yaml
   name: Build and Deploy

   on:
     push:
       branches: [ main ]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: pnpm/action-setup@v2
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **获取 CDN 链接**
   ```
   https://你的用户名.github.io/仓库名/index.js
   ```

---

## 方案 4️⃣ - 自建服务器

使用你自己的服务器或云服务。

### 步骤

1. **上传文件**
   ```bash
   # 本地编译
   pnpm build
   
   # 上传到服务器
   scp -r dist/* user@your-server.com:/var/www/html/
   ```

2. **配置 CORS**
   如果是不同域名，需要配置 CORS：
   ```nginx
   # Nginx 配置
   location /index.js {
     add_header Access-Control-Allow-Origin *;
     add_header Access-Control-Allow-Methods "GET, OPTIONS";
   }
   ```

3. **获取链接**
   ```
   https://your-server.com/index.js
   ```

---

## 方案 5️⃣ - 直接用本地服务器（开发用）

你已经有一个本地服务器 (`server.mjs`)，可以直接用！

### 使用

1. **确保服务器运行**
   ```bash
   node server.mjs
   ```

2. **在酒馆中添加脚本**
   ```
   http://localhost:8000/index.js
   ```

⚠️ **注意：** 只能在本地使用，不能在其他设备上访问

---

## 推荐方案

| 场景 | 推荐 | 原因 |
|-----|------|------|
| **生产环境** | jsDelivr | 免费、稳定、自动缓存 |
| **持续开发** | Vercel | 自动构建、版本管理好 |
| **简单快速** | 本地服务器 | 立即可用，无需配置 |
| **企业应用** | 自建服务器 | 完全控制、安全可靠 |

---

## 快速开始（jsDelivr）

### 1. 初始化 GitHub 仓库

```bash
cd c:\Users\Administrator\Desktop\tavern_helper_template

# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/YixuanNan/nanyixuan-img-gen-helper.git

# 推送
git branch -M main
git push -u origin main
```

### 2. 创建 Release

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

或在 GitHub 网站上：
- 点击 "Releases"
- 点击 "Create a new release"
- 输入标签 `v1.0.0`
- 发布

### 3. 获取 CDN URL

```
https://cdn.jsdelivr.net/gh/YixuanNan/nanyixuan-img-gen-helper@v1.0.0/dist/index.js
```

### 4. 在酒馆中使用

在酒馆助手脚本库中添加这个 URL 即可！

---

## 版本管理

每次更新代码后：

```bash
# 1. 编辑代码
# 2. 提交变更
git add .
git commit -m "Fix: [描述你的改动]"

# 3. 创建新版本
git tag v1.0.1
git push origin v1.0.1

# 4. 更新 CDN 链接中的版本号
# https://cdn.jsdelivr.net/gh/用户名/仓库@v1.0.1/dist/index.js
```

---

## 常见问题

**Q: jsDelivr 多久会更新？**
A: 通常几分钟内，但有时会缓存 24 小时。可以通过更改版本号强制更新。

**Q: 如何让最新版本自动更新？**
A: 使用 `@latest` 而不是具体版本号：
```
https://cdn.jsdelivr.net/gh/用户名/仓库@latest/dist/index.js
```

**Q: 可以在 Vercel 上直接运行 TypeScript 吗？**
A: 可以，但需要在 `vercel.json` 中配置 `buildCommand` 为 `pnpm build`

**Q: 跨域怎么解决？**
A: jsDelivr 和 Vercel 都自动支持 CORS，无需配置。

---

## 总结

你现在有以下几个选择：

1. 🟢 **立即可用**：`http://localhost:8000/index.js`（本地）
2. 🟡 **推荐发布**：`https://cdn.jsdelivr.net/gh/...`（jsDelivr）
3. 🔵 **自动更新**：`https://....vercel.app/index.js`（Vercel）

选择适合你的方案，开始分享你的脚本吧！🚀

