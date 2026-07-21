import { getAllTransactions } from '../services/transactionService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency, parseLocalDate } from '../utils/format.js';

let chartInstance = null;

export async function render(container, params = {}) {
  
  // Basic framework for rendering with filter state
  let currentFilter = 'this-month';
  let customStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  let customEndDate = new Date().toISOString().split('T')[0];
  
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
      } else if (currentFilter === 'custom') {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999); // Include full end day
      }
      
      const allFiltered = transactions.filter(t => {
        const d = parseLocalDate(t.date);
        return (currentFilter === 'all-time' || (d >= startDate && d <= endDate));
      });
      
      const expenses = allFiltered.filter(t => t.type === 'expense');
      
      const catMap = categories.reduce((map, c) => ({...map, [c.id]: c}), {});
      
      const summary = {};
      expenses.forEach(t => {
        const catName = catMap[t.categoryId]?.name || 'Uncategorized';
        summary[catName] = (summary[catName] || 0) + t.amount;
      });
      
      const labels = Object.keys(summary);
      const data = Object.values(summary).map(v => v / 100);

      container.innerHTML = `
        <div class="page-head mod-style-b785d2">
          <div class="mod-style-948e6d">
            <h2 class="mod-style-e2b74b">Reports</h2>
            <select class="input mod-style-5d9ae9" id="report-filter">
              <option value="this-month" ${currentFilter === 'this-month' ? 'selected' : ''}>This Month</option>
              <option value="last-month" ${currentFilter === 'last-month' ? 'selected' : ''}>Last Month</option>
              <option value="all-time" ${currentFilter === 'all-time' ? 'selected' : ''}>All Time</option>
              <option value="custom" ${currentFilter === 'custom' ? 'selected' : ''}>Custom Date...</option>
            </select>
            <button class="btn" id="export-csv-btn">Export CSV</button>
          </div>
          ${currentFilter === 'custom' ? `
            <div class="mod-style-92c164">
              <div class="field mod-style-55f1d3"><label class="mod-style-9bd93d">From</label><input class="input mod-style-f91e21" type="date"  id="custom-start" value="${customStartDate}"></div>
              <div class="field mod-style-55f1d3"><label class="mod-style-9bd93d">To</label><input class="input mod-style-f91e21" type="date"  id="custom-end" value="${customEndDate}"></div>
            </div>
          ` : ''}
        </div>

        
        <p class="mod-style-b01af8">Expense Breakdown</p>
        
        <div class="card mod-style-2dcfa4">
          ${expenses.length === 0 ? '<p class="mod-style-2fa0c0">No expense data available for this period.</p>' : '<div class="mod-style-c76d4a"><canvas class="mod-style-a898fd" id="reports-chart"></canvas></div>'}
        </div>
        
        <div class="card mod-style-f636ca">
          <h3>Summary Table</h3>
          ${labels.length === 0 ? '<p>No data</p>' : labels.map((l, i) => `
            <div class="mod-style-a03ccd">
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

      if (currentFilter === 'custom') {
        document.getElementById('custom-start').addEventListener('change', (e) => {
          customStartDate = e.target.value;
          draw();
        });
        document.getElementById('custom-end').addEventListener('change', (e) => {
          customEndDate = e.target.value;
          draw();
        });
      }
      
      const btnExport = document.getElementById('export-csv-btn');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          let csv = 'Date,Type,Category,Merchant,Amount,Notes\n';
          allFiltered.forEach(t => {
            const date = new Date(t.date).toLocaleDateString();
            const type = t.type;
            const category = catMap[t.categoryId]?.name || 'Uncategorized';
            const merchant = (t.merchant || '').replace(/"/g, '""');
            const amount = (t.amount / 100).toFixed(2);
            const notes = (t.notes || '').replace(/"/g, '""');
            csv += `"${date}","${type}","${category}","${merchant}","${amount}","${notes}"\n`;
          });
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `WealthDeck_Report_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }

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
      container.innerHTML = `<p class="mod-style-f479d1">Error: ${err.message}</p>`;
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
