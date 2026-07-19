import { getAllCategories, saveCategory, deleteCategory } from '../services/categoryService.js';
import { confirmModal } from '../components/modal.js';
import { ICONS } from '../utils/icons.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Categories...</div>`;
  
  try {
    const categories = await getAllCategories();
    
    let catList = '';
    if (categories.length === 0) {
      catList = `<div class="hint" style="margin-top:40px;">No categories set. Create your first category.</div>`;
    } else {
      catList = categories.map(c => `
        <div class="budget-item" data-id="${c.id}" style="cursor:pointer; padding: 12px 0;">
          <div class="budget-top" style="align-items: center;">
            <div class="name" style="display:flex; align-items:center; gap:12px;">
              <div style="width:36px; height:36px; border-radius:12px; background:${c.color}; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff;">
                ${c.icon}
              </div>
              <div style="display:flex; flex-direction:column;">
                <span style="font-weight:600; font-size:15px; color:var(--text-primary);">${c.name}</span>
                <span style="font-size:12px; color:var(--text-secondary); text-transform:capitalize;">${c.type}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      catList = `<div class="card">${catList}</div>`;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 19px; font-weight: 700;">Categories</h2>
        <button id="add-cat-btn" class="icon-btn" aria-label="Add category" style="color:var(--color-primary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div id="categories-list">${catList}</div>
      
      <div class="modal-overlay" id="add-cat-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Category</h3>
            <button type="button" class="modal-close" id="close-cat-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="add-cat-form">
            <input type="hidden" id="cat-id">
            <div class="field">
              <label>Category Name</label>
              <input type="text" id="cat-name" placeholder="e.g. Groceries" required>
            </div>
            
            <div class="field-row">
              <div class="field" style="flex:1;">
                <label>Type</label>
                <select id="cat-type" required>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div class="field" style="flex:1;">
                <label>Icon</label>
                <select id="cat-icon" required>
                  ${Object.keys(ICONS).map(k => `<option value='${ICONS[k].replace(/'/g, "&apos;")}'>${k}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="field">
              <label>Color Tag</label>
              <input type="color" id="cat-color" value="#6366f1" required style="height: 44px; padding: 2px;">
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-cat-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save category</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Modal behavior
    const modalOverlay = document.getElementById('add-cat-modal');
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeModal();
    });
    document.getElementById('close-cat-modal').addEventListener('click', closeModal);
    
    function openModal() {
      modalOverlay.classList.add('open');
    }
    function closeModal() {
      modalOverlay.classList.remove('open');
    }

    document.getElementById('categories-list').addEventListener('click', async (e) => {
      const row = e.target.closest('.budget-item');
      if(!row) return;
      const id = Number(row.dataset.id);
      const cat = categories.find(c => c.id === id);
      if (cat) {
        document.getElementById('cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-type').value = cat.type;
        document.getElementById('cat-icon').value = cat.icon;
        document.getElementById('cat-color').value = cat.color || '#6366f1';
        document.getElementById('delete-cat-btn').style.display = 'block';
        openModal();
      }
    });

    document.getElementById('delete-cat-btn').addEventListener('click', async () => {
      const id = Number(document.getElementById('cat-id').value);
      if (id && await confirmModal('Delete Category', 'Are you sure? Transactions under this category will lose their category association.')) {
        await deleteCategory(id);
        closeModal();
        render(container);
      }
    });
    
    document.getElementById('add-cat-btn').addEventListener('click', () => {
      document.getElementById('add-cat-form').reset();
      document.getElementById('cat-id').value = '';
      document.getElementById('delete-cat-btn').style.display = 'none';
      openModal();
    });
    
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
      closeModal();
      render(container);
    });
    
  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
export function destroy() {}
