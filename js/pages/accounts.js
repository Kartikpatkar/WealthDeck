import { getAllAccounts, saveAccount } from '../services/accountService.js';

export async function renderAccounts() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Accounts...</div>`;
  
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
          <div class="mono" style="font-weight: bold;">$${(a.balance || 0).toFixed(2)}</div>
        </div>
      `).join('');
    }

    main.innerHTML = `
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
            <input type="text" id="acc-name" placeholder="Account Name (e.g. Wallet)" required style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;">
            <select id="acc-type" required style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="wallet">Wallet</option>
            </select>
            <input type="number" step="0.01" id="acc-balance" placeholder="Initial Balance" style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;">
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
      const type = document.getElementById('acc-type').value;
      const balance = parseFloat(document.getElementById('acc-balance').value) || 0;
      
      await saveAccount({ name, type, balance });
      modal.style.display = 'none';
      renderAccounts(); // Re-render
    });

  } catch (err) {
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
