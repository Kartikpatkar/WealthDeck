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

export async function seedDefaultAccount() {
  const existing = await getAllAccounts();
  if (existing.length === 0) {
    await saveAccount({
      name: 'Cash Wallet',
      type: 'cash',
      balance: 0,
      currency: 'USD',
      color: '#34d399',
      icon: '💵',
      isArchived: false,
      isDefault: true
    });
  }
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
    
    // If setting as default, we must unset others
    if (account.isDefault) {
      store.getAll().onsuccess = (e) => {
        const all = e.target.result;
        all.forEach(acc => {
          if (acc.id !== account.id && acc.isDefault) {
            acc.isDefault = false;
            store.put(acc);
          }
        });
      };
    }
    
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
