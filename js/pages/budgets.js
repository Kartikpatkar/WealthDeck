import { getAllBudgets, saveBudget } from '../services/budgetService.js';
import { getAllCategories } from '../services/categoryService.js';

export async function renderBudgets() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Budgets...</div>`;
  
  try {
    const budgets = await getAllBudgets();
    
    let listHTML = '';
    if (budgets.length === 0) {
      listHTML = `<p>No budgets set. Create your first budget limit.</p>`;
    } else {
      listHTML = budgets.map(b => `
        <div class="card" style="margin-bottom: var(--spacing-sm);">
          <div style="display: flex; justify-content: space-between;">
            <strong>Category #${b.categoryId} (Month: ${b.month})</strong>
            <div class="mono">$${(b.spent || 0).toFixed(2)} / $${b.amount.toFixed(2)}</div>
          </div>
          <div style="background: var(--bg-primary); border-radius: 4px; height: 8px; margin-top: 8px; overflow: hidden;">
            <div style="width: ${Math.min(((b.spent||0) / b.amount) * 100, 100)}%; height: 100%; background: ${((b.spent||0) > b.amount) ? 'var(--color-expense)' : 'var(--color-primary)'};"></div>
          </div>
        </div>
      `).join('');
    }

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Budgets</h1>
        <button id="add-budget-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="budgets-list">${listHTML}</div>
      
      <div id="add-budget-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 20vh auto;">
          <h2>Set Budget</h2>
          <form id="add-budget-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <select id="budget-category" required style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;"></select>
            <input type="number" step="0.01" id="budget-amount" placeholder="Limit Amount" required style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;">
            <input type="month" id="budget-month" required style="padding:var(--spacing-sm); border-radius:var(--radius-sm); border:1px solid var(--border-light); background:var(--bg-primary); color:white;">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-budget-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

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
      renderBudgets();
    });

  } catch (err) {
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
