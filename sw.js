const CACHE_NAME = 'wealthdeck-v15';
const PERSISTENT_CACHE_NAME = 'wealthdeck-persistent';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/components.css',
  './css/pages.css',
  './js/app.js',
  './js/router.js',
  './js/db/database.js',
  './js/utils/format.js',
  './js/utils/icons.js',
  './js/components/toast.js',
  './js/components/modal.js',
  './js/services/accountService.js',
  './js/services/transactionService.js',
  './js/services/categoryService.js',
  './js/services/budgetService.js',
  './js/services/goalService.js',
  './js/services/billService.js',
  './js/services/importService.js',
  './js/services/exportService.js',
  './js/services/googleDriveService.js',
  './js/pages/dashboard.js',
  './js/pages/transactions.js',
  './js/pages/budgets.js',
  './js/pages/goals.js',
  './js/pages/bills.js',
  './js/pages/accounts.js',
  './js/pages/categories.js',
  './js/pages/reports.js',
  './js/pages/importExport.js',
  './js/pages/settings.js',
  './js/pages/import.js',
  './js/pages/smartFeatures.js',
  './js/pages/onboarding.js',
  './js/pages/guide.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Keep current shell and persistent caches
        if (key !== CACHE_NAME && key !== PERSISTENT_CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // 1. Synthetic Ping for Offline Detection
  if (e.request.headers.get('X-Ping')) {
    e.respondWith(new Response('pong', { status: 200 }));
    return;
  }

  // Cache First Strategy for static assets, network fallback
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(e.request).then((networkResponse) => {
        // Dynamically cache requested files (like JS modules)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Don't cache API requests or external CDNs unless desired
        if (e.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        
        return networkResponse;
      }).catch(() => {
        // Graceful fallback synthetic 503
        console.warn('Network request failed and not in cache:', e.request.url);
        return new Response(JSON.stringify({ error: 'Offline' }), { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' }
        });
      });
    })
  );
});
