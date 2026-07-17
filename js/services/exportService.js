import { getDB } from '../db/database.js';

export async function exportDataJSON() {
  const db = getDB();
  const stores = ['accounts', 'categories', 'transactions', 'budgets', 'bills', 'goals', 'settings'];
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

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
      await new Promise(resolve => {
        const txn = db.transaction(storeName, 'readwrite');
        const store = txn.objectStore(storeName);
        store.clear().onsuccess = () => resolve();
      });
      
      const records = data.data[storeName];
      for (const record of records) {
        await new Promise(resolve => {
          const txn = db.transaction(storeName, 'readwrite');
          txn.objectStore(storeName).put(record).onsuccess = () => resolve();
        });
      }
    }
  }
}
