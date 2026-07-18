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
import * as Settings from './pages/settings.js';

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
  { path: /^\/settings$/, module: Settings },
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
      
      <h3 style="margin-top: var(--spacing-sm);">Preferences</h3>
      <a href="#/settings" class="card" style="text-decoration:none; color:inherit;">⚙️ Settings</a>
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
  let checkPath = currentPath;
  if (checkPath === '/') checkPath = '/dashboard';
  
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('href') === '#' + checkPath) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = `
    <a href="#/dashboard" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
      Home
    </a>
    <a href="#/transactions" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      Activity
    </a>
    <a href="#/transaction/new" class="fab" aria-label="Add transaction" style="text-decoration:none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
    </a>
    <a href="#/budgets" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>
      Budgets
    </a>
    <a href="#/more" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
      More
    </a>
  `;
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = `
    <div class="brand"><div class="mark"></div><span>WealthDeck</span></div>
    
    <a href="#/dashboard" class="nav-item">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
      <span>Dashboard</span>
    </a>
    <a href="#/transactions" class="nav-item">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      <span>Transactions</span>
    </a>
    <a href="#/budgets" class="nav-item">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>
      <span>Budgets</span>
    </a>
    <a href="#/accounts" class="nav-item">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
      <span>Accounts</span>
    </a>
    <a href="#/reports" class="nav-item">
      <span style="font-size:16px; width:18px; text-align:center;">📈</span>
      <span>Reports</span>
    </a>
    <a href="#/timeline" class="nav-item">
      <span style="font-size:16px; width:18px; text-align:center;">⏳</span>
      <span>Timeline</span>
    </a>
    
    <div class="spacer"></div>
    <a href="#/settings" class="nav-item">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      <span>Settings</span>
    </a>
  `;
}

export function initRouter() {
  renderBottomNav();
  renderSidebar();
  
  window.addEventListener('hashchange', handleRoute);
  
  // Initial route
  handleRoute();
}
