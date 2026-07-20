import { getAllAccounts, saveAccount, deleteAccount } from '../services/accountService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  const accountColors = [
    { hex: '#6366f1' }, { hex: '#10b981' }, { hex: '#f43f5e' },
    { hex: '#f59e0b' }, { hex: '#0ea5e9' }, { hex: '#8b5cf6' },
    { hex: '#ec4899' }, { hex: '#14b8a6' }
  ];

  container.innerHTML = `<div class="loading">Loading Accounts...</div>`;
  
  try {
    const accounts = await getAllAccounts();
    
    let accountsList = '';
    if (accounts.length === 0) {
      accountsList = `<div class="hint" style="margin-top:40px;">No accounts yet. Add your first one.</div>`;
    } else {
      accountsList = accounts.map(a => {
        const bal = (a.balance || 0) / 100;
        const color = a.color || '#6366f1';
        return `
          <div class="account-card" data-id="${a.id}">
            <div class="strip" style="background:${color}"></div>
            <div class="type">${a.type}</div>
            <div class="name">${a.name}</div>
            <div class="bal" style="color:${bal < 0 ? 'var(--color-expense)' : 'var(--text-primary)'}">${formatCurrency(bal * 100)}</div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 19px; font-weight: 700;">Accounts</h2>
        <button id="add-account-btn" class="icon-btn" aria-label="Add account" style="color:var(--color-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div class="accounts-grid" id="accountsGrid">
        ${accountsList}
      </div>
      
      <!-- ADD ACCOUNT MODAL -->
      <div class="modal-overlay" id="add-account-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Account</h3>
            <button type="button" class="modal-close" id="close-acc-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-account-form">
            <input type="hidden" id="acc-id">
            
            <div class="field">
              <label>Account Name</label>
              <input type="text" id="acc-name" placeholder="e.g. HDFC Savings" required>
            </div>
            
            <div class="field-row">
              <div class="field">
                <label>Type</label>
                <select id="acc-type" required>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
              <div class="field">
                <label>Currency</label>
                <select id="acc-currency" required>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
            
            <div class="field-row">
              <div class="field" style="flex: 1;">
                <label>Initial Balance</label>
                <input type="number" step="0.01" id="acc-balance" placeholder="0.00">
              </div>
            </div>
            
            <div class="field" style="margin-bottom: 24px;">
              <label>Color</label>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${accountColors.map((c, i) => `
                  <label style="cursor: pointer; position: relative;">
                    <input type="radio" name="acc-color" value="${c.hex}" ${i === 0 ? 'checked' : ''} style="position: absolute; opacity: 0;">
                    <div class="acc-color-swatch" style="width: 32px; height: 32px; border-radius: 50%; background: ${c.hex}; border: 2px solid transparent; transition: 0.2s;"></div>
                  </label>
                `).join('')}
                <label style="cursor: pointer; position: relative;" title="Custom Color">
                  <input type="radio" name="acc-color" value="custom" style="position: absolute; opacity: 0;">
                  <div class="acc-color-swatch custom-swatch-btn" style="width: 32px; height: 32px; border-radius: 50%; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); border: 2px solid transparent; transition: 0.2s; display: flex; align-items: center; justify-content: center;"></div>
                  <input type="color" id="acc-custom-color-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                </label>
              </div>
            </div>
            
            <div class="field" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="acc-default" style="width:18px; height:18px;">
              <label for="acc-default" style="margin:0;">Set as Default Account</label>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-acc-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save account</button>
            </div>
          </form>
        </div>
      </div>
      <style>
        input[name="acc-color"]:checked + .acc-color-swatch {
          border-color: var(--text-primary) !important;
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      </style>
    `;

    // Row click -> Edit
    const listEl = document.getElementById('accountsGrid');
    listEl.addEventListener('click', (e) => {
      const card = e.target.closest('.account-card');
      if(!card) return;
      const id = Number(card.dataset.id);
      const acc = accounts.find(a => a.id === id);
      if (acc) {
        document.getElementById('acc-id').value = acc.id;
        document.getElementById('acc-name').value = acc.name;
        document.getElementById('acc-type').value = acc.type;
        document.getElementById('acc-balance').value = ((acc.balance || 0) / 100).toFixed(2);
        document.getElementById('acc-currency').value = acc.currency || localStorage.getItem('wealthdeck_currency') || 'USD';
        const colorInput = document.querySelector(`input[name="acc-color"][value="${acc.color}"]`);
        if (colorInput) {
          colorInput.checked = true;
        } else {
          // It's a custom color
          const customRadio = document.querySelector('input[name="acc-color"][value="custom"]');
          if (customRadio) {
            customRadio.value = acc.color;
            customRadio.checked = true;
            document.querySelector('.custom-swatch-btn').style.background = acc.color;
          } else {
            document.querySelector('input[name="acc-color"]').checked = true; // Fallback to first
          }
        }
        document.getElementById('acc-default').checked = acc.isDefault || false;
        
        document.getElementById('delete-acc-btn').style.display = 'block';
        openModal();
      }
    });

    // Handle Custom Color Picker
    const customRadio = document.querySelector('input[name="acc-color"][value="custom"]');
    const customInput = document.getElementById('acc-custom-color-input');
    const customBtn = document.querySelector('.custom-swatch-btn');
    
    if (customRadio && customInput) {
      customRadio.addEventListener('change', () => {
        if (customRadio.checked) {
          customRadio.value = 'custom'; // reset value so it triggers properly
          customInput.click();
        }
      });
      
      customInput.addEventListener('input', (e) => {
        customRadio.value = e.target.value;
        customBtn.style.background = e.target.value;
        customRadio.checked = true;
      });
    }

    // Delete Button
    document.getElementById('delete-acc-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('acc-id').value);
      if (id && await confirmModal('Delete Account', 'Are you sure? Related transactions will NOT be deleted.')) {
        await deleteAccount(id);
        closeModal();
        render(container);
      }
    });

    // Setup modal overlay clicks
    const modalOverlay = document.getElementById('add-account-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-acc-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }
    
    // FAB Click
      document.getElementById('add-account-btn').addEventListener('click', () => {
      document.getElementById('add-account-form').reset();
      document.getElementById('acc-id').value = '';
      
      // Select a random color for a new account so it doesn't match the accent or first color every time
      const randomColor = accountColors[Math.floor(Math.random() * accountColors.length)].hex;
      const colorInput = document.querySelector(`input[name="acc-color"][value="${randomColor}"]`);
      if (colorInput) colorInput.checked = true;
      if (customRadio) {
        customRadio.value = 'custom';
        customBtn.style.background = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';
      }

      document.getElementById('acc-currency').value = localStorage.getItem('wealthdeck_currency') || 'USD';
      document.getElementById('delete-acc-btn').style.display = 'none';
      openModal();
    });
    
    // Form Submit
    document.getElementById('add-account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('acc-name').value,
        type: document.getElementById('acc-type').value,
        balance: parseFloat(document.getElementById('acc-balance').value) || 0,
        currency: document.getElementById('acc-currency').value,
        color: document.querySelector('input[name="acc-color"]:checked').value,
        isDefault: document.getElementById('acc-default').checked,
        icon: 'default-icon',
        isArchived: false
      };
      
      const idStr = document.getElementById('acc-id').value;
      if (idStr) payload.id = Number(idStr);

      await saveAccount(payload);
      closeModal();
      render(container); // Re-render
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

export function destroy() {}
