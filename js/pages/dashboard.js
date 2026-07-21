import { getAllTransactions } from '../services/transactionService.js';
import { getAllAccounts } from '../services/accountService.js';
import { getAllCategories } from '../services/categoryService.js';
import { formatCurrency, formatDate, escapeHTML, getCurrencySymbol, getLocale } from '../utils/format.js';

export async function render(container, params = {}) {
  container.innerHTML = `<div class="loading">Loading Dashboard...</div>`;
  
  try {
    const accounts = await getAllAccounts();
    const transactions = await getAllTransactions();
    const categories = await getAllCategories();
    
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) / 100;
    
    // Calculate income and expense for this month
    let income = 0;
    let expense = 0;
    const now = new Date();
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
    });
    
    // Category mapping for icons and names
    const catMap = categories.reduce((acc, c) => ({...acc, [c.id]: c}), {});

    // Recent Transactions
    const recentTxns = transactions.slice(0, 5).map(t => {
      const isIncome = t.type === 'income';
      const cName = catMap[t.categoryId]?.name || 'Uncategorized';
      const cIcon = catMap[t.categoryId]?.icon || '📦';
      const amtStr = formatCurrency(t.amount);
      const colorClass = isIncome ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense');
      const sign = isIncome ? '+' : (t.type === 'transfer' ? '' : '-');
      
      return `
        <div class="tx-row" onclick="location.hash='#/transaction/${t.id}'">
          <div class="tx-icon" style="background:${isIncome ? 'rgba(52,211,153,.15)' : 'rgba(148,163,184,.12)'}; color:${isIncome ? 'var(--color-income)' : 'var(--text-secondary)'};">${cIcon}</div>
          <div class="tx-info">
            <div class="m">${escapeHTML(t.merchant) || 'Transaction'}</div>
            <div class="c">${cName}</div>
          </div>
          <div class="tx-amt ${colorClass}">${sign}${amtStr}</div>
        </div>
      `;
    }).join('') || '<div class="hint">No recent transactions.</div>';

    const userName = localStorage.getItem('wealthdeck_name') || 'there';
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    container.innerHTML = `
      <div class="page-header-left" style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h1 class="page-title">Welcome back${userName ? `, ${userName}` : ''} 👋</h1>
          <p class="page-subtitle">Here's what's happening with your finances.</p>
        </div>
        <button class="icon-btn privacy-toggle-btn mobile-only" aria-label="Toggle privacy" style="background:var(--bg-surface-elevated); padding:8px; border-radius:12px; border:1px solid var(--border);">
          <svg class="privacy-icon-path" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px; height:20px;">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>

      <div class="balance-card">
        <div class="label">Total balance</div>
        <div class="amount"><span class="cur">${getCurrencySymbol()}</span><span id="balanceNum">0</span><span class="cents">.00</span></div>
        <div class="balance-row">
          <div class="pill text-income"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Active</div>
          <div class="pill">${accounts.length} accounts</div>
        </div>
      </div>

      <div class="dash-grid">
        <div>
          <div class="stats-grid">
            <div class="stat-card income">
              <div class="top"><span class="text-xs text-secondary font-semibold">Income</span><div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div></div>
              <div class="amt">${formatCurrency(income)}</div>
              <div class="lbl">Total</div>
            </div>
            <div class="stat-card expense">
              <div class="top"><span class="text-xs text-secondary font-semibold">Expense</span><div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div></div>
              <div class="amt">${formatCurrency(expense)}</div>
              <div class="lbl">Total</div>
            </div>
          </div>

          <div class="card mt-16">
            <div class="section-title">Recent activity<span class="link" onclick="location.hash='#/transactions'">See all</span></div>
            <div>${recentTxns}</div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Spending breakdown</div>
          <div class="donut-wrap">
            <div class="donut" id="donutChart">
              <div class="donut-center"><div class="v">${formatCurrency(expense)}</div><div class="t">spent</div></div>
            </div>
            <div class="legend" id="donutLegend"></div>
          </div>
        </div>
      </div>
    `;
    
    // Animate balance
    animateBalance(totalBalance);
    
    // Draw CSS Donut
    drawDonut(transactions, catMap);
    
    // Apply privacy state to dashboard mask icon
    if (window.app && window.app.applyPrivacyState) {
      window.app.applyPrivacyState();
    }

  } catch (err) {
    container.innerHTML = `<p class="text-danger">Error loading dashboard: ${err.message}</p>`;
  }
}

function animateBalance(targetBalance) {
  const el = document.getElementById('balanceNum');
  const centsEl = document.querySelector('.balance-card .cents');
  if(!el) return;
  
  // Format cents
  const parts = targetBalance.toFixed(2).split('.');
  centsEl.textContent = '.' + parts[1];
  const targetWhole = parseInt(parts[0], 10);
  
  let start = null;
  const dur = 1100;
  function step(ts) {
    if(!start) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const locale = getLocale();
    el.textContent = Math.floor(eased * targetWhole).toLocaleString(locale);
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = targetWhole.toLocaleString(locale);
  }
  requestAnimationFrame(step);
}

function drawDonut(transactions, catMap) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const grouped = {};
  expenses.forEach(e => {
    grouped[e.categoryId] = (grouped[e.categoryId] || 0) + e.amount;
  });
  
  const colors = ['#6366f1', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#22d3ee'];
  
  const slices = Object.keys(grouped).map((id, idx) => ({
    name: catMap[id]?.name || 'Other',
    val: grouped[id] / 100,
    color: colors[idx % colors.length]
  })).sort((a,b) => b.val - a.val).slice(0, 5); // top 5
  
  const total = slices.reduce((s, x) => s + x.val, 0);
  if (total === 0) {
    document.getElementById('donutChart').style.background = 'var(--bg-surface-elevated)';
    document.getElementById('donutLegend').innerHTML = '<div class="hint">No expense data</div>';
    return;
  }
  
  let acc = 0;
  const gradParts = [];
  slices.forEach(s => {
    const start = (acc / total) * 360;
    const end = ((acc + s.val) / total) * 360;
    gradParts.push(s.color + ' ' + start + 'deg ' + end + 'deg');
    acc += s.val;
  });
  
  document.getElementById('donutChart').style.background = 'conic-gradient(' + gradParts.join(',') + ')';
  
  document.getElementById('donutLegend').innerHTML = slices.map(s => `
    <div class="legend-row">
      <div class="dot" style="background:${s.color}"></div>
      <div class="name">${s.name}</div>
      <div class="val">${formatCurrency(s.val * 100)}</div>
    </div>
  `).join('');
}

export function destroy() {
  // No external instances to destroy
}
