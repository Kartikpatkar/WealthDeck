import { getAllTransactions, saveTransaction } from '../services/transactionService.js';
import { getAllAccounts } from '../services/accountService.js';
import { getAllCategories, seedDefaultCategories } from '../services/categoryService.js';

export async function renderTransactions() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Transactions...</div>`;
  
  try {
    const transactions = await getAllTransactions();
    
    let txnList = '';
    if (transactions.length === 0) {
      txnList = `<p>No transactions yet.</p>`;
    } else {
      txnList = transactions.map(t => `
        <div class="card" style="margin-bottom: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${t.merchant || t.description || 'Transaction'}</strong>
            <div style="font-size: 0.8em; color: var(--text-secondary);">${new Date(t.date).toLocaleDateString()}</div>
          </div>
          <div class="mono" style="color: ${t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}; font-weight: bold;">
            ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
          </div>
        </div>
      `).join('');
    }

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Transactions</h1>
        <button id="add-txn-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="transactions-list">
        ${txnList}
      </div>
      
      <div id="add-txn-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg); overflow-y:auto;">
        <div class="card" style="max-width: 400px; margin: 5vh auto;">
          <h2>New Transaction</h2>
          <form id="add-txn-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <select id="txn-type" required class="input">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="number" step="0.01" id="txn-amount" placeholder="Amount" required class="input">
            <input type="text" id="txn-merchant" placeholder="Merchant / Description" required class="input">
            <input type="date" id="txn-date" required class="input">
            <select id="txn-account" required class="input"><option value="">Select Account</option></select>
            <select id="txn-category" required class="input"><option value="">Select Category</option></select>
            
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-txn-modal" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Add basic styles for the inputs since we didn't define .input class yet
    const style = document.createElement('style');
    style.innerHTML = `.input { padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white; }`;
    main.appendChild(style);

    // Setup modal & form
    const modal = document.getElementById('add-txn-modal');
    document.getElementById('add-txn-btn').addEventListener('click', async () => {
      // Load dropdowns on demand
      const accounts = await getAllAccounts();
      const accountSelect = document.getElementById('txn-account');
      accountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      
      await seedDefaultCategories();
      const categories = await getAllCategories();
      const catSelect = document.getElementById('txn-category');
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      
      document.getElementById('txn-date').valueAsDate = new Date();
      modal.style.display = 'block';
    });
    
    document.getElementById('close-txn-modal').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-txn-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveTransaction({
        type: document.getElementById('txn-type').value,
        amount: parseFloat(document.getElementById('txn-amount').value),
        merchant: document.getElementById('txn-merchant').value,
        date: document.getElementById('txn-date').value,
        accountId: Number(document.getElementById('txn-account').value),
        categoryId: Number(document.getElementById('txn-category').value)
      });
      modal.style.display = 'none';
      renderTransactions(); // Re-render list
    });

  } catch (err) {
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
