import { getDB } from '../db/database.js';

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    if (!window.Papa) reject(new Error("PapaParse not loaded"));
    
    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

export async function detectColumns(data) {
  if (!data || data.length === 0) return {};
  
  const headers = Object.keys(data[0]);
  const mapping = {
    date: '', amount: '', merchant: '', type: ''
  };

  // Simple heuristic detection
  headers.forEach(h => {
    const lower = h.toLowerCase();
    if (lower.includes('date')) mapping.date = h;
    else if (lower.includes('amount') || lower.includes('credit') || lower.includes('debit')) mapping.amount = h;
    else if (lower.includes('merchant') || lower.includes('description') || lower.includes('narration') || lower.includes('particulars')) mapping.merchant = h;
    else if (lower.includes('type') || lower.includes('cr/dr')) mapping.type = h;
  });

  return mapping;
}

export async function processTransactions(rawRows, mapping) {
  const processed = rawRows.map(row => {
    let rawAmount = parseFloat(row[mapping.amount]) || 0;
    let type = 'expense';
    
    // Attempt type detection from amounts or separate columns
    if (mapping.type && row[mapping.type]) {
      const typeStr = row[mapping.type].toLowerCase();
      if (typeStr.includes('cr') || typeStr.includes('credit') || typeStr.includes('income')) {
        type = 'income';
      }
    } else if (rawAmount < 0) {
      type = 'expense';
      rawAmount = Math.abs(rawAmount);
    } else if (rawAmount > 0) {
      // If we only have positive amounts and no type col, default to expense for safety
      // A more robust engine would prompt the user.
      type = 'expense'; 
    }

    return {
      date: new Date(row[mapping.date]).toISOString(),
      amount: rawAmount,
      merchant: row[mapping.merchant] || 'Unknown',
      type: type,
      originalRow: row
    };
  });
  
  return processed;
}

export async function getMerchantRule(merchantName) {
  const db = getDB();
  return new Promise(resolve => {
    const request = db.transaction('merchantRules', 'readonly').objectStore('merchantRules').getAll();
    request.onsuccess = (e) => {
      const rules = e.target.result;
      const match = rules.find(r => merchantName.toLowerCase().includes(r.pattern.toLowerCase()));
      resolve(match);
    };
  });
}

export async function saveMerchantRule(rule) {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const store = db.transaction('merchantRules', 'readwrite').objectStore('merchantRules');
    const request = store.add(rule);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
