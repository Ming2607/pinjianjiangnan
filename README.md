# 江南大学 · 特色伴手礼订购系统

移动端下单界面，支持白酒与伴手礼分类选购、购物车结算，以及多种订单通知方式。

## 公开访问（GitHub Pages + Vercel）

无需云服务器，免费对外公开。完整步骤见 **[DEPLOY.md](./DEPLOY.md)**。

简要流程：
1. 代码 push 到 GitHub
2. [Vercel](https://vercel.com) 导入仓库，配置 `SERVERCHAN_SENDKEY` 环境变量
3. 把 Vercel 地址写入 `config.js`，执行 `npm run build:pages`
4. 启用 GitHub Pages（`/docs` 目录或 GitHub Actions）

## 本地开发

```bash
cd /Users/mingyang/Desktop/jiu
npm install
npm start
```

浏览器打开 **http://localhost:3000**，手机在同一 WiFi 下访问 `http://<电脑IP>:3000` 即可体验。

## 界面说明

| 区域 | 内容 |
|------|------|
| 左侧分类 | 江南大学士、至善韵、中秋佳品 |
| 江南大学士 | 4 款白酒，可选 **单瓶** / **成箱** 价格 |
| 至善韵 | 1 款白酒 |
| 中秋佳品 | 无锡老字号花雕熟醉蟹 |
| 购物车 | 底部抽屉，支持改数量、结算 |
| 下单 | 填写姓名、手机、地址后提交 |

商品价格在 `data.js` 中修改。

## 微信通知（Server酱 · 方案 A）

新订单会自动推送到你的微信。按以下步骤配置（约 3 分钟）：

### 第一步：注册并获取 SendKey

1. 手机打开 **[https://sct.ftqq.com/](https://sct.ftqq.com/)**
2. 点击「登入/注册」，**微信扫码**登录
3. 进入 **[SendKey 页面](https://sct.ftqq.com/sendkey)**，复制你的 SendKey（形如 `SCTxxxxxxxx`）
4. 在同一页面确认已绑定**微信接收通道**（默认通过方糖服务号推送）

> 免费版每天可推送 5 条，对个人伴手礼订单通常够用。

### 第二步：写入配置

编辑项目根目录的 `.env` 文件：

```
SERVERCHAN_SENDKEY=SCT你的SendKey粘贴在这里
```

### 第三步：重启并测试

```bash
npm start
npm run test-notify
```

若配置正确，你的微信会收到一条「通知测试」消息。之后每次有人下单，都会收到类似内容：

```
【新订单】ORD1739...
时间：2026/6/22 14:30:00
客户：张三
电话：13800138000
地址：江苏省无锡市...
---
江南大学士·典藏（单瓶）× 2 = ¥336
合计：¥336
```

### 常见问题

| 问题 | 解决方法 |
|------|----------|
| 收不到消息 | 确认 SendKey 正确、未有多余空格；微信关注方糖服务号 |
| 免费版只看标题 | 点击消息卡片进入详情查看完整订单 |
| 超过 5 条/天 | 升级 Server酱 订阅会员，或次日重置 |


## 查看订单

- 本地文件：`orders.json`（所有历史订单）
- API：`GET http://localhost:3000/api/orders`

## 文件结构

```
jiu/
├── index.html      # 页面结构
├── styles.css      # 移动端样式
├── data.js         # 商品与价格数据
├── app.js          # 前端交互逻辑
├── server.js       # 订单接收 + 通知
├── .env.example    # 环境变量模板
└── orders.json     # 订单存储（运行后自动生成）
```

## 上线部署

1. 购买云服务器（阿里云/腾讯云轻量应用服务器）
2. 绑定已备案域名（如需微信支付则必须）
3. 使用 PM2 运行 `node server.js`
4. Nginx 反向代理 + HTTPS
5. 配置 `.env` 通知渠道

如需对接微信支付，需申请微信商户号，后续可扩展。
