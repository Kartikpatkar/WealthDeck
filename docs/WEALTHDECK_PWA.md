
# WealthDeck – PWA Specification

---

## Web App Manifest (`manifest.json`)

```json
{
  "name": "WealthDeck",
  "short_name": "WealthDeck",
  "description": "Your Financial Life. Privately Yours.",
  "start_url": "/index.html",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0a0e17",
  "background_color": "#0a0e17",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "assets/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["finance", "productivity"]
}
```

---

## Service Worker (`sw.js`)

### Cache Strategy
- **App Shell (Cache First):** HTML, CSS, JS, fonts, icons.
- **Dynamic Assets (Cache First):** Chart.js CDN, font files.
- **No Network Requests:** App has no API calls in MVP.

### Cache Name
```js
const CACHE_NAME = 'wealthdeck-v1';
```

### Lifecycle
1. **Install:** Pre-cache all app shell files.
2. **Activate:** Delete old versioned caches.
3. **Fetch:** Serve from cache. Fallback to network only for uncached resources.

### Update Flow
- Bump `CACHE_NAME` version.
- New SW installs, waits.
- On next visit, activates and clears old cache.
- User sees updated app.

---

## Install Prompt

- Listen for `beforeinstallprompt` event.
- Show custom install banner after 2+ visits.
- Dismissible. Remember dismissal in LocalStorage.

---

## Offline Indicators

- No offline banner needed (app is always offline-capable).
- Optional: subtle indicator when online (for future sync features).

---

## Icons Required

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192×192 | Standard icon |
| `icon-512.png` | 512×512 | Splash screen |
| `icon-maskable-512.png` | 512×512 | Adaptive icon (Android) |
| `favicon.ico` | 32×32 | Browser tab |
| `apple-touch-icon.png` | 180×180 | iOS home screen |

---

## Lighthouse Targets

| Category | Target |
|----------|--------|
| Performance | > 90 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 90 |
| PWA | ✅ Installable |
