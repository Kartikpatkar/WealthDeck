import { getAllGoals, saveGoal, deleteGoal } from '../services/goalService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Goals...</div>`;
  
  try {
    const goals = await getAllGoals();
    
    let listHTML = '';
    if (goals.length === 0) {
      listHTML = `<div class="hint mod-style-c43a02">No savings goals. Create your first goal to track your progress.</div>`;
    } else {
      listHTML = goals.map(g => {
        const percent = Math.min(((g.savedAmount || 0) / g.targetAmount) * 100, 100);
        return `
        <div class="budget-item mod-style-dc3988" data-id="${g.id}">
          <div class="budget-top mod-style-ec5554">
            <div class="name mod-style-6cbc10">
              <span class="mod-style-957708">${g.name}</span>
              <span class="mod-style-c0485e">Target: ${formatCurrency(g.targetAmount)} &bull; ${formatDate(g.targetDate)}</span>
            </div>
            <div class="amt mod-style-d36839">
              <span class="mod-style-88e69f">${formatCurrency(g.savedAmount || 0)}</span>
              <span class="mod-style-19b310">${percent.toFixed(0)}%</span>
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
      <div class="mod-style-1b4308">
        <h2 class="mod-style-09251a">Savings Goals</h2>
        <button class="icon-btn mod-style-3bb313" id="add-goal-btn"  aria-label="Add goal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div id="goals-list">${listHTML}</div>
      
      <div class="modal-overlay" id="add-goal-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Goal</h3>
            <button class="modal-close" type="button"  id="close-goal-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="add-goal-form">
            <input type="hidden" id="goal-id">
            
            <div class="field">
              <label>Goal Name</label>
              <input type="text" id="goal-name" placeholder="e.g. New Car" required>
            </div>
            
            <div class="mod-style-638270">Target Amount</div>
            <div class="amount-input-wrap mod-style-57eca1">
              <span class="cur">${getCurrencySymbol()}</span>
              <input class="amount-input" type="number" step="0.01"  id="goal-target" placeholder="0.00" required>
            </div>
            
            <div class="mod-style-4b5815">Already Saved (Optional)</div>
            <div class="amount-input-wrap mod-style-57eca1">
              <span class="cur">${getCurrencySymbol()}</span>
              <input class="amount-input mod-style-88e69f" type="number" step="0.01"  id="goal-current" placeholder="0.00">
            </div>
            
            <div class="field">
              <label>Target Date</label>
              <input type="date" id="goal-date" required>
            </div>
            
            <div class="mod-style-3fbd1a">
              <button class="btn btn--secondary mod-style-1da7e6" type="button"  id="delete-goal-btn">Delete</button>
              <button class="btn mod-style-d5e8c5" type="submit">Save goal</button>
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
    container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
