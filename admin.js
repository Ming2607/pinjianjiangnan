/** 商家订单管理 */

const ADMIN_KEY_STORAGE = 'jiu_admin_key';
let adminKey = sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
let orders = [];
let actionOrderId = null;
let actionType = null;

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(26,24,20,0.88)',
      color: '#F0E8DA',
      padding: '10px 20px',
      borderRadius: '2px',
      fontSize: '13px',
      zIndex: '999',
      maxWidth: '85%',
      textAlign: 'center',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

function setLoggedIn(loggedIn) {
  document.getElementById('adminLogin').hidden = loggedIn;
  document.getElementById('adminList').hidden = !loggedIn;
  document.getElementById('refreshBtn').hidden = !loggedIn;
}

async function loadOrders() {
  orders = await fetchAllOrders(adminKey);
  renderOrders();
}

function renderStats() {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const shipped = orders.filter((o) => o.status === 'shipped').length;
  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><strong>${orders.length}</strong><span>全部</span></div>
    <div class="stat-card highlight"><strong>${pending}</strong><span>待处理</span></div>
    <div class="stat-card"><strong>${shipped}</strong><span>已发货</span></div>`;
}

function renderOrders() {
  renderStats();
  const container = document.getElementById('adminOrders');

  if (!orders.length) {
    container.innerHTML = '<div class="orders-empty">暂无订单</div>';
    return;
  }

  container.innerHTML = orders.map(renderAdminOrderCard).join('');
}

function renderAdminOrderCard(order) {
  const st = getStatusInfo(order);
  const date = new Date(order.createdAt).toLocaleString('zh-CN');
  const addr = formatFullAddress(order.customer);
  const items = (order.items || [])
    .map((i) => `<li>${i.name}（${i.spec}）× ${i.qty} · ¥${i.subtotal}</li>`)
    .join('');

  let extra = '';
  if (order.status === 'shipped' && order.trackingNo) {
    extra = `<div class="order-extra">快递单号：<strong>${order.trackingNo}</strong></div>`;
  }
  if (order.status === 'cancelled' && order.cancelReason) {
    extra = `<div class="order-extra cancel-reason">取消原因：${order.cancelReason}</div>`;
  }

  let actions = '';
  if (order.status === 'pending') {
    actions = `
      <div class="admin-actions">
        <button class="admin-btn ship" data-action="ship" data-id="${order.id}">标记发货</button>
        <button class="admin-btn cancel" data-action="cancel" data-id="${order.id}">取消订单</button>
      </div>`;
  }

  return `
    <div class="order-card admin-order-card">
      <div class="order-card-head">
        <span class="order-id">${order.id}</span>
        <span class="order-status ${st.className}">${st.label}</span>
      </div>
      <div class="order-date">${date}</div>
      <ul class="order-items">${items}</ul>
      <div class="order-customer">
        <div>${order.customer.name} · ${order.customer.phone}</div>
        <div class="order-address">${addr}</div>
        ${order.customer.note ? `<div class="order-note">备注：${order.customer.note}</div>` : ''}
      </div>
      ${extra}
      <div class="order-meta"><span>合计</span><strong>¥${order.total}</strong></div>
      ${actions}
    </div>`;
}

function openActionModal(type, orderId) {
  actionType = type;
  actionOrderId = orderId;
  const order = orders.find((o) => o.id === orderId);
  const modal = document.getElementById('actionModal');
  const title = document.getElementById('actionModalTitle');
  const body = document.getElementById('actionModalBody');

  if (type === 'ship') {
    title.textContent = '标记已发货';
    body.innerHTML = `
      <p class="action-hint">订单 ${orderId}</p>
      <label><span>快递单号</span>
        <input type="text" id="trackingNoInput" placeholder="请输入快递单号" required />
      </label>
      <button class="submit-btn" id="confirmActionBtn">确认发货</button>`;
  } else {
    title.textContent = '取消订单';
    body.innerHTML = `
      <p class="action-hint">将向顾客展示取消原因</p>
      <label><span>取消原因</span>
        <textarea id="cancelReasonInput" rows="3" placeholder="如：库存不足、地址无法配送等" required></textarea>
      </label>
      <button class="submit-btn danger" id="confirmActionBtn">确认取消</button>`;
  }

  modal.classList.add('show');
}

function closeActionModal() {
  document.getElementById('actionModal').classList.remove('show');
  actionOrderId = null;
  actionType = null;
}

async function confirmAction() {
  const btn = document.getElementById('confirmActionBtn');
  btn.disabled = true;

  try {
    if (actionType === 'ship') {
      const trackingNo = document.getElementById('trackingNoInput').value.trim();
      if (!trackingNo) throw new Error('请填写快递单号');
      await updateOrderStatus(adminKey, {
        id: actionOrderId,
        status: 'shipped',
        trackingNo,
      });
      showToast('已标记发货');
    } else {
      const cancelReason = document.getElementById('cancelReasonInput').value.trim();
      if (!cancelReason) throw new Error('请填写取消原因');
      await updateOrderStatus(adminKey, {
        id: actionOrderId,
        status: 'cancelled',
        cancelReason,
      });
      showToast('订单已取消');
    }
    closeActionModal();
    await loadOrders();
  } catch (e) {
    showToast(e.message || '操作失败');
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('adminLoginBtn').addEventListener('click', async () => {
  const key = document.getElementById('adminKeyInput').value.trim();
  if (!key) return showToast('请输入管理密钥');
  adminKey = key;
  try {
    await loadOrders();
    sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    setLoggedIn(true);
  } catch (e) {
    adminKey = '';
    showToast(e.message || '登录失败');
  }
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  loadOrders().catch((e) => showToast(e.message));
});

document.getElementById('adminOrders').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  openActionModal(btn.dataset.action, btn.dataset.id);
});

document.getElementById('closeActionModal').addEventListener('click', closeActionModal);
document.getElementById('actionModalBody').addEventListener('click', (e) => {
  if (e.target.id === 'confirmActionBtn') confirmAction();
});

if (adminKey) {
  loadOrders()
    .then(() => setLoggedIn(true))
    .catch(() => {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      adminKey = '';
    });
}
