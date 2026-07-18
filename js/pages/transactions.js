import { getAllTransactions, saveTransaction, deleteTransaction } from '../services/transactionService.js';
import { confirmModal } from '../components/modal.js';
import { getAllAccounts, seedDefaultAccount } from '../services/accountService.js';
import { getAllCategories, seedDefaultCategories } from '../services/categoryService.js';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Transactions...</div>`;
  
  try {
    const transactions = await getAllTransactions();
    await seedDefaultCategories();
    const categories = await getAllCategories();
    const catMap = categories.reduce((acc, c) => ({...acc, [c.id]: c}), {});
    
    // Group by Date
    const grouped = {};
    transactions.forEach(t => {
      const d = formatDate(t.date);
      if(!grouped[d]) grouped[d] = [];
      grouped[d].push(t);
    });
    
    let txnList = '';
    if (transactions.length === 0) {
      txnList = `<div class="hint" style="margin-top:40px;">No transactions yet.</div>`;
    } else {
      Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a)).forEach(date => {
        txnList += `<div class="date-header">${date}</div>`;
        txnList += grouped[date].map(t => {
          const isIncome = t.type === 'income';
          const cName = catMap[t.categoryId]?.name || 'Uncategorized';
          const cIcon = catMap[t.categoryId]?.icon || '📦';
          const amtStr = formatCurrency(t.amount);
          const colorClass = isIncome ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense');
          const sign = isIncome ? '+' : (t.type === 'transfer' ? '' : '-');
          
          return `
            <div class="tx-row" data-id="${t.id}">
              <div class="tx-icon" style="background:${isIncome ? 'rgba(52,211,153,.15)' : 'rgba(148,163,184,.12)'}">${cIcon}</div>
              <div class="tx-info">
                <div class="m">${t.merchant || 'Transaction'}</div>
                <div class="c">${cName}</div>
              </div>
              <div class="tx-amt ${colorClass}">${sign}${amtStr}</div>
            </div>
          `;
        }).join('');
      });
    }

    container.innerHTML = `
      <div class="page-head"><h2>Transactions</h2></div>
      
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="Search merchant, category...">
      </div>
      
      <div class="chips">
        <button class="chip active">All</button>
        <button class="chip">Income</button>
        <button class="chip">Expense</button>
        <button class="chip">This month</button>
      </div>
      
      <div class="card" style="padding:8px 20px;">
        <div id="fullTxList">${txnList}</div>
      </div>
      
      <!-- ADD TRANSACTION MODAL -->
      <div class="modal-overlay" id="add-txn-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Add transaction</h3>
            <button type="button" class="modal-close" id="close-txn-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-txn-form">
            <input type="hidden" id="txn-id">
            
            <div class="segmented" id="typeSeg">
              <button type="button" class="active" data-type="expense">Expense</button>
              <button type="button" data-type="income">Income</button>
              <button type="button" data-type="transfer">Transfer</button>
            </div>
            <input type="hidden" id="txn-type" value="expense">

            <div class="amount-input-wrap">
              <span class="cur">${getCurrencySymbol()}</span>
              <input type="number" step="0.01" class="amount-input expense-mode" id="txn-amount" inputmode="decimal" placeholder="0.00" required>
            </div>

            <div class="field">
              <label>Category</label>
              <select id="txn-category" required><option value="">Select Category</option></select>
            </div>
            
            <div class="field-row">
              <div class="field">
                <label>Account</label>
                <select id="txn-account" required><option value="">From Account</option></select>
              </div>
              <div class="field" id="txn-to-account-wrap" style="display:none;">
                <label>To Account</label>
                <select id="txn-to-account"><option value="">To Account</option></select>
              </div>
            </div>
            
            <div class="field">
              <label>Date</label>
              <input type="date" id="txn-date" required>
            </div>

            <button type="button" class="more-toggle" id="more-toggle-btn">
              <span>More details</span>
              <svg class="svg-icon" id="more-toggle-icon" style="transition:transform .2s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            
            <div class="more-fields" id="moreFields">
              <div class="field"><label>Merchant / Title</label><input type="text" id="txn-merchant" placeholder="Start typing to search" required></div>
              <div class="field"><label>Tags</label><input type="text" id="txn-tags" placeholder="Add tags separated by comma"></div>
              <div class="field"><label>Notes</label><input type="text" id="txn-notes" placeholder="Add a note"></div>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-txn-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="save-btn" style="flex:1;">Save transaction</button>
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
    
    document.getElementById('txn-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // UI logic for Segments
    const segButtons = document.querySelectorAll('#typeSeg button');
    const typeInput = document.getElementById('txn-type');
    const amountInput = document.getElementById('txn-amount');
    const toAccountWrap = document.getElementById('txn-to-account-wrap');
    const toAccountSelect = document.getElementById('txn-to-account');
    
    function setType(type) {
      segButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = document.querySelector(`#typeSeg button[data-type="${type}"]`);
      if(activeBtn) activeBtn.classList.add('active');
      typeInput.value = type;
      
      amountInput.classList.remove('income-mode', 'expense-mode');
      if(type === 'income') amountInput.classList.add('income-mode');
      else if(type === 'expense') amountInput.classList.add('expense-mode');
      
      if(type === 'transfer') {
        toAccountWrap.style.display = 'block';
        toAccountSelect.required = true;
      } else {
        toAccountWrap.style.display = 'none';
        toAccountSelect.required = false;
      }
    }
    
    segButtons.forEach(b => {
      b.addEventListener('click', () => setType(b.dataset.type));
    });

    // More Toggle
    const moreBtn = document.getElementById('more-toggle-btn');
    const moreFields = document.getElementById('moreFields');
    const moreIcon = document.getElementById('more-toggle-icon');
    moreBtn.addEventListener('click', () => {
      moreFields.classList.toggle('open');
      moreIcon.style.transform = moreFields.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Row click -> Edit
    const listEl = document.getElementById('fullTxList');
    listEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tx-row');
      if(!row) return;
      const id = Number(row.dataset.id);
      const txn = transactions.find(t => t.id === id);
      if (txn) {
        document.getElementById('txn-id').value = txn.id;
        setType(txn.type);
        document.getElementById('txn-amount').value = (txn.amount / 100).toFixed(2);
        document.getElementById('txn-merchant').value = txn.merchant || '';
        document.getElementById('txn-date').value = new Date(txn.date).toISOString().split('T')[0];
        document.getElementById('txn-account').value = txn.accountId;
        if(txn.type === 'transfer') {
          document.getElementById('txn-to-account').value = txn.toAccountId;
        }
        document.getElementById('txn-category').value = txn.categoryId || '';
        document.getElementById('txn-tags').value = (txn.tags || []).join(', ');
        document.getElementById('txn-notes').value = txn.notes || '';
        
        document.getElementById('delete-txn-btn').style.display = 'block';
        openModal();
      }
    });
    
    // Delete Button
    document.getElementById('delete-txn-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('txn-id').value);
      if (id && await confirmModal('Delete Transaction', 'Are you sure?')) {
        await deleteTransaction(id);
        closeModal();
        render(container);
      }
    });

    // Setup modal overlay clicks
    const modalOverlay = document.getElementById('add-txn-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-txn-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }
    
    // Form Submit
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
        amount: Math.round(parseFloat(document.getElementById('txn-amount').value) * 100),
        merchant: document.getElementById('txn-merchant').value,
        date: document.getElementById('txn-date').value,
        accountId: accountId,
        toAccountId: toAccountId,
        categoryId: Number(document.getElementById('txn-category').value),
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()) : [],
        notes: document.getElementById('txn-notes').value,
      };
      
      const idStr = document.getElementById('txn-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveTransaction(payload);
      closeModal();
      render(container); // Re-render list
    });

    // Open Modal via router param (e.g. from FAB)
    if (params.openModal) {
      document.getElementById('add-txn-form').reset();
      document.getElementById('txn-id').value = '';
      setType('expense');
      document.getElementById('delete-txn-btn').style.display = 'none';
      document.getElementById('txn-date').valueAsDate = new Date();
      openModal();
      window.location.hash = '#/transactions'; // Reset hash so back button works
    }

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}

