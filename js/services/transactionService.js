import { getDB } from '../db/database.js';

export async function getAllTransactions() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();
    request.onsuccess = () => {
      const sorted = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

function updateAccountBalance(t, accountId, change) {
  if (!accountId || change === 0) return;
  const store = t.objectStore('accounts');
  store.get(Number(accountId)).onsuccess = (e) => {
    const acc = e.target.result;
    if (acc) {
      acc.balance = (acc.balance || 0) + change;
      store.put(acc);
    }
  };
}

function applyTxnEffect(t, txn, multiplier) {
  if (txn.type === 'expense') {
    updateAccountBalance(t, txn.accountId, -txn.amount * multiplier);
  } else if (txn.type === 'income') {
    updateAccountBalance(t, txn.accountId, txn.amount * multiplier);
  } else if (txn.type === 'transfer') {
    updateAccountBalance(t, txn.accountId, -txn.amount * multiplier);
    updateAccountBalance(t, txn.toAccountId, txn.amount * multiplier);
  }
}

export async function saveTransaction(txn) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    txn.amount = Math.round(parseFloat(txn.amount) * 100) || 0;
    txn.updatedAt = new Date().toISOString();
    if (!txn.id) txn.createdAt = txn.updatedAt;
    
    if (txn.tags === undefined) txn.tags = [];
    if (txn.isRecurring === undefined) txn.isRecurring = false;
    
    const t = db.transaction(['transactions', 'accounts'], 'readwrite');
    const txnStore = t.objectStore('transactions');
    
    const finishSave = (oldTxn) => {
      if (oldTxn) applyTxnEffect(t, oldTxn, -1);
      applyTxnEffect(t, txn, 1);
      
      const request = txn.id ? txnStore.put(txn) : txnStore.add(txn);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };

    if (txn.id) {
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
    const t = db.transaction(['transactions', 'accounts'], 'readwrite');
    const txnStore = t.objectStore('transactions');
    
    txnStore.get(id).onsuccess = (e) => {
      const oldTxn = e.target.result;
      if (oldTxn) {
        applyTxnEffect(t, oldTxn, -1);
        const req = txnStore.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } else {
        resolve();
      }
    };
    t.onerror = () => reject(t.error);
  });
}
