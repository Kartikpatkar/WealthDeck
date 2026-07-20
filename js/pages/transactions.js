import { getAllTransactions, saveTransaction, deleteTransaction } from '../services/transactionService.js';
import { confirmModal, promptModal } from '../components/modal.js';
import { getAllAccounts, seedDefaultAccount, saveAccount } from '../services/accountService.js';
import { getAllCategories, seedDefaultCategories } from '../services/categoryService.js';
import { formatCurrency, formatDate, escapeHTML, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Transactions...</div>`;
  
  try {
    const transactions = await getAllTransactions();
    await seedDefaultCategories();
    const categories = await getAllCategories();
    
    container.innerHTML = `
      <div class="page-head"><h2>Transactions</h2></div>
      
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="tx-search" placeholder="Search transactions...">
      </div>
      
      <div class="chips" id="tx-filters">
        <div class="chip active" data-filter="all">All</div>
        <div class="chip" data-filter="income">Income</div>
        <div class="chip" data-filter="expense">Expense</div>
        <div class="chip" data-filter="this-month">This Month</div>
      </div>
      
      <div id="tx-list"></div>
      
      <!-- ADD TRANSACTION MODAL -->
      <div class="modal-overlay" id="add-txn-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Add transaction</h3>
            <button class="modal-close" type="button"  id="close-txn-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-txn-form">
            <input type="hidden" id="txn-id">
            
            <div class="segmented" id="typeSeg">
              <button class="active" type="button"  data-type="expense">Expense</button>
              <button type="button" data-type="income">Income</button>
              <button type="button" data-type="transfer">Transfer</button>
            </div>
            <input type="hidden" id="txn-type" value="expense">

            <div class="amount-input-wrap">
              <span class="cur">${getCurrencySymbol()}</span>
              <input class="amount-input expense-mode" type="number" step="0.01"  id="txn-amount" inputmode="decimal" placeholder="0.00" required>
            </div>

            <div class="field">
              <label>Category</label>
              <select id="txn-category" required><option value="">Select Category</option></select>
            </div>
            
            <div class="field-row">
              <div class="field">
                <label>Account</label>
                <div class="d-flex gap-8">
                  <select class="flex-1" id="txn-account" required><option value="">From Account</option></select>
                  <button class="icon-btn flex-shrink-0 mod-style-53f114" type="button" id="quick-add-account"   aria-label="Add new account">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>
              <div class="field mod-style-93b8ea" id="txn-to-account-wrap">
                <label>To Account</label>
                <select id="txn-to-account"><option value="">To Account</option></select>
              </div>
            </div>
            
            <div class="field">
              <label>Date</label>
              <input type="date" id="txn-date" required>
            </div>

            <button class="more-toggle" type="button"  id="more-toggle-btn">
              <span>More details</span>
              <svg class="svg-icon mod-style-e47283" id="more-toggle-icon"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            
            <div class="more-fields" id="moreFields">
              <div class="field"><label>Merchant / Title</label><input type="text" id="txn-merchant" placeholder="Start typing to search"></div>
              <div class="field"><label>Tags</label><input type="text" id="txn-tags" placeholder="Add tags separated by comma"></div>
              <div class="field"><label>Notes</label><input type="text" id="txn-notes" placeholder="Add a note"></div>
            </div>

            <div class="d-flex gap-12 mt-24">
              <button class="btn btn--secondary flex-1 mod-style-93b8ea" type="button"  id="delete-txn-btn">Delete</button>
              <button class="btn flex-2" type="submit">Save transaction</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    await seedDefaultAccount();
    const accounts = await getAllAccounts();
    document.getElementById('txn-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    document.getElementById('txn-to-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    let allCategories = categories;
    document.getElementById('txn-category').innerHTML = allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    document.getElementById('quick-add-account').addEventListener('click', async () => {
      const name = await promptModal('New Account', 'Enter the name of your new account:', 'e.g. Chase Checking');
      if (name && name.trim()) {
        const id = await saveAccount({
          name: name.trim(),
          type: 'cash',
          balance: 0,
          currency: localStorage.getItem('wealthdeck_currency') || 'USD',
          color: localStorage.getItem('wealthdeck_accent') || '#6366f1',
          icon: '<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
          isArchived: false
        });
        const newAccounts = await getAllAccounts();
        const optionsHtml = newAccounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        document.getElementById('txn-account').innerHTML = optionsHtml;
        document.getElementById('txn-to-account').innerHTML = optionsHtml;
        document.getElementById('txn-account').value = id;
        import('../components/toast.js').then(m => m.showToast('Account added successfully!'));
      }
    });
    
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
      
      // Update category dropdown
      if (allCategories && allCategories.length > 0) {
        const filteredCats = allCategories.filter(c => c.type === type);
        document.getElementById('txn-category').innerHTML = filteredCats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
    }
    
    segButtons.forEach(b => b.addEventListener('click', () => setType(b.dataset.type)));

    const moreBtn = document.getElementById('more-toggle-btn');
    const moreFields = document.getElementById('moreFields');
    const moreIcon = document.getElementById('more-toggle-icon');
    moreBtn.addEventListener('click', () => {
      moreFields.classList.toggle('open');
      moreIcon.style.transform = moreFields.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    let currentFilter = 'all';
    let searchQuery = '';
    
    function renderList() {
      const now = new Date();
      let filtered = transactions.filter(t => {
        if (currentFilter === 'income' && t.type !== 'income') return false;
        if (currentFilter === 'expense' && t.type !== 'expense') return false;
        if (currentFilter === 'this-month') {
          const d = new Date(t.date);
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
        if (searchQuery) {
          if (!(t.merchant || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
        }
        return true;
      });
      
      let html = '';
      if (filtered.length === 0) {
        html = '<div class="hint mod-style-c43a02">No transactions found.</div>';
      } else {
        const grouped = {};
        filtered.forEach(t => {
          const d = new Date(t.date).toLocaleDateString('en-CA');
          if (!grouped[d]) grouped[d] = [];
          grouped[d].push(t);
        });
        
        const sortedDates = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));
        sortedDates.forEach(date => {
          html += `<div class="date-header">${formatDate(date)}</div>`;
          html += `<div class="card mod-style-0e2a7e">`;
          grouped[date].forEach(t => {
            const isIncome = t.type === 'income';
            html += `
              <div class="tx-row" data-id="${t.id}">
                <div class="tx-icon ${isIncome ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense')}">
                  ${t.categoryId ? (categories.find(c => c.id === t.categoryId)?.icon || '💰') : '💰'}
                </div>
                <div class="tx-info">
                  <div class="m">${escapeHTML(t.merchant) || 'Transaction'}</div>
                  <div class="c">${t.categoryId ? (categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized') : 'Uncategorized'}</div>
                </div>
                <div class="tx-amt ${isIncome ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense')}">
                  ${isIncome ? '+' : (t.type === 'transfer' ? '' : '-')}${formatCurrency(t.amount)}
                </div>
              </div>
            `;
          });
          html += `</div>`;
        });
      }
      document.getElementById('tx-list').innerHTML = html;
    }
    
    renderList();

    document.getElementById('tx-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderList();
    });

    document.getElementById('tx-filters').addEventListener('click', (e) => {
      if (e.target.classList.contains('chip')) {
        document.querySelectorAll('#tx-filters .chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderList();
      }
    });

    const listEl = document.getElementById('tx-list');
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
      if (params.openModal) {
        const prevRoute = localStorage.getItem('wealthdeck_prev_route') || '/dashboard';
        window.location.hash = '#' + prevRoute;
      }
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
      
      const amountVal = parseFloat(document.getElementById('txn-amount').value);
      if (isNaN(amountVal) || amountVal <= 0) {
        import('../components/toast.js').then(m => m.showToast('Amount must be greater than 0', 'error'));
        return;
      }

      const payload = {
        type: type,
        amount: amountVal,
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
      
      if (!params.openModal) {
        render(container); // Re-render list only if staying on page
      }
    });

    // Open Modal via router param (e.g. from FAB)
    if (params.openModal) {
      document.getElementById('add-txn-form').reset();
      document.getElementById('txn-id').value = '';
      setType('expense');
      
      const defaultAcc = accounts.find(a => a.isDefault);
      if (defaultAcc) {
        document.getElementById('txn-account').value = defaultAcc.id;
      }
      
      document.getElementById('delete-txn-btn').style.display = 'none';
      document.getElementById('txn-date').valueAsDate = new Date();
      openModal();
      // Don't replace state, because we handle navigation manually on close
    }

  } catch (err) {
    container.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
}
export function destroy() {}

