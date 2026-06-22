/** Server酱 通知 — Vercel / 本地共用 */

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

async function notifyServerChan(message, title = '品鉴江南 · 新订单') {
  const key = process.env.SERVERCHAN_SENDKEY?.trim();
  if (!key) {
    return { ok: false, error: '未配置 SERVERCHAN_SENDKEY' };
  }

  const resp = await fetch(`https://sctapi.ftqq.com/${key}.send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ title, desp: message }),
  });

  const json = await resp.json();
  if (json.code === 0) return { ok: true };
  return { ok: false, error: json.message || '发送失败' };
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { formatOrderMessage, notifyServerChan, setCors };
