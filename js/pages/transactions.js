import { getAllTransactions, saveTransaction, deleteTransaction } from '../services/transactionService.js';
import { confirmModal } from '../components/modal.js';
import { getAllAccounts, seedDefaultAccount } from '../services/accountService.js';
import { getAllCategories, seedDefaultCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Transactions...</div>`;
  
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
          <div style="text-align: right;">
            <div class="mono" style="color: ${t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}; font-weight: bold;">
              ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
            <div style="margin-top:4px;">
              <button class="edit-txn-btn" data-id="${t.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:0.8em; margin-right:var(--spacing-sm);">Edit</button>
              <button class="delete-txn-btn" data-id="${t.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer; font-size:0.8em;">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Transactions</h1>
        <button id="add-txn-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="transactions-list">
        ${txnList}
      </div>
      
      <div id="add-txn-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg); overflow-y:auto;">
        <div class="card" style="max-width: 400px; margin: 5vh auto;">
          <h2>Transaction</h2>
          <form id="add-txn-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="hidden" id="txn-id">
            <select id="txn-type" required class="input">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            <input type="number" step="0.01" id="txn-amount" placeholder="Amount" required class="input">
            <input type="text" id="txn-merchant" placeholder="Merchant / Title" required class="input">
            <input type="text" id="txn-description" placeholder="Description (Optional)" class="input">
            <input type="date" id="txn-date" required class="input">
            <select id="txn-account" required class="input"><option value="">From Account</option></select>
            <select id="txn-to-account" class="input" style="display:none;"><option value="">To Account</option></select>
            <select id="txn-category" required class="input"><option value="">Select Category</option></select>
            <input type="text" id="txn-tags" placeholder="Tags (comma separated)" class="input">
            <textarea id="txn-notes" placeholder="Notes (Optional)" class="input" rows="2"></textarea>
            
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-txn-modal" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Populate dropdowns globally once
    await seedDefaultAccount();
    const accounts = await getAllAccounts();
    document.getElementById('txn-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    document.getElementById('txn-to-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    
    await seedDefaultCategories();
    const categories = await getAllCategories();
    document.getElementById('txn-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    const typeSelect = document.getElementById('txn-type');
    const toAccountSelect = document.getElementById('txn-to-account');
    typeSelect.addEventListener('change', () => {
      toAccountSelect.style.display = typeSelect.value === 'transfer' ? 'block' : 'none';
      toAccountSelect.required = typeSelect.value === 'transfer';
    });

    document.getElementById('transactions-list').addEventListener('click', async (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('delete-txn-btn')) {
        if (await confirmModal('Delete Transaction', 'Are you sure?')) {
          await deleteTransaction(id);
          render(container);
        }
      } else if (e.target.classList.contains('edit-txn-btn')) {
        const txn = transactions.find(t => t.id === id);
        if (txn) {
          document.getElementById('txn-id').value = txn.id;
          document.getElementById('txn-type').value = txn.type;
          document.getElementById('txn-amount').value = (txn.amount / 100).toFixed(2);
          document.getElementById('txn-merchant').value = txn.merchant || '';
          document.getElementById('txn-description').value = txn.description || '';
          document.getElementById('txn-date').value = new Date(txn.date).toISOString().split('T')[0];
          document.getElementById('txn-account').value = txn.accountId;
          if (txn.type === 'transfer') {
            document.getElementById('txn-to-account').value = txn.toAccountId;
            toAccountSelect.style.display = 'block';
            toAccountSelect.required = true;
          } else {
            toAccountSelect.style.display = 'none';
            toAccountSelect.required = false;
          }
          document.getElementById('txn-category').value = txn.categoryId || '';
          document.getElementById('txn-tags').value = (txn.tags || []).join(', ');
          document.getElementById('txn-notes').value = txn.notes || '';
          
          document.getElementById('add-txn-modal').style.display = 'block';
        }
      }
    });
    
    // Setup modal & form
    const modal = document.getElementById('add-txn-modal');
    document.getElementById('add-txn-btn').addEventListener('click', () => {
      document.getElementById('add-txn-form').reset();
      document.getElementById('txn-id').value = '';
      toAccountSelect.style.display = 'none';
      toAccountSelect.required = false;
      document.getElementById('txn-date').valueAsDate = new Date();
      modal.style.display = 'block';
    });

    document.getElementById('close-txn-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('add-txn-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const type = document.getElementById('txn-type').value;
      const accountId = Number(document.getElementById('txn-account').value);
      const toAccountId = type === 'transfer' ? Number(document.getElementById('txn-to-account').value) : null;
      
      if (type === 'transfer' && accountId === toAccountId) {
        alert('From and To accounts cannot be the same');
        return;
      }
      
      const tagsInput = document.getElementById('txn-tags').value;
      
      const payload = {
        type: type,
        amount: parseFloat(document.getElementById('txn-amount').value),
        merchant: document.getElementById('txn-merchant').value,
        description: document.getElementById('txn-description').value,
        date: document.getElementById('txn-date').value,
        accountId: accountId,
        toAccountId: toAccountId,
        categoryId: Number(document.getElementById('txn-category').value),
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : [],
        notes: document.getElementById('txn-notes').value,
        isRecurring: false,
        importSource: 'manual'
      };
      
      const idStr = document.getElementById('txn-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveTransaction(payload);
      modal.style.display = 'none';
      render(container); // Re-render list
    });

    if (params.openModal) {
      document.getElementById('add-txn-btn').click();
      window.location.hash = '#/transactions'; // Reset hash so back button works
    }

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
