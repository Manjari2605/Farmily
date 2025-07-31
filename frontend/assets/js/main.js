// Main JS for landing page, nav, and demo user fetch
function fetchUsers(role) {
  fetch(`http://localhost:5000/api/admin/users?role=${role}`)
    .then(res => res.json())
    .then(users => {
      const userList = document.getElementById('userList');
      if (!users || users.length === 0) {
        userList.innerHTML = '<em>No users found for this role.</em>';
        return;
      }
      userList.innerHTML = users.map(u => `
        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
          <strong>${u.fullName}</strong> (${u.email})<br>
          <span style="color: #4a5568;">Phone: ${u.phone || 'N/A'} | Address: ${u.address || 'N/A'}</span>
          ${u.profile ? `<br><span style='color:#2b6cb0;'>Profile: ${JSON.stringify(u.profile)}</span>` : ''}
        </div>
      `).join('');
    })
    .catch(() => {
      document.getElementById('userList').innerHTML = '<em>Error fetching user data.</em>';
    });
}
