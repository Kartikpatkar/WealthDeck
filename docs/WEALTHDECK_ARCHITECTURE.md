
# WealthDeck – Technical Architecture

> **Type:** Offline-first Progressive Web App  
> **Stack:** Vanilla JS (ES Modules), IndexedDB, Service Worker  
> **Backend:** None (local-only MVP)

---

## Project Structure

```
WealthDeck/
├── index.html                  # App shell
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
├── css/
│   ├── variables.css           # Design tokens (colors, spacing, fonts)
│   ├── reset.css               # CSS reset / normalize
│   ├── base.css                # Global styles, typography
│   ├── components.css          # Shared component styles
│   ├── pages.css               # Page-specific styles
│   └── animations.css          # Keyframes, transitions
├── js/
│   ├── app.js                  # Entry point, router init
│   ├── router.js               # Client-side hash router
│   ├── db/
│   │   ├── database.js         # IndexedDB init, migrations
│   │   ├── stores.js           # Store names & schema constants
│   │   └── queries.js          # Reusable query helpers
│   ├── services/
│   │   ├── accountService.js
│   │   ├── transactionService.js
│   │   ├── categoryService.js
│   │   ├── budgetService.js
│   │   ├── billService.js
│   │   ├── goalService.js
│   │   ├── importService.js
│   │   ├── exportService.js
│   │   └── settingsService.js
│   ├── components/
│   │   ├── navbar.js
│   │   ├── modal.js
│   │   ├── toast.js
│   │   ├── chart.js
│   │   ├── formBuilder.js
│   │   └── datePicker.js
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   ├── accounts.js
│   │   ├── categories.js
│   │   ├── budgets.js
│   │   ├── bills.js
│   │   ├── goals.js
│   │   ├── reports.js
│   │   ├── import.js
│   │   ├── settings.js
│   │   └── search.js
│   └── utils/
│       ├── format.js           # Currency, date formatting
│       ├── validate.js         # Input validation
│       ├── icons.js            # Icon map
│       └── constants.js        # App-wide constants
├── assets/
│   ├── icons/                  # PWA icons (192, 512)
│   └── images/                 # Onboarding, empty states
└── docs/                       # Project documentation
```

---

## Frontend Architecture

### Rendering
- Vanilla JS DOM manipulation. No virtual DOM.
- Each page module exports `render()` and `destroy()` functions.
- Components are reusable JS functions returning DOM elements.

### Router
- Hash-based (`#/dashboard`, `#/transactions`, `#/settings`).
- Route config maps hash → page module.
- Supports route params (`#/transaction/:id`).

### State
- No global state store. Each page queries IndexedDB on mount.
- Settings stored in LocalStorage (theme, currency, locale).
- Transient UI state lives in module-scoped variables.

---

## Storage Architecture

### IndexedDB (Primary)
- Database name: `wealthdeck`
- Version-based migrations in `database.js`.

**Object Stores:**

| Store | Key | Indexes |
|-------|-----|---------|
| accounts | id (auto) | type, name |
| transactions | id (auto) | date, accountId, categoryId, type, merchant |
| categories | id (auto) | type, name |
| budgets | id (auto) | categoryId, month |
| bills | id (auto) | nextDueDate, isActive |
| goals | id (auto) | targetDate, isCompleted |
| importHistory | id (auto) | importDate, sourceFile |
| merchantRules | id (auto) | pattern |
| receipts | id (auto) | transactionId |
| settings | key | — |

### LocalStorage (Settings Only)
- `wd_theme` – light/dark
- `wd_currency` – default currency code
- `wd_locale` – date/number locale
- `wd_onboarded` – boolean

---

## Offline Strategy

### Service Worker
- **Install:** Cache app shell (HTML, CSS, JS, icons).
- **Activate:** Clean old caches.
- **Fetch:** Cache-first for static assets. Network-first for nothing (no backend).
- Cache versioning via `CACHE_VERSION` constant.

### App Shell Model
All UI assets cached on first visit. App works 100% offline after install.

### Background Sync (Future)
For optional cloud backup when user opts in.

---

## Design System

### Principles
- Mobile-first responsive.
- Glassmorphism-inspired (frosted glass cards, blur, transparency).
- Dark mode default, light mode supported.
- Accessible: WCAG 2.1 AA minimum.
- Fast: No layout shifts, 60fps animations.

### Typography
- Primary: Inter (Google Fonts).
- Monospace: JetBrains Mono (for numbers/amounts).

### Color Tokens
Defined in `variables.css` as CSS custom properties. Semantic naming:
- `--color-primary`, `--color-accent`
- `--color-income`, `--color-expense`, `--color-transfer`
- `--color-surface`, `--color-surface-elevated`
- `--color-text`, `--color-text-secondary`

### Animations
- Page transitions: fade/slide (150ms).
- Card hover: subtle lift + shadow.
- Chart animations: Chart.js built-in.
- Toast: slide-in from top.

---

## Third-Party Libraries

| Library | Purpose | Phase |
|---------|---------|-------|
| Chart.js | Charts & visualizations | MVP |
| PapaParse | CSV parsing | Phase 2 |
| SheetJS (xlsx) | Excel import/export | Phase 2 |
| Tesseract.js | OCR for receipts | Phase 4 |

All loaded as ES modules. No package manager required for MVP (CDN or vendored).

---

## Security

- No network requests in MVP.
- Web Crypto API for future encrypted backups.
- No eval, no innerHTML with user data.
- CSP headers recommended when served.

---

## Performance Targets

- First paint: < 1s
- Interactive: < 2s
- Lighthouse PWA score: 100
- Lighthouse Performance: > 90
- IndexedDB operations: < 50ms typical

---

## Future Considerations

- **Capacitor/TWA** for Android wrapper.
- **Web Workers** for heavy import processing.
- **File System Access API** for direct file read/write.
- **Web Share API** for export sharing.
