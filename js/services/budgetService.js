import { getDB } from '../db/database.js';

export async function getAllBudgets() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('budgets', 'readonly').objectStore('budgets').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
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
