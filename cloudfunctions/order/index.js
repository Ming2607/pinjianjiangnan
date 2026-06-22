'use strict';
const https = require('https');

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

function notifyServerChan(message, title = '品鉴江南 · 新订单') {
  const key = process.env.SERVERCHAN_SENDKEY?.trim();
  if (!key) return Promise.resolve({ ok: false, error: '未配置 SERVERCHAN_SENDKEY' });

  const body = new URLSearchParams({ title, desp: message }).toString();
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'sctapi.ftqq.com',
        path: `/${key}.send`,
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
            resolve(json.code === 0 ? { ok: true } : { ok: false, error: json.message });
          } catch {
            resolve({ ok: false, error: data });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.write(body);
    req.end();
  });
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const order = JSON.parse(event.body || '{}');
    if (!order?.customer?.name || !order?.customer?.phone) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ ok: false, error: '订单信息不完整' }),
      };
    }

    const notify = await notifyServerChan(formatOrderMessage(order));
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        ok: true,
        id: order.id,
        notified: notify.ok,
        notifyError: notify.ok ? undefined : notify.error,
      }),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ ok: false, error: e.message }),
    };
  }
};
