import { getAllGoals, saveGoal, deleteGoal } from '../services/goalService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Goals...</div>`;
  
  try {
    const goals = await getAllGoals();
    
    let listHTML = '';
    if (goals.length === 0) {
      listHTML = `<div class="hint" style="margin-top:40px;">No savings goals. Create your first goal to track your progress.</div>`;
    } else {
      listHTML = goals.map(g => {
        const percent = Math.min(((g.savedAmount || 0) / g.targetAmount) * 100, 100);
        return `
        <div class="budget-item" data-id="${g.id}" style="cursor:pointer; padding: 12px 0;">
          <div class="budget-top" style="align-items: center; margin-bottom: 8px;">
            <div class="name" style="display:flex; flex-direction:column;">
              <span style="font-weight:600; font-size:15px; color:var(--text-primary);">${g.name}</span>
              <span style="font-size:12px; color:var(--text-secondary);">Target: ${formatCurrency(g.targetAmount)} &bull; ${formatDate(g.targetDate)}</span>
            </div>
            <div class="amt" style="display:flex; flex-direction:column; align-items:flex-end;">
              <span style="color:var(--color-income);">${formatCurrency(g.savedAmount || 0)}</span>
              <span style="font-size:11px; color:var(--text-secondary);">${percent.toFixed(0)}%</span>
            </div>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${percent}%;background:var(--color-primary)"></div>
          </div>
        </div>
      `}).join('');
      listHTML = `<div class="card">${listHTML}</div>`;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 19px; font-weight: 700;">Savings Goals</h2>
        <button id="add-goal-btn" class="icon-btn" aria-label="Add goal" style="color:var(--color-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div id="goals-list">${listHTML}</div>
      
      <div class="modal-overlay" id="add-goal-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Goal</h3>
            <button type="button" class="modal-close" id="close-goal-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="add-goal-form">
            <input type="hidden" id="goal-id">
            
            <div class="field">
              <label>Goal Name</label>
              <input type="text" id="goal-name" placeholder="e.g. New Car" required>
            </div>
            
            <div style="text-align:center; color:var(--text-secondary); font-size:12px; font-weight:600; margin-top:16px;">Target Amount</div>
            <div class="amount-input-wrap" style="margin-top: 4px;">
              <span class="cur">${getCurrencySymbol()}</span>
              <input type="number" step="0.01" class="amount-input" id="goal-target" placeholder="0.00" required>
            </div>
            
            <div style="text-align:center; color:var(--text-secondary); font-size:12px; font-weight:600;">Already Saved (Optional)</div>
            <div class="amount-input-wrap" style="margin-top: 4px;">
              <span class="cur">${getCurrencySymbol()}</span>
              <input type="number" step="0.01" class="amount-input" id="goal-current" placeholder="0.00" style="color:var(--color-income);">
            </div>
            
            <div class="field">
              <label>Target Date</label>
              <input type="date" id="goal-date" required>
            </div>
            
            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-goal-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save goal</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modalOverlay = document.getElementById('add-goal-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-goal-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }

    document.getElementById('goals-list').addEventListener('click', async (e) => {
      const row = e.target.closest('.budget-item');
      if(!row) return;
      const id = Number(row.dataset.id);
      
      const g = goals.find(x => x.id === id);
      if (g) {
        document.getElementById('goal-id').value = g.id;
        document.getElementById('goal-name').value = g.name;
        document.getElementById('goal-target').value = (g.targetAmount / 100).toFixed(2);
        document.getElementById('goal-current').value = g.savedAmount ? (g.savedAmount / 100).toFixed(2) : '0.00';
        document.getElementById('goal-date').value = new Date(g.targetDate).toISOString().split('T')[0];
        document.getElementById('delete-goal-btn').style.display = 'block';
        openModal();
      }
    });
    
    // Add delete handler inside the edit flow
    document.getElementById('delete-goal-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('goal-id').value);
      if (id && await confirmModal('Delete Goal', 'Are you sure?')) {
        await deleteGoal(id);
        closeModal();
        render(container);
      }
    });

    document.getElementById('add-goal-btn').addEventListener('click', () => {
      document.getElementById('add-goal-form').reset();
      document.getElementById('goal-id').value = '';
      document.getElementById('goal-date').valueAsDate = new Date();
      document.getElementById('delete-goal-btn').style.display = 'none';
      openModal();
    });
    
    document.getElementById('add-goal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        savedAmount: parseFloat(document.getElementById('goal-current').value) || 0,
        targetDate: document.getElementById('goal-date').value,
        isCompleted: false
      };
      
      const idStr = document.getElementById('goal-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveGoal(payload);
      closeModal();
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
