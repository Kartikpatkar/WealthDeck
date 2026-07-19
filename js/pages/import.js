import { parseCSV, detectColumns, processTransactions, getMerchantRule, isDuplicateTransaction } from '../services/importService.js';
import { getAllAccounts } from '../services/accountService.js';
import { saveTransaction } from '../services/transactionService.js';
import { getAllCategories, seedDefaultCategories } from '../services/categoryService.js';
import { formatCurrency } from '../utils/format.js';
import { showToast } from '../components/toast.js';

export async function render(container, params = {}) {
  
  container.innerHTML = `
    <h1>Smart Import Wizard</h1>
    <p>Upload CSV statements to automatically categorize and import transactions.</p>
    
    <div class="card" style="margin-top: var(--spacing-lg);">
      <label for="csv-file" class="btn btn--secondary" style="display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; margin-bottom:12px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span id="csv-file-name">Select CSV File</span>
      </label>
      <input type="file" id="csv-file" accept=".csv" style="display:none;">
      <button id="parse-btn" class="btn btn--primary" style="width:100%;">Analyze</button>
    </div>

    <div id="import-wizard" style="display:none; margin-top: var(--spacing-lg);">
      <div class="card">
        <h3>Step 1: Confirm Columns</h3>
        <div id="mapping-fields" style="display:flex; gap: var(--spacing-sm); margin: var(--spacing-md) 0;"></div>
        
        <h3>Step 2: Target Account</h3>
        <select id="target-account" class="input" style="margin-bottom: var(--spacing-md);"></select>
        <br>
        
        <button id="process-btn" class="btn btn--primary">Preview Transactions</button>
      </div>
    </div>
    
    <div id="import-preview" style="display:none; margin-top: var(--spacing-lg);">
      <div class="card">
        <h3>Step 3: Review & Import</h3>
        <div id="preview-list" style="margin: var(--spacing-md) 0; max-height: 400px; overflow-y: auto;"></div>
        <button id="confirm-import-btn" class="btn btn--primary" style="width:100%;">Import Selected</button>
      </div>
    </div>
  `;

  let rawData = [];
  let processedData = [];

  document.getElementById('csv-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('csv-file-name').textContent = file.name;
    }
  });

  document.getElementById('parse-btn').addEventListener('click', async () => {
    const file = document.getElementById('csv-file').files[0];
    if (!file) return showToast('Please select a CSV file', 'error');
    
    try {
      rawData = await parseCSV(file);
      const mapping = await detectColumns(rawData);
      
      const headers = Object.keys(rawData[0]);
      const selectHtml = (id, selected) => `
        <div>
          <label>${id}</label><br>
          <select id="map-${id}" class="input">
            ${headers.map(h => `<option value="${h}" ${h===selected?'selected':''}>${h}</option>`).join('')}
          </select>
        </div>
      `;
      
      document.getElementById('mapping-fields').innerHTML = 
        selectHtml('date', mapping.date) + 
        selectHtml('amount', mapping.amount) + 
        selectHtml('merchant', mapping.merchant);
        
      const accounts = await getAllAccounts();
      document.getElementById('target-account').innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      
      document.getElementById('import-wizard').style.display = 'block';
    } catch (e) {
      showToast('Error parsing CSV: ' + e.message, 'error');
    }
  });

  document.getElementById('process-btn').addEventListener('click', async () => {
    const mapping = {
      date: document.getElementById('map-date').value,
      amount: document.getElementById('map-amount').value,
      merchant: document.getElementById('map-merchant').value
    };
    
    processedData = await processTransactions(rawData, mapping);
    
    const previewHtml = processedData.slice(0, 50).map((t, i) => `
      <div style="display:flex; justify-content:space-between; padding:var(--spacing-sm) 0; border-bottom:1px solid var(--border-light);">
        <div>
          <strong>${t.merchant}</strong><br>
          <small>${new Date(t.date).toLocaleDateString()}</small>
        </div>
        <div class="mono" style="color: ${t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}">
          ${formatCurrency(t.amount * 100)}
        </div>
      </div>
    `).join('');
    
    document.getElementById('preview-list').innerHTML = previewHtml + (processedData.length > 50 ? '<p>...and more</p>' : '');
    document.getElementById('import-preview').style.display = 'block';
  });

  document.getElementById('confirm-import-btn').addEventListener('click', async () => {
    await seedDefaultCategories();
    const categories = await getAllCategories();
    const defaultCatId = categories[0]?.id;
    const accountId = Number(document.getElementById('target-account').value);
    
    let count = 0;
    for (const t of processedData) {
      if (!t.amount || isNaN(new Date(t.date).getTime())) continue; // Skip invalid
      
      const rule = await getMerchantRule(t.merchant);
      const merchantName = rule ? rule.merchantName : t.merchant;
      
      const isDup = await isDuplicateTransaction({ ...t, merchant: merchantName });
      if (isDup) continue;
      
      const catId = rule ? rule.categoryId : defaultCatId;
      
      await saveTransaction({
        type: t.type,
        amount: t.amount,
        merchant: rule ? rule.merchantName : t.merchant,
        date: t.date,
        accountId: accountId,
        categoryId: catId,
        importSource: 'csv'
      });
      count++;
    }
    
    showToast(`Successfully imported ${count} transactions!`, 'success');
    window.location.hash = '#/transactions';
  });
}
export function destroy() {}
