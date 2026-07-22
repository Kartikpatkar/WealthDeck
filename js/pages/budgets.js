import { getBudgetsWithSpent, saveBudget, deleteBudget } from '../services/budgetService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { getAllTransactions } from '../services/transactionService.js';
import { formatCurrency, getCurrencySymbol, parseLocalDate, getLocalMonthStr } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Budgets...</div>`;
  
  try {
    const budgets = await getBudgetsWithSpent();
    
    const txns = await getAllTransactions();
    
    // Calculate Ready To Assign for the current month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Filter budgets for the current month
    const currentBudgets = budgets.filter(b => b.month === currentMonthStr);
    
    let totalIncome = 0;
    txns.forEach(t => {
      if (t.type === 'income' && getLocalMonthStr(t.date) === currentMonthStr) {
        totalIncome += t.amount;
      }
    });
    
    let totalAssigned = 0;
    currentBudgets.forEach(b => {
      totalAssigned += b.amount;
    });
    
    const readyToAssign = totalIncome - totalAssigned;
    const isOverAssigned = readyToAssign < 0;
    
    let listHTML = '';
    if (currentBudgets.length === 0) {
      listHTML = `<div class="hint mod-style-c43a02">No envelopes set for this month. Assign your income to categories.</div>`;
    } else {
      listHTML = currentBudgets.map((b, idx) => {
        const spent = b.spent || 0;
        const available = b.amount - spent;
        const colors = ['#6366f1', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#22d3ee'];
        const c = colors[idx % colors.length];
        const isNegative = available < 0;
        
        return `
          <div class="budget-item mod-style-dc3988 mod-style-0b680f" data-id="${b.id}">
            <div class="mod-style-948e6d">
              <div class="name mod-style-1e2cb1"><div class="dot" style="background:${c}"></div>${b.categoryName || 'Category #' + b.categoryId}</div>
              <div style="font-weight: 700; font-size: 16px; color: ${isNegative ? 'var(--color-expense)' : 'var(--color-income)'}">${formatCurrency(available)}</div>
            </div>
            <div class="mod-style-c5499d">
              <div>Assigned: ${formatCurrency(b.amount)}</div>
              <div>Activity: ${formatCurrency(spent)}</div>
            </div>
          </div>
        `;
      }).join('');
      
      listHTML = `<div class="card mod-style-b662f2">${listHTML}</div>`;
    }

    container.innerHTML = `
      <div class="mod-style-1b4308">
        <h2 class="mod-style-09251a">Envelopes</h2>
        <button class="icon-btn mod-style-3bb313" id="add-budget-btn"  aria-label="Assign money">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div class="card" style="background: ${isOverAssigned ? 'var(--color-expense)' : 'var(--color-primary)'}; color: white; text-align: center; padding: 24px; margin-bottom: 24px;">
        <div class="mod-style-abf115">Ready to Assign</div>
        <div class="mod-style-ea89fb">${formatCurrency(readyToAssign)}</div>
      </div>
      
      <div id="budgets-list">${listHTML}</div>
      
      <!-- ADD BUDGET MODAL -->
      <div class="modal-overlay" id="add-budget-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Assign Money</h3>
            <button class="modal-close" type="button"  id="close-budget-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-budget-form">
            <input type="hidden" id="budget-id">
            
            <div class="field">
              <label>Category</label>
              <select id="budget-category" required></select>
            </div>
            
            <div class="amount-input-wrap mod-style-a81293">
              <span class="cur">${getCurrencySymbol()}</span>
              <input class="amount-input" type="number" step="0.01"  id="budget-amount" placeholder="0.00" required>
            </div>
            
            <div class="field mod-style-93b8ea">
              <label>Target Month</label>
              <input type="month" id="budget-month" required>
            </div>

            <div class="mod-style-3fbd1a">
              <button class="btn btn--secondary mod-style-1da7e6" type="button"  id="delete-budget-btn">Delete</button>
              <button class="btn mod-style-d5e8c5" type="submit">Assign</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Click on budget item -> Edit
    document.getElementById('budgets-list').addEventListener('click', async (e) => {
      const row = e.target.closest('.budget-item');
      if(!row) return;
      const id = Number(row.dataset.id);
      const b = budgets.find(x => x.id === id);
      if (b) {
        const categories = await getAllCategories();
        document.getElementById('budget-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('budget-id').value = b.id;
        document.getElementById('budget-category').value = b.categoryId;
        document.getElementById('budget-amount').value = (b.amount / 100).toFixed(2);
        document.getElementById('budget-month').value = b.month;
        document.getElementById('delete-budget-btn').style.display = 'block';
        openModal();
      }
    });
    
    // Delete Button
    document.getElementById('delete-budget-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('budget-id').value);
      if (id && await confirmModal('Delete Budget', 'Are you sure?')) {
        await deleteBudget(id);
        closeModal();
        render(container);
      }
    });

    // Modal behavior
    const modalOverlay = document.getElementById('add-budget-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-budget-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }

    // Add FAB
    document.getElementById('add-budget-btn').addEventListener('click', async () => {
      document.getElementById('add-budget-form').reset();
      document.getElementById('budget-id').value = '';
      const categories = await getAllCategories();
      document.getElementById('budget-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      document.getElementById('budget-month').value = currentMonthStr;
      document.getElementById('delete-budget-btn').style.display = 'none';
      openModal();
    });
    
    // Form Submit
    document.getElementById('add-budget-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        categoryId: Number(document.getElementById('budget-category').value),
        amount: parseFloat(document.getElementById('budget-amount').value),
        month: document.getElementById('budget-month').value
      };
      const idStr = document.getElementById('budget-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveBudget(payload);
      closeModal();
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
