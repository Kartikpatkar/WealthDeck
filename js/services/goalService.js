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
    goal.updatedAt = new Date();
    if (!goal.id) goal.createdAt = new Date();
    const request = goal.id ? 
      db.transaction('goals', 'readwrite').objectStore('goals').put(goal) : 
      db.transaction('goals', 'readwrite').objectStore('goals').add(goal);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
