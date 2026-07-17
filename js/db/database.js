const DB_NAME = 'wealthdeck';
const DB_VERSION = 2;

let dbInstance = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores based on Data Models spec
      if (!db.objectStoreNames.contains('accounts')) {
        const store = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('categories')) {
        const store = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('accountId', 'accountId', { unique: false });
        store.createIndex('categoryId', 'categoryId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('budgets')) {
        const store = db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
        store.createIndex('categoryId', 'categoryId', { unique: false });
        store.createIndex('month', 'month', { unique: false });
      }

      if (!db.objectStoreNames.contains('bills')) {
        const store = db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
        store.createIndex('nextDueDate', 'nextDueDate', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
      }

      if (!db.objectStoreNames.contains('goals')) {
        const store = db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
        store.createIndex('targetDate', 'targetDate', { unique: false });
        store.createIndex('isCompleted', 'isCompleted', { unique: false });
      }

      // Add Phase 4 stores now to avoid another migration later
      if (!db.objectStoreNames.contains('merchantRules')) {
        const store = db.createObjectStore('merchantRules', { keyPath: 'id', autoIncrement: true });
        store.createIndex('pattern', 'pattern', { unique: false });
      }

      if (!db.objectStoreNames.contains('importHistory')) {
        db.createObjectStore('importHistory', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('receipts')) {
        const store = db.createObjectStore('receipts', { keyPath: 'id', autoIncrement: true });
        store.createIndex('transactionId', 'transactionId', { unique: false });
      }
    };
  });
}

export function getDB() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDB first.');
  }
  return dbInstance;
}
