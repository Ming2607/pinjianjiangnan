/**
 * 江南大学伴手礼 — 订单后端
 * 接收前端订单，并通过多种渠道通知管理员
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

function formatOrderMessage(order) {
  const lines = [
    `【新订单】${order.id}`,
    `时间：${new Date(order.createdAt).toLocaleString('zh-CN')}`,
    `客户：${order.customer.name}`,
    `电话：${order.customer.phone}`,
    `地址：${order.customer.address}`,
  ];
  if (order.customer.note) lines.push(`备注：${order.customer.note}`);
  lines.push('---');
  order.items.forEach((i) => {
    lines.push(`${i.name}（${i.spec}）× ${i.qty} = ¥${i.subtotal}`);
  });
  lines.push(`合计：¥${order.total}`);
  return lines.join('\n');
}

/** Server酱 Turbo → 微信（方案 A） */
function notifyServerChan(message, title = '品鉴江南 · 新订单') {
  const key = process.env.SERVERCHAN_SENDKEY?.trim();
  if (!key) {
    return Promise.resolve({ ok: false, error: '未配置 SERVERCHAN_SENDKEY' });
  }

  const body = new URLSearchParams({ title, desp: message }).toString();
  const url = new URL(`https://sctapi.ftqq.com/${key}.send`);

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.code === 0) {
              console.log('[Server酱] 微信通知已发送');
              resolve({ ok: true });
            } else {
              console.error('[Server酱] 发送失败:', json.message || data);
              resolve({ ok: false, error: json.message || data });
            }
          } catch {
            console.error('[Server酱] 响应异常:', data);
            resolve({ ok: false, error: data });
          }
        });
      }
    );
    req.on('error', (e) => {
      console.error('[Server酱] 请求失败:', e.message);
      resolve({ ok: false, error: e.message });
    });
    req.write(body);
    req.end();
  });
}

async function notifyOrder(order) {
  const message = formatOrderMessage(order);
  const result = await notifyServerChan(message);
  if (!result.ok) {
    console.log('\n── 新订单（微信通知未发出，已本地保存）──');
    console.log(result.error || '请检查 .env 中的 SERVERCHAN_SENDKEY');
    console.log(message + '\n');
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
        const notify = await notifyOrder(order);
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

  // POST /api/test-notify — 测试微信通知是否配置正确
  if (req.method === 'POST' && req.url === '/api/test-notify') {
    const result = await notifyServerChan(
      '这是一条测试消息。\n\n若您在微信收到此通知，说明 Server酱 已配置成功，新订单将自动推送到您的微信。',
      '品鉴江南 · 通知测试'
    );
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
  const key = process.env.SERVERCHAN_SENDKEY?.trim();
  console.log(`\n品鉴江南｜江大伴手礼`);
  console.log(`本地访问：http://localhost:${PORT}`);
  console.log(`手机访问：http://<你的局域网IP>:${PORT}\n`);
  if (key) {
    console.log('微信通知：Server酱 已配置 ✓');
    console.log(`测试命令：curl -X POST http://localhost:${PORT}/api/test-notify\n`);
  } else {
    console.log('微信通知：未配置');
    console.log('1. 打开 https://sct.ftqq.com/ 微信扫码登录');
    console.log('2. 复制 SendKey 到 .env 文件的 SERVERCHAN_SENDKEY=');
    console.log('3. 重启服务后执行：curl -X POST http://localhost:' + PORT + '/api/test-notify\n');
  }
});
