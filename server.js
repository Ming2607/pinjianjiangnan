/**
 * 江南大学伴手礼 — 订单后端
 * 接收前端订单，并通过多种渠道通知管理员
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

const { formatOrderMessage, notifyOrder } = require('./lib/notify');

async function notifyOrderHandler(order) {
  const message = formatOrderMessage(order);
  const result = await notifyOrder(message);
  if (!result.ok) {
    console.log('\n── 新订单（通知未发出，已本地保存）──');
    console.log(result.error || '请检查 .env 中的 WECOM_WEBHOOK_URL / SERVERCHAN_SENDKEY');
    console.log(message + '\n');
  } else if (result.channels) {
    Object.entries(result.channels).forEach(([name, r]) => {
      console.log(`[${name}] ${r.ok ? '已发送 ✓' : '失败: ' + r.error}`);
    });
  }
  return result;
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /api/orders
  if (req.method === 'POST' && req.url === '/api/orders') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const order = JSON.parse(body);
        saveOrder(order);
        const notify = await notifyOrderHandler(order);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, id: order.id, notified: notify.ok }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // GET /api/orders — 管理查看（生产环境应加鉴权）
  if (req.method === 'GET' && req.url === '/api/orders') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loadOrders()));
    return;
  }

  // POST /api/test-notify — 测试通知渠道
  if (req.method === 'POST' && req.url === '/api/test-notify') {
    const message =
      '这是一条测试消息。\n\n若您收到此通知，说明订单通知已配置成功，新订单将自动推送。';
    const result = await notifyOrder(message, '品鉴江南 · 通知测试');
    res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 静态文件
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, filePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const wecom = process.env.WECOM_WEBHOOK_URL?.trim();
  const key = process.env.SERVERCHAN_SENDKEY?.trim();
  console.log(`\n品鉴江南｜江大伴手礼`);
  console.log(`本地访问：http://localhost:${PORT}`);
  console.log(`手机访问：http://<你的局域网IP>:${PORT}\n`);
  if (wecom) console.log('通知：企业微信机器人 已配置 ✓');
  if (key) console.log('通知：Server酱 → 个人微信 已配置 ✓');
  if (wecom || key) {
    console.log(`测试命令：curl -X POST http://localhost:${PORT}/api/test-notify\n`);
  } else {
    console.log('通知：未配置');
    console.log('企业微信：node scripts/setup-wecom.js "你的Webhook地址"');
    console.log('或 Server酱：在 .env 填写 SERVERCHAN_SENDKEY\n');
  }
});
