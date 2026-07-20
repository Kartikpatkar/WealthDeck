import { getAllCategories, saveCategory, deleteCategory } from '../services/categoryService.js';
import { confirmModal } from '../components/modal.js';
import { ICONS } from '../utils/icons.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Categories...</div>`;

  try {
    const categories = await getAllCategories();

    let catList = '';
    if (categories.length === 0) {
      catList = `<div class="hint mod-style-c43a02">No categories set. Create your first category.</div>`;
    } else {
      const grouped = { expense: [], income: [], transfer: [] };
      categories.forEach(c => {
        if (!grouped[c.type]) grouped[c.type] = [];
        grouped[c.type].push(c);
      });

      const renderGroup = (title, items) => {
        if (!items || items.length === 0) return '';
        return `
          <h3 class="category-group-title">${title}</h3>
          <div class="card">
            ${items.map(c => `
              <div class="budget-item mod-style-dc3988" data-id="${c.id}">
                <div class="budget-top mod-style-d0da85">
                  <div class="name mod-style-7f8dc0">
                    <div class="category-icon-badge" style="background:${c.color};">
                      ${c.icon}
                    </div>
                    <div class="mod-style-6cbc10">
                      <span class="mod-style-957708">${c.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      };

      catList = renderGroup('Expense', grouped.expense) +
        renderGroup('Income', grouped.income) +
        renderGroup('Transfer', grouped.transfer);
    }

    container.innerHTML = `
      <div class="mod-style-1b4308">
        <h2 class="mod-style-09251a">Categories</h2>
        <button class="icon-btn mod-style-3bb313" id="add-cat-btn"  aria-label="Add category">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      
      <div id="categories-list">${catList}</div>
      
      <div class="modal-overlay" id="add-cat-modal">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-head">
            <h3>Category</h3>
            <button class="modal-close" type="button"  id="close-cat-modal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="add-cat-form">
            <input type="hidden" id="cat-id">
            <div class="field">
              <label>Category Name</label>
              <input type="text" id="cat-name" placeholder="e.g. Groceries" required>
            </div>
            
            <div class="field">
              <div class="field mod-style-d5e8c5">
                <label>Type</label>
                <select id="cat-type" required>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div class="field">
                <label>Icon</label>
                <div class="icon-grid-modern" id="cat-icon-grid">
                  ${Object.keys(ICONS).map(k => `
                    <button class="icon-swatch-btn" type="button"  data-svg='${ICONS[k].replace(/'/g, "&apos;")}' title="${k}">
                      ${ICONS[k]}
                    </button>
                  `).join('')}
                </div>
                <input type="hidden" id="cat-icon" required>
              </div>
            </div>
            
            <div class="field">
              <label>Color Tag</label>
              <div class="mod-style-9551b6">
                ${[
        { hex: '#6366f1' }, { hex: '#10b981' }, { hex: '#f43f5e' },
        { hex: '#f59e0b' }, { hex: '#0ea5e9' }, { hex: '#8b5cf6' },
        { hex: '#ec4899' }, { hex: '#14b8a6' }
      ].map((c, i) => `
                  <label class="mod-style-1034c1">
                    <input class="mod-style-628c86" type="radio" name="cat-color" value="${c.hex}" ${i === 0 ? 'checked' : ''}>
                    <div class="cat-color-swatch color-swatch-sm" style="background: ${c.hex};"></div>
                  </label>
                `).join('')}
                <label class="mod-style-1034c1" title="Custom Color">
                  <input class="mod-style-628c86" type="radio" name="cat-color" value="custom">
                  <div class="cat-color-swatch custom-swatch-btn mod-style-e93ae7"></div>
                  <input class="mod-style-2a85bc" type="color" id="cat-custom-color-input">
                </label>
              </div>
            </div>

            <div class="mod-style-3fbd1a">
              <button class="btn btn--secondary mod-style-1da7e6" type="button"  id="delete-cat-btn">Delete</button>
              <button class="btn mod-style-d5e8c5" type="submit">Save category</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal behavior
    const modalOverlay = document.getElementById('add-cat-modal');
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
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
      if (!row) return;
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
    container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
  }
}
export function destroy() { }
