# WealthDeck — UI/UX Design Handoff

This document provides a comprehensive blueprint for designing the WealthDeck application across all device resolutions. WealthDeck is a privacy-first, offline-first Personal Finance OS. 

## 1. Core Design Philosophy
- **Aesthetic:** Premium, Glassmorphism, Native App Feel.
- **Theme:** Dark mode default (deep navy/black with vibrant accents). Light mode supported.
- **Data Density:** High information density but highly scannable using color coding and clear typography.
- **Shape Language:** Soft, bubbly, rounded corners (e.g., 16px to 24px border radiuses).
- **Interactions:** Micro-animations for buttons (scale down on press), bottom-sheet sliding modals for mobile.

## 2. Breakpoints & Responsive Strategy

### Mobile (< 768px) - "Native App Experience"
- **Navigation:** Fixed floating bottom navigation bar.
- **Action Button:** A large, prominent Floating Action Button (FAB) for adding transactions, breaking out of the center of the bottom nav.
- **Layout:** Single column. Full-width cards with edge padding.
- **Modals:** Slide-up bottom sheets that anchor to the bottom of the screen.

### Tablet (768px – 1024px) - "Comfortable Middle Ground"
- **Navigation:** Collapsible left sidebar (icon-only by default) or a spaced-out bottom nav.
- **Layout:** 2-column grid for the dashboard.
- **Modals:** Centered overlay dialogs (not bottom sheets).

### Desktop (> 1024px) - "Modern Web Dashboard"
- **Navigation:** Persistent left sidebar with full icons and text labels.
- **Layout:** 3-column grid for the dashboard. Max content width of 1400px (centered).
- **Modals:** Right-side slide-in panels or centered overlay dialogs.

## 3. Core Screens to Design

### 1. Dashboard (Home)
- **Hero Widget:** Total Balance Card (glassmorphism, gradient glow, large numbers).
- **Quick Stats:** Income vs. Expense summary cards.
- **Visuals:** Expense breakdown donut chart.
- **Recent Activity:** Top 5 recent transactions list.
- **Budgets:** Mini progress bars for the top 3 budget categories.

### 2. Transactions List
- **Header:** Sticky header grouped by date (e.g., "Today", "Yesterday", "July 12").
- **Row Item:** Category Icon, Merchant Name, Tags (optional), Amount (Green for income, Red for expense).
- **Actions:** Swipe-to-delete or swipe-to-edit (Mobile) / Hover action buttons (Desktop).
- **Filters:** Horizontal scrolling chips for filtering by Account, Category, Date.

### 3. Add / Edit Transaction (Modal)
- **Type Selector:** Segmented control (Income | Expense | Transfer).
- **Amount Input:** Huge, centered, monospace font. Looks like a calculator input.
- **Form Fields:** Category dropdown, Account dropdown, Date picker, Merchant (autocomplete), Notes.
- **Save Action:** Prominent sticky save button.

### 4. Accounts Hub
- **Grid/List:** Cards showing Account Name, Bank Logo/Icon, Account Type (Bank, Cash, Wallet), and Current Balance.
- **Visuals:** Each account can have a custom color strip or gradient background.

### 5. Categories & Budgets
- **Categories Grid:** Grid of icons with custom colors.
- **Budgets:** Monthly progress bars that transition from Green -> Yellow -> Red as the user approaches their spending limit.

### 6. Reports & Analytics
- **Charts:** Line charts for income/expense trends over time. Bar charts for monthly comparisons.
- **Filters:** Date range picker (This Month, Last 3 Months, YTD).

### 7. Smart Import Wizard
- **Step 1:** Upload area (drag & drop zone for desktop).
- **Step 2:** Data mapping table (previewing CSV columns).
- **Step 3:** AI Categorization preview (showing which merchant goes to which category).

### 8. Settings
- **Preferences:** Theme toggle, Currency selector.
- **Data Control:** Export Data, Import Data, Wipe Data (red danger zone).

## 4. UI Components & Tokens

### Colors (Dark Mode Reference)
- **Background:** `#0a0e17`
- **Surface (Cards):** `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(16px)`
- **Primary Accent:** `#6366f1` (Indigo)
- **Income:** `#10b981` (Emerald Green)
- **Expense:** `#ef4444` (Ruby Red)
- **Text:** Primary `#f1f5f9`, Secondary `#94a3b8`

### Typography
- **Headings & UI:** `Inter` (Sans-serif, clean, modern).
- **Numbers/Amounts:** `JetBrains Mono` or any legible monospace font to keep financial digits aligned.

### Form Inputs
- No harsh borders. Use soft filled backgrounds (e.g., `rgba(255, 255, 255, 0.08)`) that highlight with a glowing border when focused.
