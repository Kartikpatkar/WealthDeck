import { getAllAccounts, saveAccount } from '../services/accountService.js';
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
          <div class="mono" style="font-weight: bold;">${formatCurrency(a.balance || 0)}</div>
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
      <div id="add-account-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 20vh auto;">
          <h2>New Account</h2>
          <form id="add-account-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="text" id="acc-name" placeholder="Account Name (e.g. Wallet)" required class="input">
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
            <input type="color" id="acc-color" value="#6366f1" required class="input" style="height: 40px; padding: 2px;">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-modal-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Event Listeners
    const modal = document.getElementById('add-account-modal');
    document.getElementById('add-account-btn').addEventListener('click', () => modal.style.display = 'block');
    document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-account-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('acc-name').value;
      await saveAccount({ 
        name, 
        type: document.getElementById('acc-type').value,
        balance: parseFloat(document.getElementById('acc-balance').value) || 0,
        currency: document.getElementById('acc-currency').value,
        color: document.getElementById('acc-color').value,
        icon: 'default-icon',
        isArchived: false
      });
      modal.style.display = 'none';
      render(container); // Re-render
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

export function destroy() {}
