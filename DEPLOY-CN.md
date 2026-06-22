# 腾讯云部署（10 分钟 · 控制台方式）

## 第一步：登录腾讯云

1. 打开 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 微信扫码登录
3. 点击 **新建环境**（选免费/按量计费，地域选 **上海** 或 **广州**）
4. 记下 **环境 ID**（形如 `pinjian-xxx`）

## 第二步：创建云函数

1. 左侧 **云函数** → **新建云函数**
2. 函数名称：`order`
3. 运行环境：**Node.js 18**
4. 创建方式：**空白函数**
5. 将 `cloudfunctions/order/index.js` **全部代码**粘贴进去
6. **环境变量** 添加：
   - 键：`SERVERCHAN_SENDKEY`
   - 值：你的 Server酱 SendKey（在 `.env` 中查看）
7. 点击 **完成** 并 **部署**

## 第三步：开启 HTTP 访问

1. 进入 `order` 函数 → **触发器** 或 **HTTP 访问服务**
2. 新建 **HTTP 访问**（路径 `/order`，方法 POST，启用 CORS）
3. 复制 **访问路径**，形如：
   ```
   https://pinjian-xxx-xxx.service.tcloudbase.com/order
   ```

## 第四步：更新网站（在项目目录执行）

```bash
cd /Users/mingyang/Desktop/jiu

# 把下方地址换成你复制的 HTTP 地址（不含 /order 的路径部分）
node scripts/set-api-url.js https://pinjian-xxx-xxx.service.tcloudbase.com

# 若你的地址已含 /order，还需在 config.js 里设 API_PATH: '/order'
```

`set-api-url.js` 会自动更新 `config.js` 并同步 `docs/`。

然后推送：

```bash
git add config.js docs/
git commit -m "切换腾讯云订单 API"
git push
```

## 第五步：测试

1. 打开 https://ming2607.github.io/pinjianjiangnan/
2. 加购 → 结算 → 提交
3. 微信应收 Server酱 通知

---

## 命令行方式（可选）

已安装 CloudBase CLI，也可：

```bash
npx cloudbase login          # 微信扫码
npm run deploy:tencent         # 按提示输入环境 ID
node scripts/set-api-url.js https://你的域名.service.tcloudbase.com
git add . && git commit -m "切换腾讯云" && git push
```

---

## config.js 最终示例

```javascript
window.APP_CONFIG = {
  API_BASE: 'https://pinjian-xxx.service.tcloudbase.com',
  API_PATH: '/order',   // CloudBase 用 /order，Vercel 用 /api/orders
};
```
