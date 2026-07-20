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
      accountsList = `<div class="hint mod-style-c43a02">No accounts yet. Add your first one.</div>`;
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
      <div class="mod-style-1b4308">
        <h2 class="mod-style-09251a">Accounts</h2>
        <button class="icon-btn mod-style-3bb313" id="add-account-btn"  aria-label="Add account">
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
            <button class="modal-close" type="button"  id="close-acc-modal" aria-label="Close">
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
              <div class="field mod-style-49cdf8">
                <label>Initial Balance</label>
                <input type="number" step="0.01" id="acc-balance" placeholder="0.00">
              </div>
            </div>
            
            <div class="field mod-style-dc2cb2">
              <label>Color</label>
              <div class="mod-style-9551b6">
                ${accountColors.map((c, i) => `
                  <label class="mod-style-1034c1">
                    <input class="mod-style-628c86" type="radio" name="acc-color" value="${c.hex}" ${i === 0 ? 'checked' : ''}>
                    <div class="acc-color-swatch color-swatch-sm" style="background: ${c.hex};"></div>
                  </label>
                `).join('')}
                <label class="mod-style-1034c1" title="Custom Color" style="position:relative;">
                  <input class="mod-style-628c86" type="radio" name="acc-color" value="custom">
                  <div class="acc-color-swatch color-swatch-sm custom-swatch-btn mod-style-e93ae7" style="background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);"></div>
                  <input class="mod-style-2a85bc" type="color" id="acc-custom-color-input" style="opacity:0; position:absolute; inset:0; width:100%; height:100%; cursor:pointer;">
                </label>
              </div>
            </div>
            
            <div class="field mod-style-492ec0">
              <input class="mod-style-075519" type="checkbox" id="acc-default">
              <label class="mod-style-46dcee" for="acc-default">Set as Default Account</label>
            </div>

            <div class="mod-style-3fbd1a">
              <button class="btn btn--secondary mod-style-1da7e6" type="button"  id="delete-acc-btn">Delete</button>
              <button class="btn mod-style-d5e8c5" type="submit">Save account</button>
            </div>
          </form>
        </div>
      </div>
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
          const customRadio = document.querySelector('input[name="acc-color"][value="custom"]');
          if (customRadio) {
            customRadio.checked = true;
            document.getElementById('acc-custom-color-input').value = acc.color;
            document.querySelector('.custom-swatch-btn').style.background = acc.color;
          } else {
            document.querySelector('input[name="acc-color"]').checked = true;
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
          customInput.click();
        }
      });
      
      customInput.addEventListener('input', (e) => {
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
      
      const randomColor = accountColors[Math.floor(Math.random() * accountColors.length)].hex;
      const colorInput = document.querySelector(`input[name="acc-color"][value="${randomColor}"]`);
      if (colorInput) colorInput.checked = true;
      if (customBtn) {
        customBtn.style.background = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';
      }

      document.getElementById('acc-currency').value = localStorage.getItem('wealthdeck_currency') || 'USD';
      document.getElementById('delete-acc-btn').style.display = 'none';
      openModal();
    });
    
    // Form Submit
    document.getElementById('add-account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const colorVal = document.querySelector('input[name="acc-color"]:checked').value;
      const payload = {
        name: document.getElementById('acc-name').value,
        type: document.getElementById('acc-type').value,
        balance: parseFloat(document.getElementById('acc-balance').value) * 100 || 0,
        currency: document.getElementById('acc-currency').value,
        color: colorVal === 'custom' ? document.getElementById('acc-custom-color-input').value : colorVal,
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
    container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
  }
}

export function destroy() {}
