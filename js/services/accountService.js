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
  return new Promise(async (resolve, reject) => {
    // Check if the balance was updated from a UI input (decimal/string) vs from a DB fetch/internal process (already integer/cents)
    // If it's a new account, or if the user edited it (we can't easily tell, so we always convert if it's not a round int).
    // Actually, to be perfectly safe, UI inputs should be parsed. In accounts.js we pass `balance: parseFloat(...)`.
    // Let's assume if it has decimals or is a float, it's dollars, otherwise if it's exact, it's cents.
    // A safer way is to just expect the UI to pass dollars, and we convert. 
    // Wait, if we edit an existing account, the UI passes `parseFloat(document.getElementById('acc-balance').value)`.
    // In `accounts.js`, it populates the input with `((acc.balance || 0) / 100).toFixed(2)`.
    // So `parseFloat` will give us dollars.
    account.balance = Math.round(parseFloat(account.balance) * 100) || 0;
    account.updatedAt = new Date().toISOString();
    if (!account.id) account.createdAt = account.updatedAt;

    const transaction = db.transaction(['accounts'], 'readwrite');
    const store = transaction.objectStore('accounts');
    
    // If setting as default, we must unset others
    if (account.isDefault) {
      const allReq = store.getAll();
      allReq.onsuccess = (e) => {
        const all = e.target.result;
        all.forEach(acc => {
          if (acc.id !== account.id && acc.isDefault) {
            acc.isDefault = false;
            store.put(acc);
          }
        });
        // Now save the current account
        saveCurrent();
      };
      allReq.onerror = () => reject(allReq.error);
    } else {
      saveCurrent();
    }
    
    function saveCurrent() {
      const request = account.id ? store.put(account) : store.add(account);
      request.onsuccess = () => resolve(request.result); // Returns the generated ID
      request.onerror = () => reject(request.error);
    }
  });
}

export async function deleteAccount(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['accounts', 'transactions'], 'readwrite');
    const accStore = transaction.objectStore('accounts');
    const txnStore = transaction.objectStore('transactions');
    
    accStore.delete(Number(id));
    
    // Delete associated transactions
    const request = txnStore.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const txn = cursor.value;
        if (txn.accountId === Number(id) || txn.toAccountId === Number(id)) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
