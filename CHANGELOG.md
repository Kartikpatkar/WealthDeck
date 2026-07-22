# Changelog

All notable changes to WealthDeck will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2026-07-22

### Fixed
- **UI Corruptions:** Fixed a syntax error in `transactions.js` and `settings.js` where the CSS extraction script accidentally stripped out quotes in dynamic JS template literals, causing the app to crash.

## [1.1.2] - 2026-07-22

### Fixed
- **Biometric App Lock:** Enforced platform authenticator (`residentKey` and `authenticatorAttachment: "platform"`) to prevent the WebAuthn API from mistakenly prompting for external USB security keys.
- **Auto-Pay Catchup Loop:** Replaced the `if` statement with a `while` loop in `billService.js`. If you don't open the app for months, it will now correctly iterate and catch up on *all* missed auto-pay transactions instantly.
- **Cascading Bill Deletions:** Deleting an Account now fully deletes associated auto-pay bills to prevent orphaned phantom charges. Deleting a Category now gracefully sets associated bills to "Uncategorized".

### Changed
- **CSS Architecture:** Extracted 170+ static inline CSS styles across the codebase into a dedicated `inline.css` file (`mod-style-[hash]`) for better Separation of Concerns and Content Security Policy (CSP) compliance.
- Bumped PWA service worker cache version to `v20`.

## [1.1.1] - 2026-07-22

### Fixed
- **Settings UI Layout:** Fixed a bug where hallucinated CSS classes broke the layout of the Biometric App Lock toggle and the Danger Zone block.

## [1.1.0] - 2026-07-22

### Added
- **Zero-Based Envelope Budgeting:** Completely overhauled the Budget UI. You now have a master "Ready to Assign" pool that tracks all income. Budgets act as true envelopes showing "Assigned", "Activity", and "Available" funds.
- **Auto-Recurring Bills:** Bills can now be toggled to "Auto-Pay". When the app is opened, it automatically checks and creates expense transactions for any due bills, advancing their next due dates.
- **Cascading Category Deletions:** Deleting a category will now gracefully orphan related transactions and automatically delete associated budgets to return funds to "Ready to Assign".
- **Timezone Date Normalization:** Completely rewrote date parsing logic across Reports, Budgets, and Dashboard to prevent UTC-to-Local off-by-one-day rendering bugs.

### Changed
- Bumped PWA service worker cache version for smooth upgrading.
- Pagination is now added to transactions list.

## [1.0.0] - 2026-07-21

### Added
- **Initial Release** of WealthDeck! 🎉
- **Dashboard:** Comprehensive overview of total balance, recent transactions, and goal progress.
- **Accounts:** Manage multiple accounts (Cash, Bank, Credit Cards) with custom icons and colors.
- **Transactions:** Log incomes, expenses, and inter-account transfers.
- **Budgets:** Set and track monthly category spending limits.
- **Goals:** Track long term savings goals.
- **Bills:** Keep track of recurring subscriptions and utilities.
- **Import/Export:** Smart CSV importing with rule detection and JSON/CSV exporting.
- **Privacy Masking:** Toggle visibility of sensitive balances with a single click.
- **Themes & Colors:** Light, Dark, System, Amoled Dark, and Midnight Blue themes, along with custom infinite color picker for accents.
- **Cloud Sync:** Optional Google Drive synchronization for cross-device backup.
- **PWA Support:** Installable on iOS, Android, and Desktop via manifest and service workers.
