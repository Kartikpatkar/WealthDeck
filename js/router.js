import * as Dashboard from './pages/dashboard.js';
import * as Accounts from './pages/accounts.js';
import * as Categories from './pages/categories.js';
import * as Transactions from './pages/transactions.js';
import * as Budgets from './pages/budgets.js';
import * as Bills from './pages/bills.js';
import * as Goals from './pages/goals.js';
import * as Reports from './pages/reports.js';
import * as ImportExport from './pages/importExport.js';
import * as Import from './pages/import.js';
import * as SmartFeatures from './pages/smartFeatures.js';

const routes = [
  { path: /^\/$/, module: Dashboard },
  { path: /^\/dashboard$/, module: Dashboard },
  { path: /^\/transactions$/, module: Transactions },
  { path: /^\/transaction\/new$/, module: Transactions, params: { openModal: true } },
  { path: /^\/transaction\/(\d+)$/, module: Transactions, keys: ['id'] },
  { path: /^\/accounts$/, module: Accounts },
  { path: /^\/account\/(\d+)$/, module: Accounts, keys: ['id'] },
  { path: /^\/categories$/, module: Categories },
  { path: /^\/budgets$/, module: Budgets },
  { path: /^\/budget\/(\d+)$/, module: Budgets, keys: ['id'] },
  { path: /^\/bills$/, module: Bills },
  { path: /^\/goals$/, module: Goals },
  { path: /^\/reports$/, module: Reports },
  { path: /^\/import-export$/, module: ImportExport },
  { path: /^\/import$/, module: Import },
  { path: /^\/timeline$/, module: { render: SmartFeatures.renderTimeline, destroy: () => {} } },
  { path: /^\/replay$/, module: { render: SmartFeatures.renderMonthlyReplay, destroy: () => {} } },
  { path: /^\/analyzers$/, module: { render: SmartFeatures.renderAnalyzers, destroy: () => {} } },
  { path: /^\/more$/, module: { render: renderMoreMenu, destroy: () => {} } }
];

let currentPageModule = null;

export function renderMoreMenu(container) {
  container.innerHTML = `
    <h1>More</h1>
    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
      <a href="#/accounts" class="card" style="text-decoration:none; color:inherit;">🏦 Accounts</a>
      <a href="#/categories" class="card" style="text-decoration:none; color:inherit;">🏷️ Categories</a>
      <a href="#/bills" class="card" style="text-decoration:none; color:inherit;">📅 Recurring Bills</a>
      <a href="#/goals" class="card" style="text-decoration:none; color:inherit;">🎯 Savings Goals</a>
      <a href="#/reports" class="card" style="text-decoration:none; color:inherit;">📈 Reports</a>
      
      <h3 style="margin-top: var(--spacing-sm);">Smart Features</h3>
      <a href="#/timeline" class="card" style="text-decoration:none; color:inherit;">⏳ Financial Timeline</a>
      <a href="#/replay" class="card" style="text-decoration:none; color:inherit;">⏪ Monthly Replay</a>
      <a href="#/analyzers" class="card" style="text-decoration:none; color:inherit;">💡 Analyzers & Challenges</a>
      
      <h3 style="margin-top: var(--spacing-sm);">Data</h3>
      <a href="#/import" class="card" style="text-decoration:none; color:inherit;">🤖 Smart CSV Import</a>
      <a href="#/import-export" class="card" style="text-decoration:none; color:inherit;">🔄 Backup & Restore</a>
    </div>
  `;
}

async function handleRoute() {
  let path = window.location.hash.slice(1) || '/';
  const container = document.getElementById('main-content');
  
  if (currentPageModule && typeof currentPageModule.destroy === 'function') {
    currentPageModule.destroy();
  }
  
  let matchedRoute = routes.find(r => r.path.test(path)) || routes[0];
  let params = { ...matchedRoute.params };
  
  const match = path.match(matchedRoute.path);
  if (match && matchedRoute.keys) {
    matchedRoute.keys.forEach((key, index) => {
      params[key] = match[index + 1];
    });
  }

  currentPageModule = matchedRoute.module;
  await currentPageModule.render(container, params);
  
  updateNav(path);
}

function updateNav(currentPath) {
  // This will update active states on bottom nav and sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('href') === '#' + currentPath) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = `
    <a href="#/dashboard" class="nav-item active">📊 Dash</a>
    <a href="#/transactions" class="nav-item">📋 Txns</a>
    <a href="#/transaction/new" class="nav-item btn btn--primary" style="border-radius: 50%; width: 40px; height: 40px; margin-top: -20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; text-decoration: none;">➕</a>
    <a href="#/budgets" class="nav-item">📦 Budget</a>
    <a href="#/more" class="nav-item">☰ More</a>
  `;
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = `
    <a href="#/dashboard" class="nav-item active">📊 Dashboard</a>
    <a href="#/transactions" class="nav-item">📋 Transactions</a>
    <a href="#/accounts" class="nav-item">🏦 Accounts</a>
    <a href="#/categories" class="nav-item">🏷️ Categories</a>
    <a href="#/budgets" class="nav-item">📦 Budgets</a>
    <a href="#/bills" class="nav-item">📅 Bills</a>
    <a href="#/goals" class="nav-item">🎯 Goals</a>
    <a href="#/reports" class="nav-item">📈 Reports</a>
    <a href="#/timeline" class="nav-item">⏳ Timeline</a>
    <a href="#/replay" class="nav-item">⏪ Replay</a>
    <a href="#/analyzers" class="nav-item">💡 Analyzers</a>
    <a href="#/import" class="nav-item">🤖 Smart Import</a>
    <a href="#/import-export" class="nav-item">🔄 Backup</a>
  `;
}

export function initRouter() {
  renderBottomNav();
  renderSidebar();
  
  window.addEventListener('hashchange', handleRoute);
  
  // Initial route
  handleRoute();
}
