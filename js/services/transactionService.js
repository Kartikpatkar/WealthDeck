import { getDB } from '../db/database.js';
import { getAccountById, saveAccount } from './accountService.js';

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
  
  // Update account balances
  if (txn.type === 'expense' || txn.type === 'income') {
    const account = await getAccountById(txn.accountId);
    if (account) {
      account.balance = (account.balance || 0) + (txn.type === 'income' ? txn.amount : -txn.amount);
      await saveAccount(account);
    }
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('transactions', 'readwrite');
    const store = transaction.objectStore('transactions');
    
    txn.updatedAt = new Date();
    if (!txn.id) txn.createdAt = new Date();
    
    const request = txn.id ? store.put(txn) : store.add(txn);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
