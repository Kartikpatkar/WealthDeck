import { initDB } from './db/database.js';
import { initRouter } from './router.js';

async function bootstrap() {
  try {
    // 0. Apply Theme & Accent
    const theme = localStorage.getItem('wealthdeck_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    const accent = localStorage.getItem('wealthdeck_accent');
    if (accent) {
      document.documentElement.style.setProperty('--color-primary', accent);
    }
    
    window.app = window.app || {};
    window.app.toggleTheme = function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('wealthdeck_theme', next);
    };

    // 1. Setup offline/online listeners
    setupOfflineListeners();

    // 2. Initialize IndexedDB
    await initDB();
    console.log('Database initialized');

    const { seedDefaultCategories } = await import('./services/categoryService.js');
    await seedDefaultCategories();
    
    const { seedDefaultAccount } = await import('./services/accountService.js');
    await seedDefaultAccount();

    // 2. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('SW registered!', reg);
          
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                import('./components/toast.js').then(m => {
                  m.showToast('New update available! <a href="#" onclick="window.location.reload(); return false;" style="color:#fff;text-decoration:underline;margin-left:8px;font-weight:bold;">Refresh</a>', 'info', 10000);
                });
              }
            });
          });
        })
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

function setupOfflineListeners() {
  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = 'display:none; background:var(--color-expense); color:#fff; text-align:center; padding:8px; font-size:14px; z-index:99999;';
  banner.textContent = 'You are offline. Some features may be unavailable.';
  
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.prepend(banner);

  const updateBanner = () => {
    if (navigator.onLine) {
      banner.style.display = 'none';
    } else {
      banner.style.display = 'block';
    }
  };

  window.addEventListener('online', updateBanner);
  window.addEventListener('offline', updateBanner);
  
  // Initial check
  updateBanner();
}
