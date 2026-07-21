import { getAllBills, saveBill, deleteBill } from '../services/billService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { getAllAccounts } from '../services/accountService.js';
import { formatCurrency, getCurrencySymbol, formatDate } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Bills...</div>`;
  
  try {
    const bills = await getAllBills();
    
    let listHTML = '';
    if (bills.length === 0) {
      listHTML = `<div class="hint mod-style-c43a02">No recurring bills. Add one to track automatically.</div>`;
    } else {
      listHTML = bills.map(b => `
        <div class="budget-item mod-style-dc3988" data-id="${b.id}">
          <div class="budget-top mod-style-d0da85">
            <div class="name mod-style-6cbc10">
              <span class="mod-style-957708">${b.name}</span>
              <span class="mod-style-c0485e">Due: ${formatDate(b.nextDueDate)} &bull; ${b.frequency}</span>
            </div>
            <div class="amt mod-style-d36839">
              <span>${formatCurrency(b.amount)}</span>
              ${b.autoPay ? '<span class="mod-style-ce5a8c">Auto-pay</span>' : ''}
            </div>
          </div>
        </div>
      `).join('');
      listHTML = `<div class="card">${listHTML}</div>`;
    }

    container.innerHTML = `
      <div class="mod-style-1b4308">
        <h2 class="mod-style-09251a">Recurring Bills</h2>
        <button class="icon-btn mod-style-3bb313" id="add-bill-btn"  aria-label="Add bill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div id="bills-list">${listHTML}</div>
      
      <div class="modal-overlay" id="add-bill-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Bill</h3>
            <button class="modal-close" type="button"  id="close-bill-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <form id="add-bill-form">
            <input type="hidden" id="bill-id">
            
            <div class="field">
              <label>Bill Name</label>
              <input type="text" id="bill-name" placeholder="e.g. Netflix" required>
            </div>
            
            <div class="amount-input-wrap mod-style-a81293">
              <span class="cur">${getCurrencySymbol()}</span>
              <input class="amount-input" type="number" step="0.01"  id="bill-amount" placeholder="0.00" required>
            </div>
            
            <div class="field">
              <label>Next Due Date</label>
              <input type="date" id="bill-date" required>
            </div>
            
            <div class="field-row">
              <div class="field mod-style-d5e8c5">
                <label>Frequency</label>
                <select id="bill-frequency" required>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div class="field mod-style-d5e8c5">
                <label>Category</label>
                <select id="bill-category" required></select>
              </div>
            </div>
            
            <div class="field">
              <label>Pay From Account</label>
              <select id="bill-account" required></select>
            </div>
            
            <div class="field mod-style-492ec0">
              <input class="mod-style-075519" type="checkbox" id="bill-auto-pay">
              <label class="mod-style-46dcee" for="bill-auto-pay">Enable Auto-pay</label>
            </div>
            
            <div class="mod-style-3fbd1a">
              <button class="btn btn--secondary mod-style-1da7e6" type="button"  id="delete-bill-btn">Delete</button>
              <button class="btn mod-style-d5e8c5" type="submit">Save bill</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modalOverlay = document.getElementById('add-bill-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-bill-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }

    document.getElementById('bills-list').addEventListener('click', async (e) => {
      const row = e.target.closest('.budget-item');
      if(!row) return;
      const id = Number(row.dataset.id);
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
        
        document.getElementById('delete-bill-btn').style.display = 'block';
        openModal();
      }
    });

    document.getElementById('delete-bill-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('bill-id').value);
      if (id && await confirmModal('Delete Bill', 'Are you sure?')) {
        await deleteBill(id);
        closeModal();
        render(container);
      }
    });

    document.getElementById('add-bill-btn').addEventListener('click', async () => {
      document.getElementById('add-bill-form').reset();
      document.getElementById('bill-id').value = '';
      const categories = await getAllCategories();
      document.getElementById('bill-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      const accounts = await getAllAccounts();
      document.getElementById('bill-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      
      const defaultAcc = accounts.find(a => a.isDefault);
      if(defaultAcc) {
        document.getElementById('bill-account').value = defaultAcc.id;
      }
      
      document.getElementById('bill-date').valueAsDate = new Date();
      document.getElementById('delete-bill-btn').style.display = 'none';
      openModal();
    });
    
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
      closeModal();
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
