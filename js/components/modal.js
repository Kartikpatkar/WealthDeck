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
      <div class="prompt-modal">
        <h3>${title}</h3>
        <p>${message}</p>
        <input type="text" class="input prompt-input" placeholder="${placeholder}">
        <div class="prompt-actions">
          <button class="btn btn--secondary prompt-cancel">Cancel</button>
          <button class="btn prompt-ok">Save</button>
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
