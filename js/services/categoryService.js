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
    { name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#f87171' },
    { name: 'Transport', type: 'expense', icon: '🚗', color: '#fbbf24' },
    { name: 'Salary', type: 'income', icon: '💰', color: '#34d399' }
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
