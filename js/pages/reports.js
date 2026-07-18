import { getAllTransactions } from '../services/transactionService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function render(container, params = {}) {
  
  // Basic framework for rendering with filter state
  let currentFilter = 'this-month';
  let chartInstance = null;
  
  async function draw() {
    container.innerHTML = `<div class="loading">Loading Reports...</div>`;
    
    try {
      const transactions = await getAllTransactions();
      const categories = await getAllCategories();
      
      // Apply date filter
      const now = new Date();
      let startDate = new Date(0);
      
      if (currentFilter === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (currentFilter === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        now.setDate(0); // End of last month
      }
      
      const expenses = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && (currentFilter === 'all-time' || (d >= startDate && d <= now));
      });
      
      const catMap = categories.reduce((map, c) => ({...map, [c.id]: c}), {});
      
      const summary = {};
      expenses.forEach(t => {
        const catName = catMap[t.categoryId]?.name || 'Uncategorized';
        summary[catName] = (summary[catName] || 0) + t.amount;
      });
      
      const labels = Object.keys(summary);
      const data = Object.values(summary).map(v => v / 100);

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--spacing-lg);">
          <h1>Reports</h1>
          <select id="report-filter" class="input" style="width: 150px; margin-bottom:0;">
            <option value="this-month" ${currentFilter === 'this-month' ? 'selected' : ''}>This Month</option>
            <option value="last-month" ${currentFilter === 'last-month' ? 'selected' : ''}>Last Month</option>
            <option value="all-time" ${currentFilter === 'all-time' ? 'selected' : ''}>All Time</option>
          </select>
        </div>
        
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">Expense Breakdown</p>
        
        <div class="card" style="height: 400px; display:flex; align-items:center; justify-content:center;">
          ${expenses.length === 0 ? '<p>No expense data available for this period.</p>' : '<canvas id="reports-chart" style="width:100%; height:100%;"></canvas>'}
        </div>
        
        <div class="card" style="margin-top: var(--spacing-md);">
          <h3>Summary Table</h3>
          ${labels.length === 0 ? '<p>No data</p>' : labels.map((l, i) => `
            <div style="display:flex; justify-content:space-between; padding: var(--spacing-sm) 0; border-bottom:1px solid var(--border-light);">
              <span>${l}</span>
              <span class="mono">${formatCurrency(data[i])}</span>
            </div>
          `).join('')}
        </div>
      `;
      
      document.getElementById('report-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        draw();
      });

      if (expenses.length > 0) {
        const ctx = document.getElementById('reports-chart');
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Spent',
              data: data,
              backgroundColor: '#60a5fa',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
              x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
          }
        });
      }

    } catch (err) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
  
  draw();
}
export function destroy() {}
