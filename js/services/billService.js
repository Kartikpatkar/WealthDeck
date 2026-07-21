import { getDB } from '../db/database.js';
import { saveTransaction } from './transactionService.js';

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

export async function processAutoPayBills() {
  const bills = await getAllBills();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  for (const bill of bills) {
    if (bill.autoPay && bill.nextDueDate <= todayStr) {
      // 1. Create Transaction
      const txn = {
        amount: bill.amount / 100, // saveTransaction expects dollars and converts to cents
        type: 'expense',
        categoryId: bill.categoryId,
        accountId: bill.accountId,
        date: bill.nextDueDate,
        merchant: bill.name,
        notes: 'Auto-paid bill'
      };
      await saveTransaction(txn);
      
      // 2. Advance nextDueDate
      const d = new Date(bill.nextDueDate);
      if (bill.frequency === 'monthly') {
        d.setMonth(d.getMonth() + 1);
      } else if (bill.frequency === 'weekly') {
        d.setDate(d.getDate() + 7);
      } else if (bill.frequency === 'yearly') {
        d.setFullYear(d.getFullYear() + 1);
      }
      
      bill.nextDueDate = d.toISOString().split('T')[0];
      bill.amount = bill.amount / 100; // Because saveBill converts to cents again
      
      // 3. Save updated bill
      await saveBill(bill);
    }
  }
}
