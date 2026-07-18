export function confirmModal(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'block';
    
    overlay.innerHTML = `
      <div class="card modal-content">
        <h2>${title}</h2>
        <p style="margin: var(--spacing-md) 0;">${message}</p>
        <div class="modal-actions">
          <button class="btn confirm-cancel">Cancel</button>
          <button class="btn btn--primary confirm-ok" style="background: var(--color-expense);">Confirm</button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(overlay);
    
    const cleanup = () => overlay.remove();
    
    overlay.querySelector('.confirm-cancel').addEventListener('click', () => { cleanup(); resolve(false); });
    overlay.querySelector('.confirm-ok').addEventListener('click', () => { cleanup(); resolve(true); });
  });
}
