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

export function promptModal(title, message, placeholder = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '10000'; // above others

    overlay.innerHTML = `
      <div style="max-width: 320px; width: 90%; background: var(--bg-primary); margin: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 20px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid var(--border);">
        <h3 style="margin-bottom: 8px; font-size: 18px;">${title}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">${message}</p>
        <input type="text" class="input prompt-input" placeholder="${placeholder}" style="width: 100%; margin-bottom: 24px; padding: 12px; border-radius: 12px; font-size: 15px;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn--secondary prompt-cancel" style="padding: 10px 16px; width: auto; font-size: 14px; border: none; background: transparent;">Cancel</button>
          <button class="btn prompt-ok" style="padding: 10px 20px; width: auto; font-size: 14px; box-shadow: none;">Save</button>
        </div>
      </div>
    `;

    document.getElementById('modal-container').appendChild(overlay);

    const input = overlay.querySelector('.prompt-input');
    // small timeout needed for focus to work in some browsers after DOM insertion
    setTimeout(() => input.focus(), 50);

    const cleanup = () => {
      overlay.remove();
    };

    overlay.querySelector('.prompt-cancel').addEventListener('click', () => { cleanup(); resolve(null); });
    overlay.querySelector('.prompt-ok').addEventListener('click', () => { cleanup(); resolve(input.value); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { cleanup(); resolve(input.value); }
      if (e.key === 'Escape') { cleanup(); resolve(null); }
    });
  });
}
