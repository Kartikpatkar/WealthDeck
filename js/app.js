import { initDB } from './db/database.js';
import { initRouter } from './router.js';
import { getSetting, saveSetting } from './services/settingsService.js';

async function verifyNetwork() {
  try {
    const res = await fetch('/', { 
      headers: { 'X-Ping': '1' },
      cache: 'no-store'
    });
    if (res.status !== 200) throw new Error('Offline');
  } catch (e) {
    // Force native API to return false globally
    Object.defineProperty(navigator, 'onLine', { get: () => false });
  }
}

async function bootstrap() {
  try {
    await verifyNetwork();
    await initDB();
    
    // Migration: Move localstorage to IndexedDB
    const lsBio = localStorage.getItem('wealthdeck_biometric');
    if (lsBio) {
      await saveSetting('wealthdeck_biometric', lsBio);
      localStorage.removeItem('wealthdeck_biometric');
    }
    
    const bioEnabled = await getSetting('wealthdeck_biometric');
    if (bioEnabled === 'true') {
      let authSuccess = false;
      if (window.isSecureContext && navigator.credentials) {
        try {
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge: challenge,
              userVerification: "required"
            }
          });
          authSuccess = true;
        } catch(err) {
          authSuccess = false;
        }
      } else {
        const pin = prompt('App Locked (Simulated Biometric).\nPress OK to unlock or Cancel to stay locked.');
        if (pin !== null) authSuccess = true;
      }
      
      if (!authSuccess) {
        document.getElementById('main-content').innerHTML = `
          <div class="mod-style-d7bd88">
            <svg class="mod-style-a37da4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <h2>App Locked</h2>
            <p class="mod-style-75410b">Biometric authentication is required to access WealthDeck.</p>
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
    
    const accent = localStorage.getItem('wealthdeck_accent') || '#6366f1';
    document.documentElement.style.setProperty('--color-primary', accent);
    
    window.app = window.app || {};
    window.app.toggleTheme = function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('wealthdeck_theme', next);
    };

    // Initialize Privacy Mode (Default Masked)
    let isMasked = localStorage.getItem('wealthdeck_privacy') !== 'false';
    
    window.app.applyPrivacyState = function() {
      if (isMasked) {
        document.body.classList.add('privacy-masked');
        document.querySelectorAll('.privacy-icon-path').forEach(el => {
          el.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
        });
      } else {
        document.body.classList.remove('privacy-masked');
        document.querySelectorAll('.privacy-icon-path').forEach(el => {
          el.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
        });
      }
      localStorage.setItem('wealthdeck_privacy', isMasked);
    };
    
    window.app.togglePrivacy = function() {
      isMasked = !isMasked;
      window.app.applyPrivacyState();
    };
    
    window.app.applyPrivacyState();
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.privacy-toggle-btn')) {
        window.app.togglePrivacy();
      }
    });

    // 1. Setup offline/online listeners
    setupOfflineListeners();

    // 2. Database already initialized at start
    console.log('Database initialized');

    const { seedDefaultCategories } = await import('./services/categoryService.js');
    await seedDefaultCategories();
    
    const { seedDefaultAccount } = await import('./services/accountService.js');
    await seedDefaultAccount();
    
    const { processAutoPayBills } = await import('./services/billService.js');
    await processAutoPayBills();

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
                  m.showToast('New update available! <a class="mod-style-9843f8" href="#" onclick="window.location.reload(); return false;">Refresh</a>', 'info', 10000);
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
      <div class="mod-style-e95ea0">
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

// PWA Install Prompt Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const lastPrompt = localStorage.getItem('wealthdeck_install_prompt_time');
  const now = Date.now();
  
  // Prompt every 7 days if they haven't installed
  if (!lastPrompt || (now - parseInt(lastPrompt)) > 7 * 24 * 60 * 60 * 1000) {
    import('./components/toast.js').then(m => {
      m.showToast(
        '<div class="toast-install-content" style="gap: 16px; text-align: left;"><span style="flex: 1; line-height: 1.4;">Install WealthDeck for offline access!</span> <button class="btn" id="install-pwa-btn" style="width: auto; padding: 8px 16px; font-size: 13px; border-radius: 10px; flex-shrink: 0; min-height: 0;">Install</button></div>',
        'info',
        15000 // Show for 15 seconds
      );
      
      setTimeout(() => {
        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn) {
          installBtn.addEventListener('click', async (btnEvent) => {
            btnEvent.preventDefault();
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log('Install prompt outcome:', outcome);
              deferredPrompt = null;
              
              // Hide the toast early
              installBtn.closest('.toast').style.opacity = '0';
              setTimeout(() => installBtn.closest('.toast').remove(), 300);
            }
          });
        }
      }, 100);
      
      localStorage.setItem('wealthdeck_install_prompt_time', now.toString());
    });
  }
});
