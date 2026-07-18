import { getAllBills, saveBill, deleteBill } from '../services/billService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Bills...</div>`;
  
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
          <div style="text-align: right;">
            <div class="mono" style="font-weight: bold;">${formatCurrency(b.amount)}</div>
            <button class="delete-bill-btn" data-id="${b.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer; font-size:0.8em; margin-top:4px;">Delete</button>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = `
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
            <select id="bill-category" required class="input"></select>
            <select id="bill-account" required class="input"><option value="">Pay From Account</option></select>
            <select id="bill-freq" required class="input">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" id="bill-date" required class="input">
            <input type="number" id="bill-remind" placeholder="Remind Days Before (0 for due date)" class="input" value="0">
            <textarea id="bill-notes" placeholder="Notes (Optional)" class="input" rows="2"></textarea>
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-bill-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('bills-list').addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-bill-btn')) {
        if (await confirmModal('Delete Bill', 'Are you sure?')) {
          await deleteBill(Number(e.target.dataset.id));
          render(container);
        }
      }
    });

    const modal = document.getElementById('add-bill-modal');
    document.getElementById('add-bill-btn').addEventListener('click', async () => {
      const categories = await getAllCategories();
      document.getElementById('bill-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      
      const { getAllAccounts } = await import('../services/accountService.js');
      const accounts = await getAllAccounts();
      document.getElementById('bill-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      
      document.getElementById('bill-date').valueAsDate = new Date();
      modal.style.display = 'block';
    });
    
    document.getElementById('close-bill-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-bill-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveBill({
        name: document.getElementById('bill-name').value,
        amount: parseFloat(document.getElementById('bill-amount').value),
        categoryId: Number(document.getElementById('bill-category').value),
        accountId: Number(document.getElementById('bill-account').value),
        frequency: document.getElementById('bill-freq').value,
        nextDueDate: document.getElementById('bill-date').value,
        remindDaysBefore: Number(document.getElementById('bill-remind').value) || 0,
        notes: document.getElementById('bill-notes').value,
        isActive: true,
        isAutoDetected: false
      });
      modal.style.display = 'none';
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
