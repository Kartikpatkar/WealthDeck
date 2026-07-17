import { getDB } from '../db/database.js';

export async function getAllBudgets() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('budgets', 'readonly').objectStore('budgets').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getBudgetsWithSpent() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['budgets', 'transactions', 'categories'], 'readonly');
    const budgetsStore = transaction.objectStore('budgets');
    const txnsStore = transaction.objectStore('transactions');
    const catStore = transaction.objectStore('categories');
    
    budgetsStore.getAll().onsuccess = (e) => {
      const budgets = e.target.result;
      txnsStore.getAll().onsuccess = (e2) => {
        const txns = e2.target.result;
        catStore.getAll().onsuccess = (e3) => {
          const cats = e3.target.result;
          const catMap = cats.reduce((acc, c) => ({...acc, [c.id]: c.name}), {});
          
          budgets.forEach(b => {
            b.categoryName = catMap[b.categoryId];
            b.spent = txns
              .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(b.month))
              .reduce((sum, t) => sum + t.amount, 0);
          });
          resolve(budgets);
        };
      };
    };
  });
}

export async function saveBudget(budget) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    budget.updatedAt = new Date();
    if (!budget.id) budget.createdAt = new Date();
    const request = budget.id ? 
      db.transaction('budgets', 'readwrite').objectStore('budgets').put(budget) : 
      db.transaction('budgets', 'readwrite').objectStore('budgets').add(budget);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
