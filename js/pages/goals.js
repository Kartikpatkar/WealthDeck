import { getAllGoals, saveGoal, deleteGoal } from '../services/goalService.js';
import { confirmModal } from '../components/modal.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Goals...</div>`;
  
  try {
    const goals = await getAllGoals();
    
    let listHTML = '';
    if (goals.length === 0) {
      listHTML = `<p>No savings goals. Create your first goal below.</p>`;
    } else {
      listHTML = goals.map(g => {
        const percent = Math.min(((g.savedAmount || 0) / g.targetAmount) * 100, 100);
        return `
        <div class="card" style="margin-bottom: var(--spacing-sm);">
          <h3>${g.name}</h3>
          <div style="display: flex; justify-content: space-between; margin: var(--spacing-sm) 0; align-items: center;">
            <span>${formatCurrency(g.savedAmount || 0)}</span>
            <span>Target: ${formatCurrency(g.targetAmount)} by ${formatDate(g.targetDate)}</span>
            <div>
              <button class="edit-goal-btn" data-id="${g.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; margin-right:var(--spacing-sm);">Edit</button>
              <button class="delete-goal-btn" data-id="${g.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer;">Delete</button>
            </div>
          </div>
          <div style="background: var(--bg-primary); border-radius: 4px; height: 12px; overflow: hidden;">
            <div style="width: ${percent}%; height: 100%; background: var(--color-primary);"></div>
          </div>
        </div>
      `}).join('');
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Savings Goals</h1>
        <button id="add-goal-btn" class="btn btn--primary">+ Add</button>
      </div>
      <div id="goals-list">${listHTML}</div>
      
      <div id="add-goal-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 10vh auto;">
          <h2>Goal</h2>
          <form id="add-goal-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="hidden" id="goal-id">
            <input type="text" id="goal-name" placeholder="Goal Name" required class="input">
            <input type="number" step="0.01" id="goal-target" placeholder="Target Amount" required class="input">
            <input type="number" step="0.01" id="goal-current" placeholder="Initial Saved Amount" class="input">
            <input type="date" id="goal-date" required class="input">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-goal-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('goals-list').addEventListener('click', async (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('delete-goal-btn')) {
        if (await confirmModal('Delete Goal', 'Are you sure?')) {
          await deleteGoal(id);
          render(container);
        }
      } else if (e.target.classList.contains('edit-goal-btn')) {
        const g = goals.find(x => x.id === id);
        if (g) {
          document.getElementById('goal-id').value = g.id;
          document.getElementById('goal-name').value = g.name;
          document.getElementById('goal-target').value = (g.targetAmount / 100).toFixed(2);
          document.getElementById('goal-current').value = g.savedAmount ? (g.savedAmount / 100).toFixed(2) : '0.00';
          document.getElementById('goal-date').value = new Date(g.targetDate).toISOString().split('T')[0];
          document.getElementById('add-goal-modal').style.display = 'block';
        }
      }
    });

    const modal = document.getElementById('add-goal-modal');
    document.getElementById('add-goal-btn').addEventListener('click', () => {
      document.getElementById('add-goal-form').reset();
      document.getElementById('goal-id').value = '';
      document.getElementById('goal-date').valueAsDate = new Date();
      modal.style.display = 'block';
    });
    
    document.getElementById('close-goal-btn').addEventListener('click', () => modal.style.display = 'none');
    
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
      modal.style.display = 'none';
      render(container);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
