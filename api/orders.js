const { formatOrderMessage, notifyOrder, setCors } = require('../lib/notify');

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const order = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!order?.customer?.name || !order?.customer?.phone) {
      return res.status(400).json({ ok: false, error: '订单信息不完整' });
    }

    const message = formatOrderMessage(order);
    const notify = await notifyOrder(message);

    return res.status(200).json({
      ok: true,
      id: order.id,
      notified: notify.ok,
      channels: notify.channels,
      notifyError: notify.error,
    });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
};
