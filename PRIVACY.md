# Privacy Policy

**Effective Date:** July 21, 2026

At WealthDeck, we believe your financial data is exactly that—**yours**. 

This Privacy Policy explains how our Progressive Web App (PWA) operates and how we handle (or rather, don't handle) your data.

## 1. Local-First Data Storage

WealthDeck is designed as a local-first application. 
- **No Central Servers:** We do not own, operate, or rent any databases or servers that receive your financial data.
- **IndexedDB:** All of your transactions, accounts, budgets, goals, and settings are stored locally on your device within your web browser's IndexedDB storage.
- **If you clear your browser data or uninstall the app (without backing up), your data will be permanently deleted.**

## 2. Google Drive Synchronization (Optional)

If you choose to use the Cloud Sync feature:
- WealthDeck will request access to your personal Google Drive via the Google API.
- The app only creates and accesses a specific hidden app-data folder inside your Google Drive. It **cannot** read your other personal Google Drive files.
- The sync file (`wealthdeck_backup.json`) is securely stored in your personal cloud. We do not have access to your Google account or your Drive contents.

## 3. Third-Party Tracking & Analytics

- **No Trackers:** We do not use Google Analytics, Meta Pixels, or any other third-party tracking scripts. 
- **No Ads:** We do not serve advertisements, meaning no ad networks are building a profile on your financial habits.

## 4. Privacy Masking

WealthDeck includes a built-in UI feature called **Privacy Masking** (the eye icon). When activated, this feature visually obscures your balances and sensitive numbers with asterisks (`***`). This is purely a UI enhancement to prevent "shoulder surfing" when using the app in public spaces; the underlying data remains unchanged on your device.

## 5. Changes to this Policy

As the app evolves, we may update this policy. Because we have no central database of users, we cannot email you about changes. Please check this file periodically. All updates will respect the core philosophy: your financial data remains on your devices.

## Contact

If you have any privacy concerns or questions, please open an issue in the official GitHub repository.
