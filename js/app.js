import { initDB } from './db/database.js';
import { initRouter } from './router.js';

async function bootstrap() {
  try {
    // Check Biometric Lock First
    if (localStorage.getItem('wealthdeck_biometric') === 'true') {
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            userVerification: "required"
          }
        });
      } catch (err) {
        document.getElementById('main-content').innerHTML = `
          <div style="padding: 40px 20px; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 64px; height: 64px; margin-bottom: 16px; color: var(--color-expense);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <h2>App Locked</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">Biometric authentication is required to access WealthDeck.</p>
            <button class="btn" onclick="window.location.reload()">Try Again</button>
          </div>
        `;
        return; // Stop bootstrap
      }
    }

    // 0. Apply Theme & Accent
    const theme = localStorage.getItem('wealthdeck_theme') || 'system';
    if (theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    
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

    // Initialize Privacy Mode (Default Masked)
    const privacyBtn = document.getElementById('privacy-toggle-btn');
    const privacyIcon = document.getElementById('privacy-icon');
    let isMasked = localStorage.getItem('wealthdeck_privacy') !== 'false';
    
    function applyPrivacyState() {
      if (isMasked) {
        document.body.classList.add('privacy-masked');
        privacyIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
      } else {
        document.body.classList.remove('privacy-masked');
        privacyIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
      localStorage.setItem('wealthdeck_privacy', isMasked);
    }
    
    applyPrivacyState();
    
    if (privacyBtn) {
      privacyBtn.addEventListener('click', () => {
        isMasked = !isMasked;
        applyPrivacyState();
      });
    }

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
