import { getAllBills, saveBill } from '../services/billService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function renderBills() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Bills...</div>`;
  
  try {
    const bills = await getAllBills();
    
    let listHTML = '';
    if (bills.length === 0) {
      listHTML = `<p>No recurring bills. Add one below.</p>`;
    } else {
      listHTML = bills.map(b => `
        <div class="card" style="margin-bottom: var(--spacing-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${b.name}</strong>
            <div style="font-size: 0.8em; color: var(--text-secondary);">Due: ${new Date(b.nextDueDate).toLocaleDateString()}</div>
          </div>
          <div class="mono" style="font-weight: bold; color: var(--color-expense);">
            ${formatCurrency(b.amount)}
          </div>
        </div>
      `).join('');
    }

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Recurring Bills</h1>
        <button id="add-bill-btn" class="btn btn--primary">+ Add</button>
      </div>
      <div id="bills-list">${listHTML}</div>
      
      <div id="add-bill-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 20vh auto;">
          <h2>New Recurring Bill</h2>
          <form id="add-bill-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="text" id="bill-name" placeholder="Bill Name (e.g. Netflix)" required class="input">
            <input type="number" step="0.01" id="bill-amount" placeholder="Amount" required class="input">
            <input type="date" id="bill-due" required class="input">
            <select id="bill-category" required class="input"></select>
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-bill-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modal = document.getElementById('add-bill-modal');
    document.getElementById('add-bill-btn').addEventListener('click', async () => {
      const categories = await getAllCategories();
      const catSelect = document.getElementById('bill-category');
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      document.getElementById('bill-due').valueAsDate = new Date();
      modal.style.display = 'block';
    });
    
    document.getElementById('close-bill-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-bill-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveBill({
        name: document.getElementById('bill-name').value,
        amount: parseFloat(document.getElementById('bill-amount').value),
        nextDueDate: document.getElementById('bill-due').value,
        categoryId: Number(document.getElementById('bill-category').value),
        isActive: true
      });
      modal.style.display = 'none';
      renderBills();
    });

  } catch (err) {
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
