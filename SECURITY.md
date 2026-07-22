# Security Policy

WealthDeck prioritizes your privacy and data security through a completely local-first architecture.

## Local-First Architecture
- **No Backend Servers:** WealthDeck does not have a backend server or database. 
- **Local Storage:** All your financial data is stored entirely on your device, inside your browser's IndexedDB. 
- **Zero Telemetry:** We do not track your usage, collect analytics, or sell your data.

## WebAuthn (Biometric App Lock)
WealthDeck utilizes the standard WebAuthn API to lock the app locally.
- Authentication happens on your device using platform authenticators (TouchID, FaceID, Windows Hello).
- The biometric data (fingerprint, face scan) never leaves your device and is verified securely by the operating system.

## Google Drive Sync
If you choose to enable Google Drive Sync:
- Authentication is handled directly by Google Identity Services.
- The app requests permission only to read and write a specific file (`wealthdeck_backup.json`) in your personal Google Drive.
- The app cannot read your other Google Drive files.

## Reporting Vulnerabilities
If you discover a security vulnerability, please report it via the issue tracker on our GitHub repository. We appreciate your efforts to keep this open-source project secure.
