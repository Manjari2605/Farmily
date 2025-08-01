const API_BASE = 'https://farmily-2.onrender.com/api/orders';

function getToken() {
  return localStorage.getItem('token');
}

async function fetchAssignedOrders() {
  const res = await fetch(`${API_BASE}/delivery`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchHistory() {
  const res = await fetch(`${API_BASE}/delivery/history`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function markAsDelivered(orderId) {
  const res = await fetch(`${API_BASE}/${orderId}/update-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify({ status: 'delivered' })
  });
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function renderAssignedOrders(orders) {
  const container = document.getElementById('assignedOrders');
  if (!container) return; // Prevent error if element is missing
  if (!orders || !orders.length) {
    container.innerHTML = '<div style="color:#aaa;">No assigned orders.</div>';
    return;
  }
  container.innerHTML = '';
  orders.forEach(o => {
    const div = document.createElement('div');
    div.className = 'order-card';
    div.style = 'background:#fff3e6;border-radius:1rem;padding:1rem;margin-bottom:1rem;box-shadow:0 2px 8px #b8894a22;';
    div.innerHTML = `
      <div><b>Order ID:</b> ${o._id}</div>
      <div><b>Product:</b> ${o.items && o.items.map(i => i.product?.name).join(', ')}</div>
      <div><b>Buyer:</b> ${o.buyer && (o.buyer.fullName || o.buyer.name || o.buyer.email)}</div>
      <div><b>Quantity:</b> ${o.items && o.items.map(i => i.quantity).join(', ')}</div>
      <div><b>Status:</b> <span style='color:#3182ce;font-weight:600;'>${o.deliveryStatus}</span></div>
      <button class='deliver-btn' data-id='${o._id}' style='margin-top:0.7rem;background:#38a169;color:#fff;border:none;border-radius:0.7rem;padding:0.5rem 1.2rem;font-weight:700;cursor:pointer;'>Mark as Delivered</button>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll('.deliver-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const orderId = this.getAttribute('data-id');
      await markAsDelivered(orderId);
      loadDashboard();
    });
  });
}

function renderHistory(history) {
  const container = document.getElementById('deliveryHistory');
  if (!container) return; 
  if (!history || !history.length) {
    container.innerHTML = '<div style="color:#aaa;">No deliveries yet.</div>';
    return;
  }
  container.innerHTML = '';
  history.forEach(o => {
    const div = document.createElement('div');
    div.className = 'order-card';
    div.style = 'background:#f6fff8;border-radius:1rem;padding:1rem;margin-bottom:1rem;box-shadow:0 2px 8px #38a16922;';
    div.innerHTML = `
      <div><b>Order ID:</b> ${o._id}</div>
      <div><b>Product:</b> ${o.items && o.items.map(i => i.product?.name).join(', ')}</div>
      <div><b>Quantity:</b> ${o.items && o.items.map(i => i.quantity).join(', ')}</div>
      <div><b>Status:</b> <span style='color:#38a169;font-weight:600;'>Delivered</span></div>
    `;
    container.appendChild(div);
  });
}

async function loadDashboard() {
  const [assigned, history] = await Promise.all([
    fetchAssignedOrders(),
    fetchHistory()
  ]);
  renderAssignedOrders(assigned);
  renderHistory(history);
}


async function fetchProfileWallet() {
  const res = await fetch('https://farmily-2.onrender.com/api/auth/me', { headers: { 'Authorization': 'Bearer ' + getToken() } });
  try {
    const user = await res.json();
    const walletDiv = document.getElementById('profileWalletAmount');
    if (walletDiv) walletDiv.textContent = '₹' + (user.wallet || 0);
  } catch {}
}

function renderRecentDeliveriesTable(history) {
  const table = document.getElementById('recentDeliveriesTable');
  if (!table) return;
  if (!history || !history.length) {
    table.innerHTML = '<tr><td colspan="3" style="color:#aaa;text-align:center;padding:1.2rem;">No deliveries yet.</td></tr>';
    return;
  }
  table.innerHTML = '';
  history.forEach(o => {
    const deliveredDate = o.updatedAt ? new Date(o.updatedAt).toLocaleDateString() : '';
    table.innerHTML += `
      <tr>
        <td style="padding:0.8rem 0.5rem;">${o._id}</td>
        <td style="padding:0.8rem 0.5rem;">${o.buyer && (o.buyer.fullName || o.buyer.name || o.buyer.email) || 'N/A'}</td>
        <td style="padding:0.8rem 0.5rem;">${deliveredDate}</td>
      </tr>
    `;
  });
}

async function loadDashboard() {
  const [assigned, history] = await Promise.all([
    fetchAssignedOrders(),
    fetchHistory()
  ]);
  renderAssignedOrders(assigned);
  renderRecentDeliveriesTable(history);
  await fetchDashboardStatsAndWallet();
}

async function fetchDashboardStatsAndWallet() {
  const res = await fetch('https://farmily-2.onrender.com/api/orders/delivery/stats', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const stats = await res.json();
  document.getElementById('activeDeliveries').textContent = stats.activeDeliveries || 0;
  document.getElementById('completedToday').textContent = stats.completedToday || 0;
  document.getElementById('todaysEarnings').textContent = '₹' + (stats.todaysEarnings || 0);
  const walletDiv = document.getElementById('profileWalletAmount');
  if (walletDiv) walletDiv.textContent = '₹' + (stats.wallet || stats.todaysEarnings || 0);
}

document.addEventListener('DOMContentLoaded', loadDashboard);
