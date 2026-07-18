import { getDB } from '../db/database.js';

export async function getAllCategories() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function seedDefaultCategories() {
  const defaults = [
    // Expenses (16)
    { name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#f87171' },
    { name: 'Transport', type: 'expense', icon: '🚗', color: '#fbbf24' },
    { name: 'Groceries', type: 'expense', icon: '🛒', color: '#34d399' },
    { name: 'Housing', type: 'expense', icon: '🏠', color: '#60a5fa' },
    { name: 'Utilities', type: 'expense', icon: '💡', color: '#a78bfa' },
    { name: 'Entertainment', type: 'expense', icon: '🍿', color: '#f472b6' },
    { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#f87171' },
    { name: 'Health', type: 'expense', icon: '⚕️', color: '#34d399' },
    { name: 'Insurance', type: 'expense', icon: '🛡️', color: '#fbbf24' },
    { name: 'Personal Care', type: 'expense', icon: '💇', color: '#f472b6' },
    { name: 'Education', type: 'expense', icon: '📚', color: '#a78bfa' },
    { name: 'Debt', type: 'expense', icon: '💳', color: '#f87171' },
    { name: 'Gifts', type: 'expense', icon: '🎁', color: '#60a5fa' },
    { name: 'Charity', type: 'expense', icon: '🤝', color: '#34d399' },
    { name: 'Travel', type: 'expense', icon: '✈️', color: '#fbbf24' },
    { name: 'Other Expense', type: 'expense', icon: '📦', color: '#9ca3af' },
    // Income (9)
    { name: 'Salary', type: 'income', icon: '💰', color: '#34d399' },
    { name: 'Freelance', type: 'income', icon: '💻', color: '#60a5fa' },
    { name: 'Investments', type: 'income', icon: '📈', color: '#a78bfa' },
    { name: 'Business', type: 'income', icon: '🏢', color: '#fbbf24' },
    { name: 'Rental', type: 'income', icon: '🏡', color: '#f472b6' },
    { name: 'Gifts Received', type: 'income', icon: '🧧', color: '#f87171' },
    { name: 'Refunds', type: 'income', icon: '↩️', color: '#34d399' },
    { name: 'Grants', type: 'income', icon: '🎓', color: '#60a5fa' },
    { name: 'Other Income', type: 'income', icon: '💵', color: '#9ca3af' }
  ];
  
  const existing = await getAllCategories();
  if (existing.length === 0) {
    for (const cat of defaults) {
      await saveCategory(cat);
    }
  }
}

export async function saveCategory(category) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');
    
    if (!category.id) {
      category.createdAt = new Date();
    }
    
    const request = category.id ? store.put(category) : store.add(category);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCategory(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('categories', 'readwrite').objectStore('categories').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
