# Contributing to WealthDeck

Thank you for your interest in contributing to WealthDeck! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Setup

1. Fork the repo and clone it to your local machine.
2. WealthDeck uses zero build tools (no Webpack, Vite, or Babel required).
3. Simply serve the root folder via any static web server:
   ```bash
   npx serve .
   ```
4. Open the site in your browser.

## 💻 Code Style & Architecture

- **Vanilla JS:** We avoid heavy frameworks (React, Vue, Angular). Please use modern ES6+ Vanilla JavaScript.
- **CSS:** Use standard CSS with custom properties (CSS variables). Do not add preprocessors like SCSS/SASS unless discussed in an issue first.
- **Component Logic:** Pages and components are split into logical ES modules in the `/js/pages/` and `/js/components/` directories.
- **State & Storage:** All data manipulation should go through the service layers in `/js/services/`.

## 🐛 Bug Reports

When reporting a bug, please include:
- A quick summary and/or background
- Steps to reproduce
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## ✨ Pull Requests

1. Create a new branch from `main` for your feature or bugfix.
2. Write clean, readable code and keep the PR focused on a single issue.
3. Test your changes locally.
4. Submit the PR with a detailed description of the changes.

## 📜 License
By contributing, you agree that your contributions will be licensed under its MIT License.
