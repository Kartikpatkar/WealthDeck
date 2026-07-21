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
import * as Onboarding from './pages/onboarding.js';
import * as Guide from './pages/guide.js';

const routes = [
  { path: /^\/$/, module: Dashboard },
  { path: /^\/onboarding$/, module: Onboarding },
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
  { path: /^\/guide$/, module: Guide },
  { path: /^\/more$/, module: { render: renderMoreMenu, destroy: () => {} } }
];

let currentPageModule = null;

export function renderMoreMenu(container) {
  container.innerHTML = `
    <h1>More</h1>
    <div class="mod-style-f58185">
      <a class="card mod-style-10fd1c" href="#/budgets">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg> Budgets
      </a>
      <a class="card mod-style-10fd1c" href="#/categories">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> Categories
      </a>
      <a class="card mod-style-10fd1c" href="#/bills">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Recurring Bills
      </a>
      <a class="card mod-style-10fd1c" href="#/goals">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Savings Goals
      </a>
      <a class="card mod-style-10fd1c" href="#/reports">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Reports
      </a>
      
      <h3 class="mod-style-009c24">Smart Features</h3>
      <a class="card mod-style-10fd1c" href="#/timeline">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Financial Timeline
      </a>
      <a class="card mod-style-10fd1c" href="#/replay">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg> Monthly Replay
      </a>
      <a class="card mod-style-10fd1c" href="#/analyzers">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Analyzers & Challenges
      </a>
      
      <h3 class="mod-style-009c24">Data</h3>
      <a class="card mod-style-10fd1c" href="#/import">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg> Smart CSV Import
      </a>
      <a class="card mod-style-10fd1c" href="#/import-export">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Backup & Restore
      </a>
      
      <h3 class="mod-style-009c24">Preferences</h3>
      <a class="card mod-style-10fd1c" href="#/settings">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg> Settings
      </a>
      <a class="card mod-style-10fd1c" href="#/guide">
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Guide & About
      </a>
    </div>
  `;
}

async function handleRoute() {
  let path = window.location.hash.slice(1) || '/';
  
  // Onboarding Guard
  const hasName = localStorage.getItem('wealthdeck_name');
  if (!hasName && path !== '/onboarding') {
    window.location.hash = '#/onboarding';
    return;
  }
  
  const container = document.getElementById('main-content');
  
  if (currentPageModule && typeof currentPageModule.destroy === 'function') {
    currentPageModule.destroy();
  }
  
  // Track previous route if it's not a modal opening route
  if (!path.startsWith('/transaction/new')) {
    localStorage.setItem('wealthdeck_prev_route', path);
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

  const fab = document.querySelector('.fab');
  if (fab) {
    if (checkPath.startsWith('/accounts')) {
      fab.removeAttribute('href');
      fab.onclick = (e) => { e.preventDefault(); document.getElementById('add-account-btn')?.click(); };
    } else if (checkPath.startsWith('/categories')) {
      fab.removeAttribute('href');
      fab.onclick = (e) => { e.preventDefault(); document.getElementById('add-cat-btn')?.click(); };
    } else if (checkPath.startsWith('/budgets')) {
      fab.removeAttribute('href');
      fab.onclick = (e) => { e.preventDefault(); document.getElementById('add-budget-btn')?.click(); };
    } else if (checkPath.startsWith('/goals')) {
      fab.removeAttribute('href');
      fab.onclick = (e) => { e.preventDefault(); document.getElementById('add-goal-btn')?.click(); };
    } else if (checkPath.startsWith('/bills')) {
      fab.removeAttribute('href');
      fab.onclick = (e) => { e.preventDefault(); document.getElementById('add-bill-btn')?.click(); };
    } else {
      fab.setAttribute('href', '#/transaction/new');
      fab.onclick = null;
    }
  }
}

function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = `
    <a class="nav-item" href="#/dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
      Home
    </a>
    <a class="nav-item" href="#/accounts">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      Accounts
    </a>
    <a class="fab mod-style-8fdce8" href="#/transaction/new"  aria-label="Add transaction">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
    </a>
    <a class="nav-item" href="#/transactions">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      Activity
    </a>
    <a class="nav-item" href="#/more">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
      More
    </a>
  `;
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = `
    <div class="brand"><div class="mark"></div><span>WealthDeck</span></div>
    
    <div class="mod-style-094dd7">Main</div>
    <a class="nav-item" href="#/dashboard">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
      <span>Dashboard</span>
    </a>
    <a class="nav-item" href="#/accounts">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      <span>Accounts</span>
    </a>
    <a class="nav-item" href="#/transactions">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      <span>Activity</span>
    </a>
    
    <div class="mod-style-094dd7">More</div>
    <a class="nav-item" href="#/transactions">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
      <span>Activity</span>
    </a>
    <a class="nav-item" href="#/categories">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      <span>Categories</span>
    </a>
    <a class="nav-item" href="#/bills">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>Recurring Bills</span>
    </a>
    <a class="nav-item" href="#/goals">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      <span>Savings Goals</span>
    </a>
    <a class="nav-item" href="#/reports">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <span>Reports</span>
    </a>
    
    <div class="mod-style-094dd7">Smart Features</div>
    <a class="nav-item" href="#/timeline">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Timeline</span>
    </a>
    <a class="nav-item" href="#/replay">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
      <span>Monthly Replay</span>
    </a>
    <a class="nav-item" href="#/analyzers">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span>Analyzers & Challenges</span>
    </a>

    <div class="mod-style-094dd7">Data</div>
    <a class="nav-item" href="#/import">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
      <span>Smart CSV Import</span>
    </a>
    <a class="nav-item" href="#/import-export">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      <span>Backup & Restore</span>
    </a>
    
    <div class="spacer"></div>
    <a class="nav-item" href="#/guide">
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>Guide & About</span>
    </a>
    <a class="nav-item" href="#/settings">
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
