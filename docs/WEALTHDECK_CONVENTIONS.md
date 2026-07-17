
# WealthDeck – Coding Conventions & Standards

---

## JavaScript

### Module Pattern
- ES Modules (`import`/`export`). No CommonJS.
- One module per file. Named exports preferred over default.
- Service modules: pure data functions (no DOM).
- Page modules: `render()` + `destroy()` exports.
- Component modules: functions returning DOM elements.

### Naming
| Type | Convention | Example |
|------|-----------|---------|
| Files | camelCase | `transactionService.js` |
| Functions | camelCase | `getMonthlyTotal()` |
| Constants | UPPER_SNAKE | `MAX_IMPORT_SIZE` |
| CSS classes | kebab-case | `.card-balance` |
| CSS variables | kebab-case | `--color-primary` |
| IDB stores | camelCase | `transactions` |
| DOM IDs | kebab-case | `#add-transaction-btn` |

### Error Handling
- All IndexedDB operations wrapped in try/catch.
- Errors surfaced via toast notifications, not alerts.
- Console errors in development only.

### Dates
- Store as ISO 8601 strings (`"2026-07-17"`) or Date objects in IDB.
- Display using user locale via `Intl.DateTimeFormat`.
- Internal comparisons always on Date objects.

### Currency
- Store amounts as integers (paise/cents) to avoid floating point.
- Display via `Intl.NumberFormat` with user's currency.
- All calculations on integer amounts.

---

## CSS

### Architecture
- CSS custom properties for all design tokens.
- No utility-first framework. Semantic class names.
- Mobile-first: base styles for mobile, `@media` for larger screens.
- BEM-inspired naming: `.card`, `.card__title`, `.card--highlighted`.

### File Organization
1. `variables.css` — Tokens only, no selectors.
2. `reset.css` — Normalize.
3. `base.css` — Body, typography, links.
4. `components.css` — Reusable components.
5. `pages.css` — Page-specific overrides.
6. `animations.css` — All keyframes.

### No Inline Styles
All styling through classes. Exception: dynamically computed values (e.g., progress bar width).

---

## Git

### Branch Naming
- `main` — Stable.
- `dev` — Active development.
- `feature/feature-name` — New features.
- `fix/bug-description` — Bug fixes.

### Commit Messages
```
type: short description

- detail 1
- detail 2
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`.

---

## File Size Limits

- No single JS file > 300 lines. Split into helpers.
- No single CSS file > 500 lines. Split by concern.
- Images optimized: icons < 5KB, illustrations < 50KB.

---

## Modular Code Best Practices

### Single Responsibility
- Each module does ONE thing. `transactionService.js` handles transaction CRUD only—no UI, no routing.
- Services never import DOM APIs. Pages never run raw IndexedDB queries.

### Dependency Direction
```
Pages → Services → DB Layer → IndexedDB
Pages → Components (UI only)
Components → Utils (formatting, validation)
```
No circular imports. No upward dependencies.

### Reusability
- Extract any pattern used 2+ times into a utility or component.
- Components accept config objects, not hardcoded values.
- Service functions are pure where possible: input → output, no side effects beyond DB writes.

### Code Splitting
- Page modules loaded only when route is activated (dynamic `import()`).
- Heavy libraries (Chart.js, PapaParse, SheetJS) loaded on-demand, not at app start.
- Service Worker pre-caches only the app shell; data modules load as needed.

### Clean Interfaces
- Every service module exports a clear public API at the top of the file.
- Internal helper functions are not exported.
- Use JSDoc comments for all exported functions:
```js
/**
 * @param {number} accountId
 * @param {string} month - Format: "YYYY-MM"
 * @returns {Promise<Transaction[]>}
 */
export async function getTransactionsByMonth(accountId, month) { }
```

---

## Performance & Efficiency

### DOM Operations
- Batch DOM updates. Use `DocumentFragment` for lists.
- Never read layout properties (offsetHeight, getBoundingClientRect) between writes—causes forced reflow.
- Use `requestAnimationFrame` for visual updates.
- Prefer `textContent` over `innerHTML` (security + speed).
- Remove event listeners in `destroy()` to prevent memory leaks.

### IndexedDB
- Use indexes for all frequent queries (date, accountId, categoryId).
- Batch writes in a single transaction when importing.
- Use cursors with `IDBKeyRange` for range queries instead of loading all records.
- Keep transactions short—open, read/write, close. No long-lived transactions.

### Memory Management
- Release large objects (Blob data from receipts) when navigating away.
- Use WeakRef or nullify references in `destroy()`.
- Avoid storing full dataset in memory—query on demand, paginate.
- Limit chart data points (aggregate daily → weekly for large date ranges).

### Lazy Loading
- Chart.js: Load only when dashboard or reports page is visited.
- PapaParse/SheetJS: Load only when import/export page is visited.
- Images: Use `loading="lazy"` attribute.
- Page modules: Dynamic `import()` on route activation.

### Rendering Performance
- Target 60fps for all animations.
- Use CSS `will-change` sparingly and only on animated elements.
- Use CSS `contain: content` on isolated components.
- Debounce search input (300ms).
- Throttle scroll handlers (16ms / frame).
- Virtual scrolling for transaction lists > 100 items.

### Caching & Memoization
- Cache computed dashboard totals. Invalidate on transaction write.
- Cache category/account lookups in module-scoped Maps. Clear on data change.
- Memoize expensive formatting operations (currency format, date format).

### Bundle Size
- No unnecessary dependencies. Vanilla JS wherever possible.
- Tree-shake library imports (import specific modules, not entire library).
- Target total app shell < 200KB (uncompressed JS + CSS).
- Audit with Lighthouse regularly.

---

## Accessibility Checklist (Per Component)

- [ ] Focusable via keyboard.
- [ ] ARIA label or visible label.
- [ ] Color contrast ≥ 4.5:1.
- [ ] Tap target ≥ 44×44px.
- [ ] Works with screen reader.
- [ ] Respects `prefers-reduced-motion`.
