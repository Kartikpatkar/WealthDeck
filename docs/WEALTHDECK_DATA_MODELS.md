
# WealthDeck – Data Models & IndexedDB Schema

> All data stored locally in IndexedDB. No server. No cloud.

---

## Account

```js
{
  id: Number,          // Auto-incremented
  name: String,        // "HDFC Savings", "Cash Wallet"
  type: String,        // "cash" | "bank" | "wallet" | "credit_card" | "upi" | "investment"
  balance: Number,     // Current balance (calculated or manual)
  currency: String,    // "INR", "USD"
  icon: String,        // Icon identifier
  color: String,       // Hex color
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `type`, `name`

---

## Transaction

```js
{
  id: Number,
  type: String,            // "income" | "expense" | "transfer"
  amount: Number,          // Always positive
  accountId: Number,       // FK → accounts
  toAccountId: Number,     // FK → accounts (transfers only)
  categoryId: Number,      // FK → categories
  merchant: String,        // "Swiggy", "Amazon"
  description: String,
  date: Date,              // Transaction date
  time: String,            // "14:30" (optional)
  tags: [String],          // ["food", "weekend"]
  notes: String,           // User notes
  receiptId: Number,       // FK → receipts (optional)
  isRecurring: Boolean,
  recurringBillId: Number, // FK → bills (optional)
  importSource: String,    // "manual" | "csv" | "gpay" | etc.
  importBatchId: Number,   // FK → importHistory (optional)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `date`, `accountId`, `categoryId`, `type`, `merchant`, `tags` (multiEntry)

---

## Category

```js
{
  id: Number,
  name: String,        // "Food & Dining"
  type: String,        // "income" | "expense"
  icon: String,        // Icon identifier
  color: String,       // Hex color
  parentId: Number,    // FK → categories (for subcategories, optional)
  isDefault: Boolean,  // System-provided category
  isArchived: Boolean,
  sortOrder: Number,
  createdAt: Date
}
```

**Indexes:** `type`, `name`, `parentId`

---

## Budget

```js
{
  id: Number,
  categoryId: Number,  // FK → categories
  amount: Number,      // Budget limit
  month: String,       // "2026-07" (YYYY-MM)
  spent: Number,       // Calculated, cached
  alertAt: Number,     // Percentage to trigger alert (e.g., 80)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `categoryId`, `month`

---

## Bill (Recurring)

```js
{
  id: Number,
  name: String,        // "Netflix", "Electricity"
  amount: Number,
  categoryId: Number,  // FK → categories
  accountId: Number,   // FK → accounts
  frequency: String,   // "monthly" | "weekly" | "yearly" | "custom"
  customDays: Number,  // Days between (for custom)
  nextDueDate: Date,
  lastPaidDate: Date,
  isActive: Boolean,
  isAutoDetected: Boolean,  // Detected by import engine
  remindDaysBefore: Number, // 0 = on due date
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `nextDueDate`, `isActive`, `categoryId`

---

## Savings Goal

```js
{
  id: Number,
  name: String,        // "Emergency Fund", "Vacation"
  targetAmount: Number,
  savedAmount: Number,
  targetDate: Date,    // Optional deadline
  icon: String,
  color: String,
  isCompleted: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `targetDate`, `isCompleted`

---

## Receipt

```js
{
  id: Number,
  transactionId: Number,   // FK → transactions
  type: String,            // "receipt" | "invoice" | "warranty" | "photo"
  fileName: String,
  mimeType: String,
  data: Blob,              // Stored as Blob in IndexedDB
  notes: String,
  createdAt: Date
}
```

**Indexes:** `transactionId`

---

## Merchant Rule

```js
{
  id: Number,
  pattern: String,         // Regex or contains match. "SWIGGY*"
  merchantName: String,    // Clean name: "Swiggy"
  categoryId: Number,      // FK → categories
  confidence: Number,      // 0-100
  isUserDefined: Boolean,
  hitCount: Number,        // Times this rule matched
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `pattern`, `merchantName`

---

## Import History

```js
{
  id: Number,
  sourceFile: String,      // Original filename
  sourceType: String,      // "csv" | "excel" | "gpay" | "phonepe" | etc.
  totalRecords: Number,
  importedCount: Number,
  duplicateCount: Number,
  errorCount: Number,
  importDate: Date,
  columnMapping: Object,   // { date: "Col A", amount: "Col C", ... }
  canRollback: Boolean,
  createdAt: Date
}
```

**Indexes:** `importDate`, `sourceFile`

---

## Default Categories (Seed Data)

### Expense
| Name | Icon |
|------|------|
| Food & Dining | 🍽️ |
| Groceries | 🛒 |
| Transport | 🚗 |
| Shopping | 🛍️ |
| Entertainment | 🎬 |
| Health | 💊 |
| Education | 📚 |
| Bills & Utilities | 💡 |
| Rent | 🏠 |
| Subscriptions | 📺 |
| Personal Care | 💇 |
| Gifts | 🎁 |
| Travel | ✈️ |
| Insurance | 🛡️ |
| EMI & Loans | 🏦 |
| Other | 📦 |

### Income
| Name | Icon |
|------|------|
| Salary | 💰 |
| Freelance | 💻 |
| Business | 📊 |
| Interest | 🏦 |
| Dividend | 📈 |
| Cashback | 💸 |
| Refund | 🔄 |
| Gift Received | 🎁 |
| Other Income | 💵 |

---

## Migration Strategy

- Version numbers in `database.js`.
- Each version bump adds/modifies stores.
- `onupgradeneeded` handles sequential migrations.
- Never delete user data during migration.
