
# WealthDeck – Export & Backup Specification

---

## Export Formats

### JSON (Primary Backup)
Full database dump. Includes all stores:
```json
{
  "version": 1,
  "exportDate": "2026-07-17T12:00:00Z",
  "app": "WealthDeck",
  "data": {
    "accounts": [...],
    "transactions": [...],
    "categories": [...],
    "budgets": [...],
    "bills": [...],
    "goals": [...],
    "merchantRules": [...],
    "importHistory": [...],
    "receipts": [...],
    "settings": {...}
  }
}
```

### CSV
Transactions only. Columns:
```
Date, Type, Amount, Account, Category, Merchant, Description, Tags, Notes
```

### Excel (Phase 2)
Via SheetJS. Multiple sheets:
- Transactions
- Accounts
- Categories
- Budgets

### PDF (Future)
Monthly report export.

---

## Import (Restore)

### JSON Restore
- Parse exported JSON.
- Validate version compatibility.
- Options: **Merge** (skip duplicates) or **Replace** (clear + import).
- Show preview: record counts per store.
- Confirm before writing.

---

## Backup Reminders

- Prompt user to export after every 50 new transactions (configurable).
- Store `lastBackupDate` in LocalStorage.
- Dismissible notification.

---

## File Naming

Auto-generated filenames:
```
wealthdeck_backup_2026-07-17.json
wealthdeck_transactions_2026-07.csv
```

---

## Future: Encrypted Backup

- Web Crypto API: AES-GCM encryption.
- User sets passphrase.
- Export produces `.wdbackup` encrypted file.
- Import requires passphrase to decrypt.
