import { getAllTransactions } from '../services/transactionService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';

export async function renderReports() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="loading">Loading Reports...</div>`;
  
  try {
    const transactions = await getAllTransactions();
    const categories = await getAllCategories();
    
    // Process data for chart: Expenses by Category
    const expenses = transactions.filter(t => t.type === 'expense');
    const catMap = categories.reduce((map, c) => ({...map, [c.id]: c}), {});
    
    const summary = {};
    expenses.forEach(t => {
      const catName = catMap[t.categoryId]?.name || 'Uncategorized';
      summary[catName] = (summary[catName] || 0) + t.amount;
    });
    
    const labels = Object.keys(summary);
    const data = Object.values(summary);

    main.innerHTML = `
      <h1>Reports</h1>
      <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">Expense Breakdown</p>
      
      <div class="card" style="height: 400px; display:flex; align-items:center; justify-content:center;">
        ${expenses.length === 0 ? '<p>No expense data available.</p>' : '<canvas id="reports-chart" style="width:100%; height:100%;"></canvas>'}
      </div>
      
      <div class="card" style="margin-top: var(--spacing-md);">
        <h3>Summary Table</h3>
        ${labels.map((l, i) => `
          <div style="display:flex; justify-content:space-between; padding: var(--spacing-sm) 0; border-bottom:1px solid var(--border-light);">
            <span>${l}</span>
            <span class="mono">${formatCurrency(data[i])}</span>
          </div>
        `).join('')}
      </div>
    `;

    if (expenses.length > 0) {
      const ctx = document.getElementById('reports-chart');
      new Chart(ctx, {
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
    main.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}
