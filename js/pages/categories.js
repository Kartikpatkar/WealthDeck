import { getAllCategories, saveCategory, deleteCategory } from '../services/categoryService.js';
import { confirmModal } from '../components/modal.js';
import { ICONS } from '../utils/icons.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Categories...</div>`;
  
  try {
    const categories = await getAllCategories();
    
    const catList = categories.map(c => `
      <div class="card" style="margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-md);">
        <div style="width:40px; height:40px; border-radius:50%; background:${c.color}; display:flex; align-items:center; justify-content:center; font-size:1.2em; color:#fff;">
          ${c.icon}
        </div>
        <div style="flex:1;">
          <strong>${c.name}</strong>
          <div style="font-size: 0.8em; color: var(--text-secondary); text-transform: capitalize;">${c.type}</div>
        </div>
        <div>
          <button class="edit-cat-btn" data-id="${c.id}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">Edit</button>
          <button class="delete-cat-btn" data-id="${c.id}" style="background:none; border:none; color:var(--color-expense); cursor:pointer;">Delete</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Categories</h1>
        <button id="add-cat-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="categories-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--spacing-md);">
        ${catList}
      </div>
      
      <div id="add-cat-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:var(--z-modal); padding:var(--spacing-lg);">
        <div class="card" style="max-width: 400px; margin: 10vh auto;">
          <h2>Category</h2>
          <form id="add-cat-form" style="display:flex; flex-direction:column; gap:var(--spacing-md); margin-top:var(--spacing-md);">
            <input type="hidden" id="cat-id">
            <input type="text" id="cat-name" placeholder="Category Name" required class="input">
            <select id="cat-type" required class="input">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select id="cat-icon" required class="input">
              ${Object.keys(ICONS).map(k => `<option value='${ICONS[k].replace(/'/g, "&apos;")}'>${k}</option>`).join('')}
            </select>
            <input type="color" id="cat-color" value="#6366f1" required class="input" style="height: 40px; padding: 2px;">
            <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-md);">
              <button type="button" id="close-cat-btn" class="btn">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.getElementById('categories-list').addEventListener('click', async (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.classList.contains('delete-cat-btn')) {
        if (await confirmModal('Delete Category', 'Are you sure? Transactions under this category will lose their category association.')) {
          await deleteCategory(id);
          render(container);
        }
      } else if (e.target.classList.contains('edit-cat-btn')) {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          document.getElementById('cat-id').value = cat.id;
          document.getElementById('cat-name').value = cat.name;
          document.getElementById('cat-type').value = cat.type;
          document.getElementById('cat-icon').value = cat.icon;
          document.getElementById('cat-color').value = cat.color || '#6366f1';
          document.getElementById('add-cat-modal').style.display = 'block';
        }
      }
    });
    
    const modal = document.getElementById('add-cat-modal');
    document.getElementById('add-cat-btn').addEventListener('click', () => {
      document.getElementById('add-cat-form').reset();
      document.getElementById('cat-id').value = '';
      modal.style.display = 'block';
    });
    document.getElementById('close-cat-btn').addEventListener('click', () => modal.style.display = 'none');
    
    document.getElementById('add-cat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('cat-name').value,
        type: document.getElementById('cat-type').value,
        icon: document.getElementById('cat-icon').value,
        color: document.getElementById('cat-color').value
      };
      
      const idStr = document.getElementById('cat-id').value;
      if (idStr) payload.id = Number(idStr);
      
      await saveCategory(payload);
      modal.style.display = 'none';
      render(container);
    });
    
  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
