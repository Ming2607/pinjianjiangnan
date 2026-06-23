/** 订单通知 — Server酱 / 企业微信机器人 */

function formatOrderMessage(order) {
  const addr =
    order.customer.address ||
    `${order.customer.province || ''}${order.customer.city || ''}${order.customer.district || ''}${order.customer.detail || ''}`;
  const lines = [
    `【新订单】${order.id}`,
    `时间：${new Date(order.createdAt).toLocaleString('zh-CN')}`,
    `客户：${order.customer.name}`,
    `电话：${order.customer.phone}`,
    `地址：${addr}`,
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

/** 企业微信群机器人 → 群内消息（开启微信同步后个人微信也会提醒） */
async function notifyWeCom(message) {
  const url = process.env.WECOM_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, error: '未配置 WECOM_WEBHOOK_URL' };
  }
  if (!url.includes('qyapi.weixin.qq.com/cgi-bin/webhook/send')) {
    return { ok: false, error: 'WECOM_WEBHOOK_URL 格式不正确' };
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'text',
      text: { content: message },
    }),
  });

  let json;
  try {
    json = await resp.json();
  } catch {
    return { ok: false, error: '企业微信响应异常' };
  }

  if (json.errcode === 0) return { ok: true };
  return { ok: false, error: json.errmsg || '企业微信发送失败' };
}

/** 已配置的渠道都会发送，任一成功即视为 notified */
async function notifyOrder(message, title = '品鉴江南 · 新订单') {
  const channels = {};
  const tasks = [];

  if (process.env.WECOM_WEBHOOK_URL?.trim()) {
    tasks.push(
      notifyWeCom(message).then((r) => {
        channels.wecom = r;
      })
    );
  }
  if (process.env.SERVERCHAN_SENDKEY?.trim()) {
    tasks.push(
      notifyServerChan(message, title).then((r) => {
        channels.serverchan = r;
      })
    );
  }

  if (!tasks.length) {
    return {
      ok: false,
      error: '未配置通知渠道，请在 .env 填写 WECOM_WEBHOOK_URL 或 SERVERCHAN_SENDKEY',
      channels,
    };
  }

  await Promise.all(tasks);
  const ok = Object.values(channels).some((r) => r.ok);
  const errors = Object.entries(channels)
    .filter(([, r]) => !r.ok)
    .map(([name, r]) => `${name}: ${r.error}`)
    .join('; ');

  return { ok, channels, error: ok ? undefined : errors || '全部通知渠道失败' };
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = {
  formatOrderMessage,
  notifyServerChan,
  notifyWeCom,
  notifyOrder,
  setCors,
};
