import { renderDashboard } from './pages/dashboard.js';
import { renderAccounts } from './pages/accounts.js';
import { renderCategories } from './pages/categories.js';
import { renderTransactions } from './pages/transactions.js';
import { renderBudgets } from './pages/budgets.js';
import { renderBills } from './pages/bills.js';
import { renderGoals } from './pages/goals.js';
import { renderReports } from './pages/reports.js';
import { renderImportExport } from './pages/importExport.js';
import { renderImport } from './pages/import.js';
import { renderTimeline, renderMonthlyReplay, renderAnalyzers } from './pages/smartFeatures.js';

const routes = {
  '/': renderDashboard,
  '/dashboard': renderDashboard,
  '/transactions': renderTransactions,
  '/accounts': renderAccounts,
  '/categories': renderCategories,
  '/budgets': renderBudgets,
  '/bills': renderBills,
  '/goals': renderGoals,
  '/reports': renderReports,
  '/import-export': renderImportExport,
  '/import': renderImport,
  '/timeline': renderTimeline,
  '/replay': renderMonthlyReplay,
  '/analyzers': renderAnalyzers,
  '/more': renderMoreMenu
};

function renderMoreMenu() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
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

function handleRoute() {
  let path = window.location.hash.slice(1) || '/';
  
  // Basic route matching (without params for now)
  const routeFn = routes[path] || routes['/'];
  routeFn();
  
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
    <a href="#/transactions" onclick="setTimeout(()=>document.getElementById('add-txn-btn')?.click(), 100)" class="nav-item btn btn--primary" style="border-radius: 50%; width: 40px; height: 40px; margin-top: -20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">➕</a>
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
