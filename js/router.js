import { renderDashboard } from './pages/dashboard.js';
import { renderAccounts } from './pages/accounts.js';
import { renderCategories } from './pages/categories.js';
import { renderTransactions } from './pages/transactions.js';

const routes = {
  '/': renderDashboard,
  '/dashboard': renderDashboard,
  '/transactions': renderTransactions,
  '/accounts': renderAccounts,
  '/categories': renderCategories,
  '/budgets': () => renderPlaceholder('Budgets'),
  '/more': () => renderPlaceholder('More Menu')
};

// Simple placeholder renderer for Phase 1 routing
function renderPlaceholder(title) {
  const main = document.getElementById('main-content');
  main.innerHTML = `<h1>${title}</h1><p>Content for ${title} goes here.</p>`;
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
    <a href="#/transaction/new" class="nav-item btn btn--primary">➕</a>
    <a href="#/budgets" class="nav-item">📦 Budget</a>
    <a href="#/more" class="nav-item">☰ More</a>
  `;
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = `
    <a href="#/dashboard" class="nav-item active">Dashboard</a>
    <a href="#/transactions" class="nav-item">Transactions</a>
    <a href="#/accounts" class="nav-item">Accounts</a>
    <a href="#/categories" class="nav-item">Categories</a>
    <a href="#/budgets" class="nav-item">Budgets</a>
  `;
}

export function initRouter() {
  renderBottomNav();
  renderSidebar();
  
  window.addEventListener('hashchange', handleRoute);
  
  // Initial route
  handleRoute();
}
