import { getDB } from '../db/database.js';

export async function getRawExportJSON() {
  const db = getDB();
  const stores = ['accounts', 'categories', 'transactions', 'budgets', 'bills', 'goals', 'settings', 'merchantRules', 'importHistory', 'receipts'];
  const exportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    app: 'WealthDeck',
    data: {}
  };

  for (const storeName of stores) {
    exportData.data[storeName] = await new Promise((resolve) => {
      if (db.objectStoreNames.contains(storeName)) {
         db.transaction(storeName, 'readonly').objectStore(storeName).getAll().onsuccess = (e) => resolve(e.target.result);
      } else {
         resolve([]);
      }
    });
  }
  return JSON.stringify(exportData, null, 2);
}

export async function exportDataJSON() {
  const jsonString = await getRawExportJSON();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wealthdeck_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDataJSON(jsonString) {
  const data = JSON.parse(jsonString);
  if (data.app !== 'WealthDeck') throw new Error('Invalid backup file');
  
  const db = getDB();
  const stores = Object.keys(data.data);
  
  // Wipe and replace strategy for simplicity
  for (const storeName of stores) {
    if (db.objectStoreNames.contains(storeName)) {
      const records = data.data[storeName];
      if (!records || records.length === 0) continue;
      
      await new Promise((resolve, reject) => {
        const txn = db.transaction(storeName, 'readwrite');
        const store = txn.objectStore(storeName);
        
        // Clear existing data
        store.clear();
        
        // Put all records in the same transaction
        for (const record of records) {
          store.put(record);
        }
        
        txn.oncomplete = () => resolve();
        txn.onerror = () => reject(txn.error);
      });
    }
  }
}
