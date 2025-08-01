
async function fetchAndRenderProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    if (!products.length) {
      productList.innerHTML = '<p style="color:#718096;">No products found.</p>';
      return;
    }
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style = 'background:#fff;border-radius:1rem;box-shadow:0 2px 12px rgba(56,161,105,0.07);padding:1.5rem;display:flex;align-items:center;gap:1.5rem;margin-bottom:1.5rem;';
      card.innerHTML = `
        <img src="${product.image || (product.images && product.images[0]) || ''}" alt="${product.name}" style="width:100px;height:100px;object-fit:cover;border-radius:0.75rem;">
        <div style="flex:1;">
          <h4 style="margin-bottom:0.5rem;color:#2d3748;">${product.name}</h4>
          <div style="font-size:0.95rem;color:#4a5568;margin-bottom:0.5rem;">
            <span><b>Category:</b> ${product.category}</span> | 
            <span><b>Location:</b> ${product.location || 'N/A'}</span>
          </div>
          <div style="font-size:1.1rem;color:#38a169;font-weight:600;">₹${product.price}/kg</div>
        </div>
        <button class="btn btn-outline" style="height:40px;">Add to Cart</button>
      `;
      productList.appendChild(card);
    });
  } catch (err) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '<p style="color:#e53e3e;">Error loading products.</p>';
  }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
