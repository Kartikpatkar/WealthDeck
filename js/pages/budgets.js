import { getBudgetsWithSpent, saveBudget, deleteBudget } from '../services/budgetService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Budgets...</div>`;
  
  try {
    const budgets = await getBudgetsWithSpent();
    
    let listHTML = '';
    if (budgets.length === 0) {
      listHTML = `<p>No budgets set. Create your first budget limit.</p>`;
    } else {
      listHTML = budgets.map(b => `
        <div class="card" style="margin-bottom: var(--spacing-sm);">
          <div style="display: flex; justify-content: space-between;">
            <strong>${b.categoryName || 'Category #' + b.categoryId} (Month: ${b.month})</strong>
            <div style="text-align: right;">
            <div class="mono" style="font-weight: bold;">${formatCurrency(b.spent || 0)} / ${formatCurrency(b.amount)}</div>
            <button class="delete-budget-btn" data-id="${b.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer; font-size:0.8em; margin-top:4px;">Delete</button>
          </div>
        </div>
          <div style="background: var(--bg-primary); border-radius: 4px; height: 8px; margin-top: 8px; overflow: hidden;">
            <div style="width: ${Math.min(((b.spent||0) / b.amount) * 100, 100)}%; height: 100%; background: ${((b.spent||0) > b.amount) ? 'var(--color-expense)' : 'var(--color-primary)'};"></div>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Budgets</h1>
        <button id="add-budget-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="budgets-list">${listHTML}</div>
      
      <div id="add-budget-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 20vh auto;">
          <h2>Set Budget</h2>
          <form id="add-budget-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <select id="budget-category" required class="input"></select>
            <input type="number" step="0.01" id="budget-amount" placeholder="Limit Amount" required class="input">
            <input type="month" id="budget-month" required class="input">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-budget-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('budgets-list').addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-budget-btn')) {
        if (await confirmModal('Delete Budget', 'Are you sure?')) {
          await deleteBudget(Number(e.target.dataset.id));
          render(container);
        }
      }
    });

    const modal = document.getElementById('add-budget-modal');
    document.getElementById('add-budget-btn').addEventListener('click', async () => {
      const categories = await getAllCategories();
      const catSelect = document.getElementById('budget-category');
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      document.getElementById('budget-month').value = new Date().toISOString().slice(0, 7);
      modal.style.display = 'block';
    });
    
    document.getElementById('close-budget-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-budget-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveBudget({
        categoryId: Number(document.getElementById('budget-category').value),
        amount: parseFloat(document.getElementById('budget-amount').value),
        month: document.getElementById('budget-month').value,
        spent: 0
      });
      modal.style.display = 'none';
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
