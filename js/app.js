import { initDB } from './db/database.js';
import { initRouter } from './router.js';

async function bootstrap() {
  try {
    // 0. Apply Theme
    const theme = localStorage.getItem('wealthdeck_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    window.app = window.app || {};
    window.app.toggleTheme = function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('wealthdeck_theme', next);
    };

    // 1. Initialize IndexedDB
    await initDB();
    console.log('Database initialized');

    const { seedDefaultCategories } = await import('./services/categoryService.js');
    await seedDefaultCategories();
    
    const { seedDefaultAccount } = await import('./services/accountService.js');
    await seedDefaultAccount();

    // 2. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered!', reg))
        .catch(err => console.error('SW registration failed', err));
    }

    // 3. Initialize Router
    initRouter();
  } catch (err) {
    console.error('Failed to bootstrap app:', err);
    document.getElementById('main-content').innerHTML = `
      <div style="padding: 20px; color: red;">
        <h2>Initialization Error</h2>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
