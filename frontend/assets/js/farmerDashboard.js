
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('uploadProductForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();
      const price = parseFloat(document.getElementById('price').value);
      const quantity = parseInt(document.getElementById('quantity').value);
      const category = document.getElementById('category').value;
      const image = document.getElementById('image').value.trim();
      if (!image) {
        alert('Image URL is required!');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/products/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ name, description, price, quantity, category, image })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Product uploaded!');
          uploadForm.reset();
          renderMyProducts();
          renderSummary();
        } else {
          alert(data.error || 'Upload failed');
        }
      } catch (err) {
        alert('Error uploading product');
      }
    });
  }
  renderMyProducts();
  renderSummary();
  renderRecentOrders();
});

async function renderMyProducts() {
  const list = document.getElementById('myProductList');
  if (!list) return;
  list.innerHTML = '<div style="color:#aaa;">Loading...</div>';
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const products = await res.json();
    // Only show products by this farmer
    const user = await getCurrentUser();
    const myProducts = products.filter(p => p.farmer && p.farmer._id === user._id);
    if (!myProducts.length) {
      list.innerHTML = '<div style="color:#aaa;">No products yet.</div>';
      return;
    }
    list.innerHTML = '';
    myProducts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style = 'background:#fff3e6;border-radius:1rem;box-shadow:0 2px 8px #b8894a22;padding:1rem;display:flex;gap:1rem;align-items:center;';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" style="width:70px;height:70px;object-fit:cover;border-radius:0.7rem;">
        <div style="flex:1;">
          <div style="font-weight:700;color:#b8894a;font-size:1.1rem;">${p.name}</div>
          <div style="color:#a78a5a;font-size:0.98rem;">${p.category} | Qty: ${p.quantity} | ₹${p.price}/kg</div>
        </div>
        <button class="delete-btn" data-id="${p._id}" style="background:#e53e3e;color:#fff;border:none;border-radius:0.5rem;padding:0.4rem 0.9rem;cursor:pointer;font-weight:600;">Delete</button>
      `;
      card.querySelector('.delete-btn').addEventListener('click', async function() {
        if (confirm('Delete this product?')) {
          try {
            const res = await fetch(`${API_BASE}/products/${p._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            const data = await res.json();
            if (res.ok) {
              alert('Product deleted');
              renderMyProducts();
              renderSummary();
            } else {
              alert(data.error || 'Delete failed');
            }
          } catch (err) {
            alert('Error deleting product');
          }
        }
      });
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = '<div style="color:#e53e3e;">Error loading products</div>';
  }
}

async function renderSummary() {
    let debugEarnings = [];
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const products = await res.json();
    const user = await getCurrentUser();
    const myProducts = products.filter(p => p.farmer && p.farmer._id === user._id);
    document.getElementById('summaryTotalProducts').textContent = myProducts.length;
    const ordersRes = await fetch(`${API_BASE}/orders`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
    const orders = await ordersRes.json();
    let totalOrders = 0;
    let earnings = 0;
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.product.farmer && (item.product.farmer._id === user._id || item.product.farmer == user._id)) {
            totalOrders++;
            let counted = false;
            if (order.paidToFarmer === true) {
              earnings += item.product.price * item.quantity;
              counted = true;
            } else if ((order.paidToFarmer === undefined || order.paidToFarmer === null) && ["wallet","upi","card"].includes(order.paymentMethod)) {
              earnings += item.product.price * item.quantity;
              counted = true;
            }
            debugEarnings.push({orderId: order._id, paymentMethod: order.paymentMethod, paidToFarmer: order.paidToFarmer, price: item.product.price, quantity: item.quantity, counted});
          }
        });
      }
    });
    console.log('Earnings debug:', debugEarnings);
    document.getElementById('summaryOrders').textContent = totalOrders;
    document.getElementById('summaryEarnings').textContent = '₹' + earnings;
  } catch (err) {
    // fallback
    document.getElementById('summaryTotalProducts').textContent = '0';
    document.getElementById('summaryEarnings').textContent = '₹0';
    document.getElementById('summaryOrders').textContent = '0';
  }
}

async function renderRecentOrders() {
  const table = document.getElementById('recentOrdersTable');
  if (!table) return;
  table.innerHTML = '<tr><td colspan="8" style="color:#aaa;">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_BASE}/orders`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
    const orders = await res.json();
    const user = await getCurrentUser();
    console.log('Farmer dashboard orders:', orders.map(o => ({
      id: o._id,
      deliveryAgent: o.deliveryAgent,
      deliveryStatus: o.deliveryStatus
    })));
    let myOrderRows = [];
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.product.farmer && item.product.farmer._id === user._id) {
            // Payment status logic
            let paymentBadge = '';
            if (order.paymentMethod === 'cod') {
              if (order.paidToFarmer) {
                paymentBadge = '<span class="badge-paid">Completed</span>';
              } else {
                paymentBadge = '<span class="badge-pending">Pending Payment</span>';
              }
            } else if (["wallet", "upi", "card"].includes(order.paymentMethod)) {
              paymentBadge = '<span class="badge-paid">Completed</span>';
            } else {
              paymentBadge = `<span class="badge-pending">${order.paymentMethod || 'Pending'}</span>`;
            }
            let statusBadge = '';
            if (order.status === 'delivered') statusBadge = '<span class="badge-delivered">Delivered</span>';
            else statusBadge = '<span class="badge-accepted">Accepted</span>';
            let paymentMethodText = order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A';
            let buyerName = order.buyer && (order.buyer.fullName || order.buyer.name || order.buyer.email) ? (order.buyer.fullName || order.buyer.name || order.buyer.email) : 'Unknown';
            let row = `
              <tr>
                <td style="padding:0.7rem 0.5rem;">${order._id}</td>
                <td style="padding:0.7rem 0.5rem;">${item.product.name}</td>
                <td style="padding:0.7rem 0.5rem;">${buyerName}</td>
                <td style="padding:0.7rem 0.5rem;">${item.quantity}</td>
                <td style="padding:0.7rem 0.5rem;">₹${item.product.price * item.quantity}</td>
                <td style="padding:0.7rem 0.5rem;">${paymentBadge}<br><span style='font-size:0.9em;color:#a78a5a;'>${paymentMethodText}</span></td>
                <td style="padding:0.7rem 0.5rem;">${statusBadge}</td>
              </tr>
            `;
            if (!order.deliveryAgent) {
              row += `<td><button class="accept-btn" onclick="openAssignModal('${order._id}')">Assign Delivery</button></td>`;
            } else {
              if (order.deliveryStatus === 'pending') {
                row += `<td><span style='color:#f7b84b;font-weight:700;'>Waiting for delivery agent</span></td>`;
              } else if (order.deliveryStatus === 'picked_up') {
                row += `<td><span style='color:#3182ce;font-weight:700;'>Out for delivery</span></td>`;
              } else if (order.deliveryStatus === 'delivered') {
                row += `<td><span style='color:#38a169;font-weight:700;'>Delivered</span></td>`;
              } else {
                row += `<td>Assigned</td>`;
              }
            }
            myOrderRows.push(row);
          }
        });
      }
    });
    if (!myOrderRows.length) {
      table.innerHTML = '<tr><td colspan="8" style="color:#aaa;">No orders yet.</td></tr>';
      return;
    }
    table.innerHTML = myOrderRows.join('');
  } catch (err) {
    table.innerHTML = '<tr><td colspan="8" style="color:#e53e3e;">Error loading orders</td></tr>';
  }
}


async function getCurrentUser() {
  if (window._currentUser) return window._currentUser;
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { 'Authorization': 'Bearer ' + getToken() } });
  const user = await res.json();
  window._currentUser = user;
  return user;
}

window.assignAgent = async function(orderId) {
  const agentId = document.getElementById('agentSelect').value;
  await fetch(`https://farmily-2.onrender.com/api/orders/${orderId}/assign-delivery`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    body: JSON.stringify({ deliveryAgentId: agentId })
  });
  closeAssignModal();
  if (typeof renderRecentOrders === 'function') {
    await renderRecentOrders();
  } else {
    location.reload();
  }
}
