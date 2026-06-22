# 国内部署订单 API（解决 Vercel 无法访问）

GitHub Pages 在国内可正常打开，但 **Vercel 的 API 在国内手机网络/微信里经常连不上**，会出现「提交中…」然后 **load fail**。

请用 **腾讯云云函数**（免费额度、国内节点）替代 Vercel 接收订单。

---

## 一、开通腾讯云云函数（约 10 分钟）

1. 打开 [腾讯云控制台](https://console.cloud.tencent.com/)（可用微信登录）
2. 搜索 **云函数 SCF** → 进入控制台
3. **新建** → 选择 **从头开始**
   - 函数名称：`pinjianjiangnan-order`
   - 运行环境：**Node.js 18.15**
   - 创建方式：**Web 函数**（或 函数 URL / API 网关触发，按控制台最新界面选 HTTP 访问）
4. 将 `tencent-scf/index.js` 的全部代码粘贴到在线编辑器
5. **环境变量** 添加：
   - `SERVERCHAN_SENDKEY` = 你的 Server酱 SendKey
6. **部署** 函数
7. 开启 **函数 URL** 或绑定 **API 网关**，得到 HTTPS 地址，例如：
   ```
   https://service-xxxxx.gz.apigw.tencentcs.com/release/order
   ```
   记下这个地址，后面要填进 `config.js`。

8. 测试（把地址换成你的）：
   ```bash
   curl -X POST "你的云函数地址" \
     -H "Content-Type: application/json" \
     -d '{"id":"TEST","createdAt":"2026-01-01T00:00:00Z","customer":{"name":"测","phone":"13800138000","address":"无锡"},"items":[{"name":"测试","spec":"单瓶","unit":"瓶","price":1,"qty":1,"subtotal":1}],"total":1}'
   ```
   微信收到测试通知即成功。

---

## 二、更新网站配置

编辑 `config.js`：

```javascript
window.APP_CONFIG = {
  API_BASE: 'https://service-xxxxx.gz.apigw.tencentcs.com/release/order',
};
```

注意：
- 填**完整云函数 URL**（含 `/order` 等路径，以控制台显示的为准）
- 若云函数路径不含 `/api/orders`，需与 `app.js` 中请求路径一致（见下方说明）

当前前端请求：`${API_BASE}/api/orders`

**方式 A（推荐）**：API 网关路径配置为 `/api/orders`  
**方式 B**：云函数 URL 已是完整路径时，在 `config.js` 增加：

```javascript
window.APP_CONFIG = {
  API_BASE: 'https://service-xxxxx.gz.apigw.tencentcs.com/release',
  // 或 API_PATH: '/order' 若路径不是 /api/orders
};
```

（项目已支持 `API_PATH` 自定义，默认 `/api/orders`）

---

## 三、同步到 GitHub Pages

```bash
npm run build:pages
git add config.js docs/
git commit -m "切换为国内云函数 API"
git push
```

---

## 四、Vercel 怎么办？

可保留 Vercel 作备用，但**国内用户请以腾讯云 URL 为准**。Vercel 在海外网络下仍可工作。

---

## 常见问题

**Q：还是 load fail？**  
A：确认 `config.js` 地址正确、云函数已部署、API 网关已发布。用手机浏览器（非微信）先试。

**Q：提交成功但没微信通知？**  
A：检查云函数环境变量 `SERVERCHAN_SENDKEY`，在云函数日志里看报错。

**Q：不想用腾讯云？**  
A：也可用阿里云函数计算、本地 `npm start` + cpolar 内网穿透，原理相同：需要一个**国内能访问**的 HTTPS 接口。
