import { getAllTransactions } from '../services/transactionService.js';
import { getAllAccounts } from '../services/accountService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Dashboard...</div>`;
  
  try {
    const accounts = await getAllAccounts();
    const transactions = await getAllTransactions();
    const categories = await getAllCategories();
    
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    const recentTxns = transactions.slice(0, 5).map(t => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
        <div>
          <strong>${t.merchant || 'Transaction'}</strong>
          <div style="color: var(--text-secondary); font-size: 0.8em;">${formatDate(t.date)}</div>
        </div>
        <div style="color: ${t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}">
          ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
        </div>
      </div>
    `).join('') || '<p>No recent transactions.</p>';

    container.innerHTML = `
      <h1>Dashboard</h1>
      
      <div class="card" style="margin-bottom: var(--spacing-lg);">
        <h3 style="color: var(--text-secondary); font-weight: 500;">Total Balance</h3>
        <div class="mono" style="font-size: 2em; font-weight: 700;">${formatCurrency(totalBalance)}</div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; gap: var(--spacing-md);">
        <!-- Chart placeholder for later -->
        <div class="card">
          <h3>Spending Overview</h3>
          <canvas id="dashboard-chart" style="width: 100%; height: 200px;"></canvas>
        </div>
        
        <div class="card">
          <h3>Recent Transactions</h3>
          ${recentTxns}
          <div style="margin-top: var(--spacing-md); text-align: center;">
            <a href="#/transactions" class="btn btn--primary">View All</a>
          </div>
        </div>
      </div>
    `;
    
    initChart(transactions, categories);

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error loading dashboard: ${err.message}</p>`;
  }
}

function initChart(transactions, categories) {
  const ctx = document.getElementById('dashboard-chart');
  if (!ctx || !window.Chart) return;

  // Simple expense chart
  const expenses = transactions.filter(t => t.type === 'expense');
  const grouped = {};
  expenses.forEach(e => {
    grouped[e.categoryId] = (grouped[e.categoryId] || 0) + e.amount;
  });
  
  const catMap = categories.reduce((acc, c) => ({...acc, [c.id]: c.name}), {});
  
  const data = Object.values(grouped);
  const labels = Object.keys(grouped).map(id => catMap[id] || `Cat ${id}`);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#f1f5f9' } }
      }
    }
  });
}
export function destroy() {}
