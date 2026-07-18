import { getDB } from '../db/database.js';

export async function getAllTransactions() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readonly');
    const store = transaction.objectStore('transactions');
    // Using cursor to iterate backwards (newest first) could be done here, 
    // but for now we get all and sort.
    const request = store.getAll();
    request.onsuccess = () => {
      const sorted = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveTransaction(txn) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    // Convert to cents
    txn.amount = Math.round(parseFloat(txn.amount) * 100) || 0;
    txn.updatedAt = new Date().toISOString();
    if (!txn.id) txn.createdAt = txn.updatedAt;
    
    // Default missing fields for robustness
    if (txn.tags === undefined) txn.tags = [];
    if (txn.isRecurring === undefined) txn.isRecurring = false;
    
    const t = db.transaction(['transactions', 'accounts'], 'readwrite');
    const txnStore = t.objectStore('transactions');
    const accountStore = t.objectStore('accounts');
    
    const finishSave = (oldTxn) => {
      // Calculate net change to account balance
      let netChange = 0;
      
      // Reverse old transaction effect if editing
      if (oldTxn && (oldTxn.type === 'expense' || oldTxn.type === 'income')) {
         netChange -= (oldTxn.type === 'income' ? oldTxn.amount : -oldTxn.amount);
      }
      
      // Apply new transaction effect
      if (txn.type === 'expense' || txn.type === 'income') {
         netChange += (txn.type === 'income' ? txn.amount : -txn.amount);
      }
      
      if (netChange !== 0) {
        accountStore.get(Number(txn.accountId)).onsuccess = (e) => {
          const account = e.target.result;
          if (account) {
            account.balance = (account.balance || 0) + netChange;
            accountStore.put(account);
          }
        };
      }
      
      const request = txn.id ? txnStore.put(txn) : txnStore.add(txn);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };

    if (txn.id) {
      // It's an edit, get the old one first
      txnStore.get(txn.id).onsuccess = (e) => finishSave(e.target.result);
    } else {
      txn.createdAt = new Date();
      finishSave(null);
    }
  });
}

export async function deleteTransaction(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('transactions', 'readwrite').objectStore('transactions').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
