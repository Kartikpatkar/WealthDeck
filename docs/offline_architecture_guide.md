# ShowDeck: PWA Offline Architecture & Implementation Guide

This document details the offline-first strategies, workarounds, and best practices implemented in ShowDeck. It serves as a reference for implementing robust offline Progressive Web Apps (PWAs).

---

## 1. Chromium `navigator.onLine` Bug Workaround

**The Problem:**
In Chromium-based browsers (Chrome, Edge), if a user reloads a PWA while completely disconnected from the internet, the browser may falsely report `navigator.onLine === true`. This causes standard network detection to fail, leading to unhandled network errors as the app attempts to fetch from remote APIs.

**The Solution:**
We implemented a synthetic "Ping" mechanism between the client app and the local Service Worker.

1. **Service Worker Interception:**
   The service worker listens for a specific `X-Ping` header in incoming requests. Since the service worker runs locally, it can respond to this request even when offline.
   ```javascript
   self.addEventListener('fetch', (event) => {
     if (event.request.headers.get('X-Ping')) {
       event.respondWith(new Response('pong', { status: 200 }));
       return;
     }
     // ... handle other requests
   });
   ```

2. **Client-Side Boot Check:**
   When the app boots (in `api/tmdb.js`), we fire an empty request to the root URL with the `X-Ping` header. If it times out or fails, we know we are truly offline and aggressively override the browser's native API.
   ```javascript
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
   ```

---

## 2. Decoupled Service Worker Caching

A common PWA mistake is putting user-generated content or remote images into the same cache bucket as the application shell (HTML/CSS/JS). When the app updates and the shell cache version is bumped, everything is cleared, forcing the user to re-download gigabytes of images.

**The Solution:**
Use two distinct caches in `sw.js`.

1. **App Shell Cache (`showdeck-v32`)**:
   Caches strict local assets (`index.html`, `app.js`, `style.css`). This cache is completely wiped and re-populated every time you bump the version number to ensure the user gets the latest code.
   
2. **Image Cache (`showdeck-images`)**:
   Explicitly caches remote TMDB/TVMaze posters and backdrops. This cache is **never** cleared during a service worker activation/update.

```javascript
const CACHE_NAME = 'showdeck-v32'; // Changes on every deploy
const IMAGE_CACHE_NAME = 'showdeck-images'; // Never changes

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        // Delete old app shell caches, but preserve the image cache
        if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
});
```

---

## 3. Graceful API Fallbacks (Synthetic 503s)

**The Problem:**
When third-party libraries or extensions try to make API calls (like fetching data from TMDB) while offline, the browser throws a hard `TypeError: Failed to fetch`. This can crash promise chains or cause intrusive errors in the console.

**The Solution:**
Intercept remote API calls in the Service Worker and return a synthetic `503 Service Unavailable` JSON response when offline.

```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If fetching from a known remote API
  if (url.hostname === 'api.themoviedb.org') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a mock JSON response so the client code doesn't hard crash
        return new Response(JSON.stringify({ 
          error: 'Offline', 
          results: [] 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});
```
On the client side, the API wrapper (`tmdb.js`) detects the `503` status code, gracefully handles it, and returns an empty array or `null`, allowing the IndexedDB database to act as the primary source of truth without throwing JS errors.

---

## 4. IndexedDB as the Source of Truth

The app is built "Offline First" using `Dexie.js` (a wrapper for IndexedDB).

1. **Storage First:** All user data (watch counts, ratings, added shows, collections, tags) is instantly saved to `IndexedDB` before any cloud sync is attempted.
2. **Offline Routing:** When navigating to a Detail Page (`#/show/123`), the app checks IndexedDB first. If the data is there, it renders immediately. It only uses the TMDB API to "enrich" the page (e.g. fetching the cast or watch providers). If offline, it simply skips the enrichment phase and shows the cached local data.

## 5. Global Offline UX

We use standard `window.addEventListener('offline')` and `online` events to render a global banner indicating network status. Furthermore, network-dependent features (like the "Search" page) are blocked via the router when `!navigator.onLine`, automatically redirecting users to their local Library to prevent broken experiences.
