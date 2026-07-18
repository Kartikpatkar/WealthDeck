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
    // Convert to cents
    bill.amount = Math.round(parseFloat(bill.amount) * 100) || 0;
    bill.updatedAt = new Date().toISOString();
    if (!bill.id) bill.createdAt = bill.updatedAt;
    
    const request = bill.id ? 
      db.transaction('bills', 'readwrite').objectStore('bills').put(bill) : 
      db.transaction('bills', 'readwrite').objectStore('bills').add(bill);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteBill(id) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('bills', 'readwrite').objectStore('bills').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
