import { getDB } from '../db/database.js';

export async function getAllAccounts() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('accounts', 'readonly');
    const store = transaction.objectStore('accounts');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAccountById(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('accounts', 'readonly');
    const store = transaction.objectStore('accounts');
    const request = store.get(Number(id));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAccount(account) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    // Convert to cents
    account.balance = Math.round(parseFloat(account.balance) * 100) || 0;
    account.updatedAt = new Date().toISOString();
    if (!account.id) account.createdAt = account.updatedAt;

    const transaction = db.transaction(['accounts'], 'readwrite');
    const store = transaction.objectStore('accounts');
    
    const request = account.id ? store.put(account) : store.add(account);
    request.onsuccess = () => resolve(request.result); // Returns the generated ID
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAccount(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('accounts', 'readwrite');
    const store = transaction.objectStore('accounts');
    const request = store.delete(Number(id));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
