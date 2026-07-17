import { getAllCategories, saveCategory, seedDefaultCategories } from '../services/categoryService.js';

export async function renderCategories() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Categories...</div>`;
  
  try {
    // Ensure we have defaults if empty
    await seedDefaultCategories();
    const categories = await getAllCategories();
    
    const catList = categories.map(c => `
      <div class="card" style="margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-md);">
        <div style="width:40px; height:40px; border-radius:50%; background:${c.color}; display:flex; align-items:center; justify-content:center; font-size:1.2em;">
          ${c.icon}
        </div>
        <div style="flex:1;">
          <strong>${c.name}</strong>
          <div style="font-size: 0.8em; color: var(--text-secondary); text-transform: capitalize;">${c.type}</div>
        </div>
      </div>
    `).join('');

    main.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h1>Categories</h1>
        <button id="add-cat-btn" class="btn btn--primary">+ Add</button>
      </div>
      
      <div id="categories-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--spacing-md);">
        ${catList}
      </div>
    `;
    
    // Add logic similar to Accounts for MVP
    // Hidden here to keep file terse. Can expand later.
  } catch (err) {
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
