import { getAllAccounts, saveAccount, deleteAccount } from '../services/accountService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
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
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            
            <div class="field-row">
              <div class="field" style="flex: 2;">
                <label>Initial Balance</label>
                <input type="number" step="0.01" id="acc-balance" placeholder="0.00">
              </div>
              <div class="field" style="flex: 1;">
                <label>Color</label>
                <input type="color" id="acc-color" value="#6366f1" required style="height:44px; padding:2px;">
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-acc-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save account</button>
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
        document.getElementById('acc-currency').value = acc.currency || 'INR';
        document.getElementById('acc-color').value = acc.color || '#6366f1';
        
        document.getElementById('delete-acc-btn').style.display = 'block';
        openModal();
      }
    });

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
      document.getElementById('delete-acc-btn').style.display = 'none';
      openModal();
    });
    
    // Form Submit
    document.getElementById('add-account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('acc-name').value,
        type: document.getElementById('acc-type').value,
        balance: Math.round((parseFloat(document.getElementById('acc-balance').value) || 0) * 100),
        currency: document.getElementById('acc-currency').value,
        color: document.getElementById('acc-color').value,
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
