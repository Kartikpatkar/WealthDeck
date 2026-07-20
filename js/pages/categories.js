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
                <div id="cat-icon-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; max-height: 150px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-surface);">
                  ${Object.keys(ICONS).map(k => `
                    <button type="button" class="icon-swatch-btn" data-svg='${ICONS[k].replace(/'/g, "&apos;")}' title="${k}" style="width: 40px; height: 40px; border-radius: 8px; background: transparent; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); transition: 0.2s;">
                      ${ICONS[k]}
                    </button>
                  `).join('')}
                </div>
                <input type="hidden" id="cat-icon" required>
              </div>
            </div>
            
            <div class="field">
              <label>Color Tag</label>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${[
                  { hex: '#6366f1' }, { hex: '#10b981' }, { hex: '#f43f5e' },
                  { hex: '#f59e0b' }, { hex: '#0ea5e9' }, { hex: '#8b5cf6' },
                  { hex: '#ec4899' }, { hex: '#14b8a6' }
                ].map((c, i) => `
                  <label style="cursor: pointer; position: relative;">
                    <input type="radio" name="cat-color" value="${c.hex}" ${i === 0 ? 'checked' : ''} style="position: absolute; opacity: 0;">
                    <div class="cat-color-swatch" style="width: 32px; height: 32px; border-radius: 50%; background: ${c.hex}; border: 2px solid transparent; transition: 0.2s;"></div>
                  </label>
                `).join('')}
                <label style="cursor: pointer; position: relative;" title="Custom Color">
                  <input type="radio" name="cat-color" value="custom" style="position: absolute; opacity: 0;">
                  <div class="cat-color-swatch custom-swatch-btn" style="width: 32px; height: 32px; border-radius: 50%; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); border: 2px solid transparent; transition: 0.2s; display: flex; align-items: center; justify-content: center;"></div>
                  <input type="color" id="cat-custom-color-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                </label>
              </div>
            </div>

            <div style="display:flex; gap:10px; margin-top:24px;">
              <button type="button" class="btn btn--secondary" id="delete-cat-btn" style="display:none; flex:0.4;">Delete</button>
              <button type="submit" class="btn" style="flex:1;">Save category</button>
            </div>
          </form>
        </div>
      </div>
      <style>
        input[name="cat-color"]:checked + .cat-color-swatch {
          border-color: var(--text-primary) !important;
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .icon-swatch-btn.active {
          border-color: var(--text-primary) !important;
          background: rgba(100, 100, 100, 0.1) !important;
        }
      </style>
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
        
        // Icon
        document.getElementById('cat-icon').value = cat.icon;
        document.querySelectorAll('.icon-swatch-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.svg === cat.icon);
        });
        
        // Color
        const colorInput = document.querySelector(`input[name="cat-color"][value="${cat.color}"]`);
        if (colorInput) {
          colorInput.checked = true;
        } else {
          // Custom color
          const customRadio = document.querySelector('input[name="cat-color"][value="custom"]');
          if (customRadio) {
            customRadio.value = cat.color;
            customRadio.checked = true;
            document.querySelector('.custom-swatch-btn').style.background = cat.color;
          } else {
            document.querySelector('input[name="cat-color"]').checked = true;
          }
        }
        
        document.getElementById('delete-cat-btn').style.display = 'block';
        openModal();
      }
    });

    // Custom color picker bindings
    const customRadio = document.querySelector('input[name="cat-color"][value="custom"]');
    const customInput = document.getElementById('cat-custom-color-input');
    const customBtn = document.querySelector('.custom-swatch-btn');
    
    if (customRadio && customInput) {
      customRadio.addEventListener('change', () => {
        if (customRadio.checked) {
          customRadio.value = 'custom';
          customInput.click();
        }
      });
      
      customInput.addEventListener('input', (e) => {
        customRadio.value = e.target.value;
        customBtn.style.background = e.target.value;
        customRadio.checked = true;
      });
    }
    
    // Icon grid bindings
    document.querySelectorAll('.icon-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.icon-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('cat-icon').value = btn.dataset.svg;
      });
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
      
      // Default icon
      const firstIconBtn = document.querySelector('.icon-swatch-btn');
      if (firstIconBtn) {
        document.querySelectorAll('.icon-swatch-btn').forEach(b => b.classList.remove('active'));
        firstIconBtn.classList.add('active');
        document.getElementById('cat-icon').value = firstIconBtn.dataset.svg;
      }
      
      // Default color to first
      document.querySelector('input[name="cat-color"]').checked = true;
      if (customRadio) {
        customRadio.value = 'custom';
        customBtn.style.background = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';
      }
      
      document.getElementById('delete-cat-btn').style.display = 'none';
      openModal();
    });
    
    document.getElementById('add-cat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('cat-name').value,
        type: document.getElementById('cat-type').value,
        icon: document.getElementById('cat-icon').value,
        color: document.querySelector('input[name="cat-color"]:checked').value
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
