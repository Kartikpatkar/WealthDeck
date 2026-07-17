import { getDB } from '../db/database.js';

export async function getAllBills() {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('bills', 'readonly').objectStore('bills').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBill(bill) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    bill.updatedAt = new Date();
    if (!bill.id) bill.createdAt = new Date();
    const request = bill.id ? 
      db.transaction('bills', 'readwrite').objectStore('bills').put(bill) : 
      db.transaction('bills', 'readwrite').objectStore('bills').add(bill);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
