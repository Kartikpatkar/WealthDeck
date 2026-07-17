
# WealthDeck – Universal Import Engine Specification

## Vision
The Universal Import Engine is one of WealthDeck's flagship features. Users should never have to manually recreate years of financial history. WealthDeck imports data from banks, wallets, payment apps and generic files while keeping **all processing on-device**.

### Principles
- No login
- No scraping
- No bank credentials
- No cloud processing
- Offline-first
- Privacy-first

## Import Flow
Payment App / Bank Statement / CSV / Excel / PDF (future)
→ Import Wizard
→ Auto Detect Format
→ Auto Detect Columns
→ Merchant Recognition
→ Duplicate Detection
→ Bulk Categorization
→ Review
→ Import into IndexedDB

## Supported Sources

### India
- Google Pay exports (where available)
- PhonePe
- Paytm
- CRED
- Amazon Pay
- BHIM UPI
- SBI
- HDFC
- ICICI
- Axis
- Kotak
- Generic CSV
- Excel

### Global
- PayPal
- Wise
- Revolut
- Monzo
- N26
- Chase
- American Express
- Visa statement exports
- Apple Wallet exports (where available)
- Generic CSV
- Excel

Future:
- PDF Statements
- Email Receipts
- OCR Imports

## Smart Import Wizard

Instead of requiring a predefined CSV format, WealthDeck automatically detects:
- Date
- Debit
- Credit
- Amount
- Merchant
- Description
- Balance
- Currency
- Account

Users simply confirm the mapping.

## Merchant Recognition

Example:
SWIGGY BANGALORE
→ Merchant: Swiggy
→ Category: Food
→ Confidence: 98%

Unknown merchants prompt the user once and are remembered locally.

## Local Learning Engine
User mappings become reusable rules.
Example:
SWIGGY → Food
UBER → Transport
NETFLIX → Subscription
AMAZON → Shopping

No cloud AI is used.

## Duplicate Detection
Compare:
- Amount
- Merchant
- Date
- Time
- Account

Allow:
- Skip
- Replace
- Import Anyway

## Bulk Categorization
Group identical merchants and allow 'Apply to All'.

## Income Detection
Recognize:
Salary, Refund, Cashback, Interest, Dividend.

## Recurring Detection
Detect recurring merchants such as:
Netflix, Spotify, Electricity, Internet, EMI, SIP
Suggest creating recurring entries.

## Split Assistant
Suggest splitting expensive purchases into multiple categories.

## Receipt Matching
Match imported transactions with scanned receipts using amount, merchant and date.

## Import History
Track:
- Source file
- Imported date
- Total records
- Duplicates
- Errors
- Rollback support

## Export
- JSON
- CSV
- Excel
Future:
- PDF
- Encrypted Backup

## Developer Stack
- Vanilla JavaScript
- IndexedDB
- PapaParse
- SheetJS
- Tesseract.js (future)
- File System Access API
- Web Workers

## Goal
'Bring your financial history from anywhere.'

This should become one of WealthDeck's signature features.
