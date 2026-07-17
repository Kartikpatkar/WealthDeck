
# WealthDeck – Routes & Navigation

> Hash-based SPA router. No server required.

---

## Route Map

| Route | Page Module | Description |
|-------|-------------|-------------|
| `#/` | dashboard | Redirect or default |
| `#/dashboard` | dashboard | Main dashboard |
| `#/transactions` | transactions | Transaction list |
| `#/transaction/new` | transactionForm | Add new transaction |
| `#/transaction/:id` | transactionForm | Edit transaction |
| `#/transaction/:id/view` | transactionDetail | View transaction detail |
| `#/accounts` | accounts | Account list |
| `#/account/:id` | accountDetail | Account detail + transactions |
| `#/categories` | categories | Category manager |
| `#/budgets` | budgets | Budget list (monthly) |
| `#/budget/:id` | budgetDetail | Budget detail |
| `#/bills` | bills | Recurring bills list |
| `#/goals` | goals | Savings goals |
| `#/reports` | reports | Reports & charts |
| `#/import` | import | Import wizard |
| `#/export` | export | Export options |
| `#/search` | search | Global search |
| `#/settings` | settings | App settings |
| `#/onboarding` | onboarding | First-launch flow |

---

## Navigation Structure

### Mobile: Bottom Tab Bar
```
[ Dashboard ] [ Transactions ] [ + Add ] [ Budgets ] [ More ]
```

### Desktop: Left Sidebar
```
Dashboard
Transactions
Accounts
Categories
Budgets
Bills
Goals
Reports
Import / Export
───────────
Settings
```

---

## Route Parameters

- `:id` — Numeric entity ID.
- Router parses params from hash: `#/transaction/42` → `{ id: "42" }`.

## Route Guards

- `#/onboarding` — Only shown if `wd_onboarded` is not set.
- All other routes — Redirect to `#/onboarding` if not onboarded.

## Page Lifecycle

Each page module implements:
```js
export function render(container, params) { }
export function destroy() { }
```

Router calls `destroy()` on old page, then `render()` on new page.
