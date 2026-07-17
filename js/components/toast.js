export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = \`toast toast--\${type}\`;
  
  // Basic styling for the toast, keeping it inline for brevity or can be in components.css
  toast.style.padding = '12px 24px';
  toast.style.marginBottom = '10px';
  toast.style.borderRadius = '8px';
  toast.style.color = 'white';
  toast.style.backgroundColor = type === 'error' ? '#f87171' : (type === 'success' ? '#34d399' : '#6366f1');
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  
  toast.textContent = message;
  container.appendChild(toast);
  
  // Container styling to position it
  container.style.position = 'fixed';
  container.style.bottom = '80px'; // Above bottom nav
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.zIndex = '9999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Remove after 3s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
