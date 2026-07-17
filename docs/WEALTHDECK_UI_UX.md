
# WealthDeck – UI/UX Design Specification

> Mobile-first. Glassmorphism. Premium feel. Offline-first PWA.

---

## Design Philosophy

- **Premium, not minimal.** Rich visuals, smooth animations, depth.
- **Glassmorphism-inspired.** Frosted glass cards, subtle transparency, layered depth.
- **Dark mode default.** Light mode available.
- **Data-dense but scannable.** Show numbers clearly. Use color to encode meaning.
- **Zero-friction input.** Adding a transaction should take < 5 seconds.
- **User-friendly first.** Every screen should be intuitive without reading docs. New users should understand the app within 30 seconds.
- **Self-learning.** The app learns from user behavior and adapts over time.

---

## Self-Learning & Adaptive UX

WealthDeck gets smarter the more you use it. All learning happens locally—no cloud.

### Smart Defaults
- **Recent account auto-select:** Default to the account used most recently.
- **Time-based category suggestion:** If user adds "Food" expenses mostly at lunch/dinner time, pre-select "Food" during those hours.
- **Merchant auto-complete:** After entering a merchant once, auto-suggest on future entries.
- **Amount prediction:** For recurring merchants (e.g., "Netflix"), pre-fill the last-used amount.

### Contextual Intelligence
- **Smart category assignment:** When user types a merchant name, auto-suggest category based on past mappings stored in `merchantRules`.
- **Duplicate warning:** If a similar transaction (same amount + merchant + date) exists, show a gentle warning before saving.
- **Budget nudge:** When adding an expense that would exceed a budget, show the remaining budget inline—don't block, just inform.

### Progressive Disclosure
- **Simple by default.** Show only essential fields (amount, category, account) on the add transaction form.
- **"More details" expandable.** Tags, notes, merchant, receipt attachment hidden behind a toggle.
- **Features unlock naturally.** Bills section appears after user creates a recurring transaction. Import wizard surfaces after 20+ manual entries.

### Adaptive Dashboard
- Dashboard widgets reorder based on what user interacts with most.
- If user never uses budgets, shrink the budget widget. If they use reports daily, promote it.
- Stored as `dashboardLayout` preference in LocalStorage.

### Inline Help & Tooltips
- First-time hints on each screen (dismissible, shown once per feature).
- Contextual tooltips on icons and actions.
- Empty states with clear CTAs: "No transactions yet — tap + to add your first."
- Stored as `hints_seen_*` flags in LocalStorage.

### Error Prevention
- Validate inputs in real-time, not on submit.
- Prevent negative balances warning (not blocking).
- Confirm destructive actions (delete account, clear data) with explicit typed confirmation.
- Undo support for delete actions (5-second undo toast).

---

## Color Palette

### Dark Mode (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0e17` | App background |
| `--bg-surface` | `rgba(255,255,255,0.05)` | Cards, panels |
| `--bg-surface-elevated` | `rgba(255,255,255,0.08)` | Modals, dropdowns |
| `--color-primary` | `#6366f1` | Primary actions, links |
| `--color-accent` | `#22d3ee` | Highlights, badges |
| `--color-income` | `#34d399` | Green — income |
| `--color-expense` | `#f87171` | Red — expense |
| `--color-transfer` | `#60a5fa` | Blue — transfers |
| `--color-warning` | `#fbbf24` | Alerts, budget warnings |
| `--text-primary` | `#f1f5f9` | Main text |
| `--text-secondary` | `#94a3b8` | Secondary text |
| `--border` | `rgba(255,255,255,0.1)` | Borders, dividers |

### Light Mode
Inverted with warm whites and soft shadows. Same semantic tokens.

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Inter | 700 | 24–32px |
| Body | Inter | 400 | 14–16px |
| Labels | Inter | 500 | 12–13px |
| Amounts | JetBrains Mono | 600 | 16–28px |
| Small | Inter | 400 | 11–12px |

---

## Screen Map

### Bottom Navigation (Mobile)
| Tab | Icon | Route |
|-----|------|-------|
| Dashboard | 📊 | `#/dashboard` |
| Transactions | 📋 | `#/transactions` |
| ➕ Add | ➕ | Opens add modal |
| Budgets | 📦 | `#/budgets` |
| More | ☰ | `#/more` |

### More Menu
- Accounts
- Categories
- Bills & Recurring
- Savings Goals
- Reports
- Import / Export
- Settings
- About

---

## Screen Specifications

### Dashboard
- **Balance Card:** Large total balance. Glassmorphism card with gradient border.
- **Income/Expense Summary:** Two stat cards, color-coded.
- **Budget Progress:** Horizontal progress bars per category.
- **Recent Transactions:** Last 5–10, tappable.
- **Spending Chart:** Donut chart (Chart.js) for current month categories.
- **Quick Add FAB:** Floating action button bottom-right.

### Transactions List
- Grouped by date (sticky headers).
- Each row: icon, merchant/description, category tag, amount (color-coded).
- Swipe actions: Edit, Delete.
- Top: Search bar + filter chips (date, category, account, type).
- Infinite scroll or pagination.

### Add/Edit Transaction
- Full-screen modal or slide-up sheet.
- Type selector: Income / Expense / Transfer (segmented control).
- Amount input: Large, centered, monospace.
- Fields: Account, Category, Date, Merchant, Description, Tags, Notes.
- Receipt attach button.
- Save button with haptic feedback (if available).

### Accounts
- Card list. Each account: name, type icon, balance.
- Tap → account detail with transaction history.
- Add account: modal form.

### Categories
- Grid or list. Icon + name + color swatch.
- Tap → edit. Long press → reorder.
- Separate tabs for Income / Expense.

### Budgets
- Monthly view.
- Per-category progress bar with spent / limit.
- Color shifts: green → yellow → red as limit approaches.
- Tap → category transactions for that month.

### Bills
- List of upcoming bills sorted by due date.
- Status: Overdue (red), Due Soon (yellow), Upcoming (default).
- Mark as Paid button.
- Add bill: modal form.

### Savings Goals
- Visual card per goal.
- Progress ring or bar.
- Amount saved / target.
- Contribute button.

### Reports
- Date range selector.
- Charts: Category breakdown (donut), Daily trend (bar), Income vs Expense (line).
- Table summary below charts.
- Filter by account.

### Import Wizard
- Step 1: Upload file (drag-drop or file picker).
- Step 2: Auto-detected columns shown. User confirms/adjusts mapping.
- Step 3: Preview transactions. Flag duplicates.
- Step 4: Bulk categorize. Apply merchant rules.
- Step 5: Confirm import. Show summary.

### Settings
- Theme toggle (dark/light).
- Default currency.
- Default account.
- Export data (JSON/CSV).
- Clear all data (with confirmation).
- About / version.

---

## Component Library

### Card
Glassmorphism: `backdrop-filter: blur(12px)`, semi-transparent background, subtle border, border-radius 16px.

### Modal
Slide-up from bottom (mobile). Centered overlay (desktop). Backdrop blur.

### Toast
Top notification bar. Auto-dismiss 3s. Types: success (green), error (red), info (blue).

### Button
- Primary: Filled, gradient or solid primary color.
- Secondary: Outlined.
- Danger: Red filled.
- FAB: Circular, elevated shadow, primary color.

### Form Inputs
- Floating labels.
- Bottom-border style (Material-inspired).
- Validation: red border + helper text on error.

### Empty States
- Illustration + message + CTA button.
- "No transactions yet. Add your first one!"

---

## Interaction Patterns

### Gestures (Mobile)
- Pull-to-refresh on lists (re-query IndexedDB).
- Swipe-to-delete / swipe-to-edit on transaction rows.
- Long press for context menu.

### Animations
- Page transitions: 150ms fade + slight slide.
- Card entrance: staggered fade-in.
- Number counters: count-up animation on dashboard.
- Chart transitions: built-in Chart.js animations.
- Skeleton loading: shimmer placeholders during data fetch.

### Accessibility
- All interactive elements focusable.
- Proper ARIA labels on icons and buttons.
- Color not sole indicator (icons + text alongside).
- Minimum tap target: 44×44px.
- Reduced motion: respect `prefers-reduced-motion`.

---

## Adaptive Responsive Design

> **Principle:** Mobile should feel like a native app. Desktop should feel like a modern web dashboard. Every resolution in between should feel comfortable and intentional.

### Breakpoints

| Breakpoint | Target | Layout Strategy |
|------------|--------|-----------------|
| < 480px | Phone (primary) | Single column, bottom nav, full-screen modals |
| 480–768px | Large phone / small tablet | Single column, slightly wider cards |
| 768–1024px | Tablet | Two-column grid, bottom nav or sidebar toggle |
| > 1024px | Desktop | Sidebar nav, multi-column dashboard, inline panels |

### Mobile Experience (< 768px) — "Native App Feel"

Navigation:
- **Bottom tab bar** (fixed). 5 tabs: Dashboard, Transactions, + Add, Budgets, More.
- No hamburger menus. Primary actions always visible.
- Active tab highlighted with icon + label.

Layout:
- Full-width cards. Single column. No horizontal scrolling.
- Cards stack vertically with consistent spacing.
- FAB (Floating Action Button) for quick-add transaction.

Interactions:
- **Touch-first.** Swipe to edit/delete. Pull-to-refresh. Long-press context menus.
- Modals slide up from bottom (sheet-style). Full-screen on small phones.
- Amount input opens numeric keypad automatically.
- Large tap targets (minimum 48×48px on mobile).

Typography:
- Body text: 16px minimum (prevents iOS zoom on input focus).
- Amounts: Large, bold, monospace. Readable at a glance.

Status bar:
- `theme-color` meta tag matches app background for seamless status bar blend.

### Tablet Experience (768–1024px) — "Comfortable Middle Ground"

Layout:
- Two-column grid for dashboard widgets.
- Transaction list + detail side-by-side (master-detail pattern).
- Modals centered overlay, not full-screen.

Navigation:
- Collapsible sidebar (icon-only by default, expand on hover/tap).
- OR bottom nav with wider spacing.

### Desktop Experience (> 1024px) — "Modern Web Dashboard"

Navigation:
- **Persistent left sidebar.** Full labels + icons. Collapsible to icon-only.
- No bottom nav. No hamburger.
- Breadcrumbs for deep navigation (e.g., Accounts → HDFC Savings → July 2026).

Layout:
- **Multi-column dashboard.** 2–3 column grid for widgets.
- Transaction list: table view with sortable columns (date, amount, merchant, category).
- Reports: side-by-side charts. Filters in a sidebar panel.
- Settings: split pane (menu left, content right).

Interactions:
- **Hover states** on all interactive elements (cards, buttons, rows).
- Keyboard shortcuts: `N` = new transaction, `/` = search, `Esc` = close modal.
- Right-click context menus on transaction rows.
- Drag-and-drop for dashboard widget reordering.

Spacing:
- Max content width: 1400px, centered. No edge-to-edge stretching.
- Generous padding and whitespace. Desktop has room—use it.

### Component Behavior by Resolution

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Nav | Bottom tab bar | Collapsible sidebar | Persistent sidebar |
| Add Transaction | Full-screen sheet | Centered modal | Slide-in panel from right |
| Transaction List | Card per row | Card per row | Table with columns |
| Dashboard | Stacked cards | 2-col grid | 3-col grid |
| Reports Charts | Single chart, swipeable | Side-by-side | Multi-chart grid |
| Search | Full-screen overlay | Top bar dropdown | Inline top bar |
| Settings | Full page | Full page | Split pane |
| Modals | Slide-up sheet | Centered overlay | Centered overlay (narrower) |

### CSS Strategy

```css
/* Mobile first — base styles are mobile */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bottom-nav { display: none; }
  .sidebar { display: flex; }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .app-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Safe Area Handling (Notched Devices)

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## Onboarding (First Launch)

1. Welcome screen with tagline.
2. Set default currency.
3. Create first account.
4. Optional: Add first category or skip.
5. Land on Dashboard.

Skip-able. No forced signup.
