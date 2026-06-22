# 公开访问部署指南

将项目拆成两部分，**全程免费、无需云服务器**：

| 部分 | 平台 | 作用 |
|------|------|------|
| 前端页面 | **GitHub Pages** | 商品展示、购物车、公开链接 |
| 订单 API | **Vercel** | 接收订单、微信通知（Server酱） |

---

## 第一步：推送代码到 GitHub

```bash
cd /Users/mingyang/Desktop/jiu
git init
git add .
git commit -m "品鉴江南伴手礼订购系统"
```

在 GitHub 新建仓库（例如 `jiu`），然后：

```bash
git remote add origin https://github.com/你的用户名/pinjianjiangnan.git
git branch -M main
git push -u origin main
```

> `.env` 已在 `.gitignore` 中，SendKey 不会被上传。

---

## 第二步：部署 Vercel（订单 API）

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New → Project**
3. 选择刚推送的 `jiu` 仓库，直接 **Deploy**（无需改构建设置）
4. 部署完成后，记下域名，例如：
   ```
   https://jiu-xxxx.vercel.app
   ```
5. 进入项目 **Settings → Environment Variables**，添加：

   | Name | Value |
   |------|-------|
   | `SERVERCHAN_SENDKEY` | 你的 Server酱 SendKey |

6. 保存后，到 **Deployments** 点最新部署右侧 **⋯ → Redeploy** 使环境变量生效

7. 测试 API（把域名换成你的）：

   ```bash
   curl -X POST https://jiu-xxxx.vercel.app/api/test-notify
   ```

   微信收到测试消息即成功。

---

## 第三步：配置前端 API 地址

编辑项目根目录的 `config.js`，把 `YOUR_VERCEL_URL` 换成你的 Vercel 域名：

```javascript
window.APP_CONFIG = {
  API_BASE: 'https://jiu-xxxx.vercel.app',
};
```

---

## 第四步：构建并启用 GitHub Pages

```bash
npm run build:pages
git add .
git commit -m "配置 GitHub Pages"
git push
```

在 GitHub 仓库：

1. **Settings → Pages**
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. Branch 选 **main**，文件夹选 **/docs**
4. 保存

约 1–2 分钟后，访问：

```
https://你的用户名.github.io/pinjianjiangnan/
```

（仓库名若不是 `jiu`，把 URL 里的路径改成你的仓库名。）

---

## 第五步：验证完整流程

1. 手机打开 GitHub Pages 链接
2. 加购商品 → 填写信息 → 确认订购
3. 微信应收到 Server酱 订单通知

---

## 日常更新

改完前端代码后：

```bash
npm run build:pages
git add docs/ config.js
git commit -m "更新页面"
git push
```

改 API 逻辑后，只需 `git push`，Vercel 会自动重新部署。

---

## 常见问题

**Q：GitHub Pages 打开后下单失败？**  
A：检查 `config.js` 是否已填入正确的 Vercel 地址，并重新执行 `npm run build:pages` 后 push。

**Q：Vercel 部署后 API 404？**  
A：确认仓库根目录有 `api/` 文件夹和 `vercel.json`，重新 Deploy。

**Q：收不到微信通知？**  
A：在 Vercel 环境变量中检查 `SERVERCHAN_SENDKEY`，Redeploy 后再测试 `/api/test-notify`。

**Q：订单存在哪里？**  
A：线上订单通过微信通知送达；Vercel 无持久化硬盘，不保存 `orders.json`。如需历史记录，可在微信中查看 Server酱 消息。

---

## 本地开发（不变）

```bash
npm start
# 打开 http://localhost:3000
```

本地会自动使用本机 `server.js`，不读取 `config.js` 中的 Vercel 地址。
