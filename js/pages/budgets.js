import { getBudgetsWithSpent, saveBudget, deleteBudget } from '../services/budgetService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Budgets...</div>`;
  
  try {
    const budgets = await getBudgetsWithSpent();
    
    let listHTML = '';
    if (budgets.length === 0) {
      listHTML = `<div class="hint" style="margin-top:40px;">No budgets set. Create your first budget limit.</div>`;
    } else {
      listHTML = budgets.map((b, idx) => {
        const spent = b.spent || 0;
        const pct = Math.min((spent / b.amount) * 100, 100);
        const colors = ['#6366f1', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#22d3ee'];
        const c = colors[idx % colors.length];
        const isOver = spent > b.amount;
        
        return `
          <div class="budget-item" data-id="${b.id}" style="cursor:pointer; padding: 12px 0;">
            <div class="budget-top">
              <div class="name"><div class="dot" style="width:8px;height:8px;border-radius:50%;background:${c}"></div>${b.categoryName || 'Category #' + b.categoryId}</div>
              <div class="amt">${formatCurrency(spent)} / ${formatCurrency(b.amount)}</div>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%;background:${isOver ? 'var(--color-expense)' : c}"></div>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">Month: ${b.month}</div>
          </div>
        `;
      }).join('');
      
      listHTML = `<div class="card">${listHTML}</div>`;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 19px; font-weight: 700;">Budgets</h2>
        <button id="add-budget-btn" class="icon-btn" aria-label="Add budget" style="color:var(--color-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div id="budgets-list">${listHTML}</div>
      
      <!-- ADD BUDGET MODAL -->
      <div class="modal-overlay" id="add-budget-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Budget</h3>
            <button type="button" class="modal-close" id="close-budget-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <form id="add-budget-form">
            <input type="hidden" id="budget-id">
            
            <div class="field">
              <label>Category</label>
              <select id="budget-category" required></select>
            </div>
            
            <div class="field-row">
              <div class="field" style="flex: 2;">
                <label>Monthly Limit</label>
                <div class="amount-input-wrap" style="margin-top:0; padding:4px 0;">
                  <span class="cur" style="font-size:16px;">${getCurrencySymbol()}</span>
                  <input type="number" step="0.01" class="amount-input" id="budget-amount" placeholder="0.00" required style="font-size:24px;">
                </div>
              </div>
              <div class="field" style="flex: 1;">
                <label>Month</label>
                <input type="month" id="budget-month" required>
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-budget-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save budget</button>
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
      document.getElementById('budget-month').value = new Date().toISOString().slice(0, 7);
      document.getElementById('delete-budget-btn').style.display = 'none';
      openModal();
    });
    
    // Form Submit
    document.getElementById('add-budget-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        categoryId: Number(document.getElementById('budget-category').value),
        amount: Math.round(parseFloat(document.getElementById('budget-amount').value) * 100),
        month: document.getElementById('budget-month').value
      };
      const idStr = document.getElementById('budget-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveBudget(payload);
      closeModal();
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
