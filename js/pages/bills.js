import { getAllBills, saveBill, deleteBill } from '../services/billService.js';
import { confirmModal } from '../components/modal.js';
import { getAllCategories } from '../services/categoryService.js';
import { getAllAccounts } from '../services/accountService.js';
import { formatCurrency, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Bills...</div>`;
  
  try {
    const bills = await getAllBills();
    
    let listHTML = '';
    if (bills.length === 0) {
      listHTML = `<div class="hint" style="margin-top:40px;">No recurring bills. Add one to track automatically.</div>`;
    } else {
      listHTML = bills.map(b => `
        <div class="budget-item" data-id="${b.id}" style="cursor:pointer; padding: 12px 0;">
          <div class="budget-top" style="align-items: center;">
            <div class="name" style="display:flex; flex-direction:column;">
              <span style="font-weight:600; font-size:15px; color:var(--text-primary);">${b.name}</span>
              <span style="font-size:12px; color:var(--text-secondary);">Due: ${new Date(b.nextDueDate).toLocaleDateString()} &bull; ${b.frequency}</span>
            </div>
            <div class="amt" style="display:flex; flex-direction:column; align-items:flex-end;">
              <span>${formatCurrency(b.amount)}</span>
              ${b.autoPay ? '<span style="font-size:10px; color:var(--color-primary);">Auto-pay</span>' : ''}
            </div>
          </div>
        </div>
      `).join('');
      listHTML = `<div class="card">${listHTML}</div>`;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 19px; font-weight: 700;">Recurring Bills</h2>
        <button id="add-bill-btn" class="icon-btn" aria-label="Add bill" style="color:var(--color-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div id="bills-list">${listHTML}</div>
      
      <div class="modal-overlay" id="add-bill-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Bill</h3>
            <button type="button" class="modal-close" id="close-bill-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <form id="add-bill-form">
            <input type="hidden" id="bill-id">
            
            <div class="field">
              <label>Bill Name</label>
              <input type="text" id="bill-name" placeholder="e.g. Netflix" required>
            </div>
            
            <div class="amount-input-wrap" style="margin-top: 16px;">
              <span class="cur">${getCurrencySymbol()}</span>
              <input type="number" step="0.01" class="amount-input" id="bill-amount" placeholder="0.00" required>
            </div>
            
            <div class="field">
              <label>Next Due Date</label>
              <input type="date" id="bill-date" required>
            </div>
            
            <div class="field-row">
              <div class="field" style="flex:1;">
                <label>Frequency</label>
                <select id="bill-frequency" required>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div class="field" style="flex:1;">
                <label>Category</label>
                <select id="bill-category" required></select>
              </div>
            </div>
            
            <div class="field">
              <label>Pay From Account</label>
              <select id="bill-account" required></select>
            </div>
            
            <div class="field" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="bill-auto-pay" style="width:18px; height:18px;">
              <label for="bill-auto-pay" style="margin:0;">Enable Auto-pay</label>
            </div>
            
            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-bill-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save bill</button>
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
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
