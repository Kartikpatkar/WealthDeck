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
      const largestTxn = [...sorted].sort((a,b) => b.amount - a.amount)[0];
      
      html += `
        <div style="margin-bottom: var(--spacing-md); position: relative;">
          <div style="position: absolute; left: -25px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-primary);"></div>
          <h3>WealthDeck Journey Began</h3>
          <p style="color: var(--text-secondary); font-size: 0.9em;">${formatDate(firstTxn.date)}</p>
        </div>
        <div style="margin-bottom: var(--spacing-md); position: relative;">
          <div style="position: absolute; left: -25px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg-surface); border: 2px solid var(--color-primary);"></div>
          <h3>Largest Transaction</h3>
          <p style="color: var(--text-secondary); font-size: 0.9em;">${formatCurrency(largestTxn.amount)} at ${largestTxn.merchant} on ${formatDate(largestTxn.date)}</p>
        </div>
      `;
    } else {
      html = '<p>No data to build timeline yet.</p>';
    }

    container.innerHTML = `
      <h1>Financial Timeline</h1>
      <p style="color: var(--text-secondary);">Your financial life as a continuous story.</p>
      
      <div style="margin-top: var(--spacing-lg); border-left: 2px solid var(--color-primary); padding-left: var(--spacing-md);">
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
      <div style="text-align: center; margin-top: 10vh;">
        <h1 style="font-size: 3em; background: linear-gradient(to right, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; color: transparent;">${monthNames[now.getMonth()]} Replay</h1>
        <p style="font-size: 1.2em; color: var(--text-secondary); margin: var(--spacing-md) 0;">Let's see how you did this month.</p>
        
        <div class="card" style="margin: var(--spacing-lg) auto; max-width: 400px; padding: var(--spacing-lg);">
          <h3>Top Merchant</h3>
          <h2 class="mono" style="color: var(--color-primary); font-size: 2em; margin: var(--spacing-sm) 0;">${topMerchant.name}</h2>
          <p>You spent <strong>${formatCurrency(topMerchant.amount)}</strong> here in ${topMerchant.count} orders.</p>
        </div>
        
        <button class="btn btn--primary" style="font-size: 1.1em; padding: var(--spacing-sm) var(--spacing-lg);">Play Next Slide</button>
      </div>
    `;
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
      
      <div class="card" style="margin-top: var(--spacing-lg); border-left: 4px solid var(--color-warning);">
        <h3>⚠️ Oops Detector</h3>
        <p style="color: var(--text-secondary);">Your transactions are being analyzed for unusual patterns.</p>
      </div>
      
      <div class="card" style="margin-top: var(--spacing-md); border-left: 4px solid var(--color-primary);">
        <h3>🎯 No Spend Challenge</h3>
        <p style="color: var(--text-secondary);">Status: <strong>${hasSpentToday ? 'Broken 😢' : 'On Track 🚀'}</strong></p>
        <div style="background: var(--bg-primary); border-radius: 4px; height: 8px; margin-top: 8px;">
          <div style="width: ${hasSpentToday ? 0 : 28}%; height: 100%; background: var(--color-primary);"></div>
        </div>
        <p style="font-size: 0.8em; margin-top: var(--spacing-xs); color: var(--text-secondary);">Goal: 7 Days without unnecessary spending</p>
      </div>
      
      <div class="card" style="margin-top: var(--spacing-md); border-left: 4px solid var(--color-accent);">
        <h3>🔄 Subscription Analyzer</h3>
        <p style="color: var(--text-secondary);">We detected ${subCount} possible subscriptions. Review them to save money!</p>
      </div>
    `;
  } catch(e) {
    console.error(e);
  }
}
