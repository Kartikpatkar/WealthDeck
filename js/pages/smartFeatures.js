import { getAllTransactions } from '../services/transactionService.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export async function renderTimeline(container, params = {}) {
  try {
    const txns = await getAllTransactions();
    // Sort oldest first for timeline
    const sorted = [...txns].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    let html = '';
    if (sorted.length > 0) {
      const firstTxn = sorted[0];
      const largeTxns = sorted.filter(t => t.amount > 1000000); // > 10,000 base units (100.00 if usd)
      
      html += `
        <div class="mod-style-504b4d">
          <div class="mod-style-f7b6e1"></div>
          <h3>WealthDeck Journey Began</h3>
          <p class="mod-style-83ba7c">${formatDate(firstTxn.date)}</p>
        </div>
      `;
      
      largeTxns.forEach(txn => {
        html += `
          <div class="mod-style-504b4d">
            <div class="mod-style-a9a858"></div>
            <h3>Large Transaction</h3>
            <p class="mod-style-83ba7c">${formatCurrency(txn.amount)} at ${txn.merchant || 'Unknown'} on ${formatDate(txn.date)}</p>
          </div>
        `;
      });
      
      if (largeTxns.length === 0 && sorted.length > 0) {
        html += `
          <div class="mod-style-504b4d">
            <div class="mod-style-a9a858"></div>
            <h3>Steady Savers</h3>
            <p class="mod-style-83ba7c">No unusually large transactions yet. Keep it up!</p>
          </div>
        `;
      }
    } else {
      html = '<p>No data to build timeline yet.</p>';
    }

    container.innerHTML = `
      <h1>Financial Timeline</h1>
      <p class="mod-style-35042d">Your financial life as a continuous story.</p>
      
      <div class="mod-style-a06e75">
        ${html}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

export async function renderMonthlyReplay(container, params = {}) {
  try {
    const txns = await getAllTransactions();
    const now = new Date();
    const thisMonth = txns.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear() && t.type === 'expense');
    
    let topMerchant = { name: 'None', amount: 0, count: 0 };
    if (thisMonth.length > 0) {
      const merchantSums = {};
      thisMonth.forEach(t => {
        if (!merchantSums[t.merchant]) merchantSums[t.merchant] = { amount: 0, count: 0 };
        merchantSums[t.merchant].amount += t.amount;
        merchantSums[t.merchant].count++;
      });
      const sortedM = Object.entries(merchantSums).sort((a,b) => b[1].amount - a[1].amount);
      topMerchant = { name: sortedM[0][0], ...sortedM[0][1] };
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    container.innerHTML = `
      <div class="mod-style-cf36a7">
        <h1 class="mod-style-e91824">${monthNames[now.getMonth()]} Replay</h1>
        <p class="mod-style-b2c4ed">Let's see how you did this month.</p>
        
        <div class="card mod-style-fac2b8">
          <h3>Top Merchant</h3>
          <h2 class="mono mod-style-3ac970">${topMerchant.name}</h2>
          <p>You spent <strong>${formatCurrency(topMerchant.amount)}</strong> here in ${topMerchant.count} orders.</p>
        </div>
        
        <button class="btn btn--primary mod-style-e114b4" id="next-slide-btn">Play Next Slide</button>
      </div>
    `;
    
    document.getElementById('next-slide-btn').addEventListener('click', () => {
      import('../components/toast.js').then(m => m.showToast('More slides coming soon!', 'info'));
    });
  } catch (err) {
    container.innerHTML = `<p>Error</p>`;
  }
}

export async function renderAnalyzers(container, params = {}) {
  try {
    const txns = await getAllTransactions();
    const today = new Date().toISOString().split('T')[0];
    
    // No spend challenge logic
    const todayExpenses = txns.filter(t => t.type === 'expense' && t.date === today);
    const hasSpentToday = todayExpenses.length > 0;
    
    // Subscriptions mock logic (find recurring names)
    const merchants = txns.filter(t => t.type === 'expense').map(t => t.merchant);
    const subCount = new Set(merchants.filter(m => m.toLowerCase().includes('netflix') || m.toLowerCase().includes('spotify'))).size || 1;

    container.innerHTML = `
      <h1>Analyzers & Challenges</h1>
      
      <div class="card mod-style-af5efe">
        <h3>⚠️ Oops Detector</h3>
        <p class="mod-style-35042d">Your transactions are being analyzed for unusual patterns.</p>
      </div>
      
      <div class="card mod-style-537d0f">
        <h3>🎯 No Spend Challenge</h3>
        <p class="mod-style-35042d">Status: <strong>${hasSpentToday ? 'Broken 😢' : 'On Track 🚀'}</strong></p>
        <div class="mod-style-11e612">
          <div style="width: ${hasSpentToday ? 0 : 28}%; height: 100%; background: var(--color-primary);"></div>
        </div>
        <p class="mod-style-4b0946">Goal: 7 Days without unnecessary spending</p>
      </div>
      
      <div class="card mod-style-f9cf13">
        <h3>🔄 Subscription Analyzer</h3>
        <p class="mod-style-35042d">We detected ${subCount} possible subscriptions. Review them to save money!</p>
      </div>
    `;
  } catch(e) {
    console.error(e);
  }
}
