import { getAllBills, saveBill, deleteBill } from '../services/billService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { getAllAccounts } from '../services/accountService.js';
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
            <div style="margin-top:4px;">
              <button class="edit-bill-btn" data-id="${b.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:0.8em; margin-right:var(--spacing-sm);">Edit</button>
              <button class="delete-bill-btn" data-id="${b.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer; font-size:0.8em;">Delete</button>
            </div>
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
      
      <div id="add-bill-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg); overflow-y:auto;">
        <div class="card" style="max-width: 400px; margin: 5vh auto;">
          <h2>Bill</h2>
          <form id="add-bill-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="hidden" id="bill-id">
            <input type="text" id="bill-name" placeholder="Bill Name" required class="input">
            <input type="number" step="0.01" id="bill-amount" placeholder="Amount" required class="input">
            <select id="bill-category" required class="input"></select>
            <select id="bill-account" required class="input"><option value="">Pay From Account</option></select>
            <select id="bill-frequency" required class="input">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" id="bill-date" required class="input">
            <label style="display:flex; align-items:center; gap:var(--spacing-xs);">
              <input type="checkbox" id="bill-auto-pay"> Auto-pay enabled
            </label>
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-bill-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('bills-list').addEventListener('click', async (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('delete-bill-btn')) {
        if (await confirmModal('Delete Bill', 'Are you sure?')) {
          await deleteBill(id);
          render(container);
        }
      } else if (e.target.classList.contains('edit-bill-btn')) {
        const b = bills.find(x => x.id === id);
        if (b) {
          const categories = await getAllCategories();
          document.getElementById('bill-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
          const accounts = await getAllAccounts();
          document.getElementById('bill-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
          
          document.getElementById('bill-id').value = b.id;
          document.getElementById('bill-name').value = b.name;
          document.getElementById('bill-amount').value = (b.amount / 100).toFixed(2);
          document.getElementById('bill-frequency').value = b.frequency;
          document.getElementById('bill-date').value = new Date(b.nextDueDate).toISOString().split('T')[0];
          document.getElementById('bill-account').value = b.accountId || '';
          document.getElementById('bill-category').value = b.categoryId || '';
          document.getElementById('bill-auto-pay').checked = b.autoPay || false;
          
          document.getElementById('add-bill-modal').style.display = 'block';
        }
      }
    });

    const modal = document.getElementById('add-bill-modal');
    document.getElementById('add-bill-btn').addEventListener('click', async () => {
      document.getElementById('add-bill-form').reset();
      document.getElementById('bill-id').value = '';
      const categories = await getAllCategories();
      document.getElementById('bill-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      const accounts = await getAllAccounts();
      document.getElementById('bill-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      
      document.getElementById('bill-date').valueAsDate = new Date();
      modal.style.display = 'block';
    });
    
    document.getElementById('close-bill-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-bill-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('bill-name').value,
        amount: parseFloat(document.getElementById('bill-amount').value),
        categoryId: Number(document.getElementById('bill-category').value),
        frequency: document.getElementById('bill-frequency').value,
        nextDueDate: document.getElementById('bill-date').value,
        accountId: Number(document.getElementById('bill-account').value),
        autoPay: document.getElementById('bill-auto-pay').checked,
        isActive: true
      };
      
      const idStr = document.getElementById('bill-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveBill(payload);
      modal.style.display = 'none';
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
