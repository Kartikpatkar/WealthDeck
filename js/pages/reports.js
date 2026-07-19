import { getAllTransactions } from '../services/transactionService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

let chartInstance = null;

export async function render(container, params = {}) {
  
  // Basic framework for rendering with filter state
  let currentFilter = 'this-month';
  
  async function draw() {
    container.innerHTML = `<div class="loading">Loading Reports...</div>`;
    
    try {
      const transactions = await getAllTransactions();
      const categories = await getAllCategories();
      
      // Apply date filter
      const now = new Date();
      let startDate = new Date(0);
      let endDate = new Date(now);
      
      if (currentFilter === 'this-month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (currentFilter === 'last-month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // End of last month
      }
      
      const expenses = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && (currentFilter === 'all-time' || (d >= startDate && d <= endDate));
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
        <div class="page-head">
          <h2>Reports</h2>
          <select id="report-filter" style="width: 130px; margin-bottom:0; font-size:13px; padding: 6px 10px;">
            <option value="this-month" ${currentFilter === 'this-month' ? 'selected' : ''}>This Month</option>
            <option value="last-month" ${currentFilter === 'last-month' ? 'selected' : ''}>Last Month</option>
            <option value="all-time" ${currentFilter === 'all-time' ? 'selected' : ''}>All Time</option>
          </select>
        </div>

        
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">Expense Breakdown</p>
        
        <div class="card" style="display:flex; align-items:center; justify-content:center;">
          ${expenses.length === 0 ? '<p style="height:400px; display:flex; align-items:center;">No expense data available for this period.</p>' : '<div style="position: relative; height: 400px; width: 100%; overflow: hidden;"><canvas id="reports-chart" style="width: 100%; height: 100%;"></canvas></div>'}
        </div>
        
        <div class="card" style="margin-top: var(--spacing-md);">
          <h3>Summary Table</h3>
          ${labels.length === 0 ? '<p>No data</p>' : labels.map((l, i) => `
            <div style="display:flex; justify-content:space-between; padding: var(--spacing-sm) 0; border-bottom:1px solid var(--border-light);">
              <span>${l}</span>
              <span class="mono">${formatCurrency(Object.values(summary)[i])}</span>
            </div>
          `).join('')}
        </div>
      `;
      
      document.getElementById('report-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        draw();
      });

      if (expenses.length > 0) {
        if (chartInstance) {
          chartInstance.destroy();
        }
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim() || 'rgba(255,255,255,0.1)';
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8';
        
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
              y: { grid: { color: gridColor }, ticks: { color: textColor } },
              x: { grid: { display: false }, ticks: { color: textColor } }
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

export function destroy() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
