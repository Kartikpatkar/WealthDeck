import { getDB } from '../db/database.js';

export async function getAllGoals() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('goals', 'readonly').objectStore('goals').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGoal(goal) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    // Convert to cents
    goal.targetAmount = Math.round(parseFloat(goal.targetAmount) * 100) || 0;
    goal.savedAmount = Math.round(parseFloat(goal.savedAmount) * 100) || 0;
    
    goal.updatedAt = new Date().toISOString();
    if (!goal.id) goal.createdAt = goal.updatedAt;
    
    const request = goal.id ? 
      db.transaction('goals', 'readwrite').objectStore('goals').put(goal) : 
      db.transaction('goals', 'readwrite').objectStore('goals').add(goal);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
