# 💳 WealthDeck – Your Financial Life. Privately Yours.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.1.0-blue.svg)](#)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready-green.svg)](#)
[![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS-F7DF1E.svg)](#)

> **Tagline:** *Track, budget, and organize your personal finances with complete privacy.*

---

## ✨ Overview

**WealthDeck** is a modern, offline-first Progressive Web App (PWA) built specifically for people who want full control and tracking of their financial life without compromising their privacy.

Unlike traditional financial trackers that sync all your bank transactions to external corporate servers, WealthDeck focuses on:

* **Local-first privacy** (No mandated accounts, optional Google Drive syncing)
* **Offline-first Progressive Web App (PWA) architecture**
* **High-performance, zero-framework Vanilla JS**
* **Fast, native-like mobile experience**
* **100% data ownership**

Whether you're tracking daily expenses, building long-term financial goals, or managing monthly bills, WealthDeck helps you stay organized locally on your device.

---

## 🚀 Key Features

### 🗂️ Unified Financial Dashboard
Organize your money across various tools:
* Accounts (Cash, Bank, Credit Cards)
* Transactions (Income, Expenses, Transfers)
* Budgets (Zero-Based Envelope System: "Ready to Assign" vs "Available")
* Goals (Savings targets)
* Bills (Recurring subscriptions with Auto-Pay support)

### 🔒 Uncompromising Privacy
WealthDeck stores everything directly on your device via IndexedDB. There are no middleman servers. When you are in public, you can instantly toggle **Privacy Masking** (`***`) to hide your sensitive balances from prying eyes.

### 🔄 Google Drive Sync & Offline Mode
Back up your data directly to your personal Google Drive. WealthDeck operates offline-first, meaning if you lose connection, you can still add transactions. Your data will sync when you choose to connect.

### 📝 Smart CSV Import
Import your bank statements easily. WealthDeck automatically detects columns and learns your merchants. Assign a category to a merchant once, and WealthDeck will remember it for future imports!

### 🎨 Themes & Customization
Personalize your app experience with beautiful, modern themes:
* Light / Dark / System Default
* Amoled Dark (For OLED screens)
* Midnight Blue
* Infinite Custom Accent Colors (Pick exactly the hex code you want)

---

## 💻 Tech Stack

WealthDeck is designed to be lightweight, blazing fast, and easily maintainable.

* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Variables)
* **Storage:** IndexedDB API for local storage
* **Icons:** SVG icons embedded natively
* **Architecture:** Component-based vanilla DOM rendering
* **Hosting:** Can be hosted on GitHub Pages, Netlify, Vercel, or any static file server.

## 🛠️ Installation

Because WealthDeck is entirely client-side, installation is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/Kartikpatkar/WealthDeck.git
   ```
2. Navigate to the project folder:
   ```bash
   cd WealthDeck
   ```
3. Run a local development server. For example, using Python or Node:
   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```
4. Open your browser and navigate to `http://localhost:3000` (or the port specified by your server).

To install it as an App on your phone or desktop, simply visit the live URL and click "Add to Home Screen" (or the install icon in your browser's address bar).

---

## 🤝 Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started, report bugs, or submit pull requests.

## 🛡️ Privacy Policy
Your data is yours. Please read our [PRIVACY.md](./PRIVACY.md) to understand exactly how WealthDeck operates locally and how Google Drive sync works.

## 📄 License
This project is licensed under the [MIT License](LICENSE).