const { notifyServerChan, setCors } = require('../lib/notify');

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const result = await notifyServerChan(
    '这是一条测试消息。\n\n若您在微信收到此通知，说明 Server酱 已配置成功，新订单将自动推送到您的微信。',
    '品鉴江南 · 通知测试'
  );

  return res.status(result.ok ? 200 : 500).json(result);
};
