import { getAllAccounts, saveAccount, deleteAccount } from '../services/accountService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Accounts...</div>`;
  
  try {
    const accounts = await getAllAccounts();
    
    let accountsList = '';
    if (accounts.length === 0) {
      accountsList = `<p>No accounts yet. Add your first one.</p>`;
    } else {
      accountsList = accounts.map(a => `
        <div class="card" style="margin-bottom: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${a.name}</strong>
            <div style="font-size: 0.8em; color: var(--text-secondary);">${a.type}</div>
          </div>
          <div style="text-align: right;">
            <div class="mono" style="font-weight: bold;">${formatCurrency(a.balance || 0)}</div>
            <div style="margin-top:4px;">
              <button class="edit-acc-btn" data-id="${a.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:0.8em; margin-right:var(--spacing-sm);">Edit</button>
              <button class="delete-acc-btn" data-id="${a.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer; font-size:0.8em;">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Accounts</h1>
        <button id="add-account-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="accounts-list">
        ${accountsList}
      </div>
      
      <!-- Basic Add Modal inline for MVP -->
      <div id="add-account-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:0; display:flex; flex-direction:column; justify-content:flex-end;">
        <div class="card modal-sheet" style="width: 100%; max-width: 500px; margin: 0 auto; background: var(--bg-surface-elevated); padding: var(--spacing-lg); max-height: 90vh; overflow-y: auto;">
          <div style="width: 40px; height: 4px; background: var(--border-light); border-radius: 2px; margin: 0 auto 16px auto;"></div>
          <h2 style="margin-bottom: var(--spacing-sm);">Account</h2>
          <form id="add-account-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="hidden" id="acc-id">
            <input type="text" id="acc-name" placeholder="Account Name" required class="input">
            <select id="acc-type" required class="input">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="wallet">Wallet</option>
              <option value="credit_card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="investment">Investment</option>
            </select>
            <input type="number" step="0.01" id="acc-balance" placeholder="Initial Balance" class="input">
            <select id="acc-currency" required class="input">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
            <input type="color" id="acc-color" value="#6366f1" required class="input" style="height: 48px; padding: 2px;">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-modal-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('accounts-list').addEventListener('click', async (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('delete-acc-btn')) {
        if (await confirmModal('Delete Account', 'Are you sure? Related transactions will NOT be deleted.')) {
          await deleteAccount(id);
          render(container);
        }
      } else if (e.target.classList.contains('edit-acc-btn')) {
        const acc = accounts.find(a => a.id === id);
        if (acc) {
          document.getElementById('acc-id').value = acc.id;
          document.getElementById('acc-name').value = acc.name;
          document.getElementById('acc-type').value = acc.type;
          document.getElementById('acc-balance').value = (acc.balance / 100).toFixed(2);
          document.getElementById('acc-color').value = acc.color || '#6366f1';
          document.getElementById('add-account-modal').style.display = 'flex';
        }
      }
    });

    // Event Listeners
    const modal = document.getElementById('add-account-modal');
    document.getElementById('add-account-btn').addEventListener('click', () => {
      document.getElementById('add-account-form').reset();
      document.getElementById('acc-id').value = '';
      modal.style.display = 'flex';
    });
    document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('acc-name').value,
        type: document.getElementById('acc-type').value,
        balance: parseFloat(document.getElementById('acc-balance').value) || 0,
        currency: document.getElementById('acc-currency').value,
        color: document.getElementById('acc-color').value,
        icon: 'default-icon',
        isArchived: false
      };
      
      const idStr = document.getElementById('acc-id').value;
      if (idStr) payload.id = Number(idStr);

      await saveAccount(payload);
      
      modal.style.display = 'none';
      render(container); // Re-render
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

export function destroy() {}
