export async function renderTimeline() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1>Financial Timeline</h1>
    <p style="color: var(--text-secondary);">Your financial life as a continuous story.</p>
    
    <div style="margin-top: var(--spacing-lg); border-left: 2px solid var(--color-primary); padding-left: var(--spacing-md);">
      <div style="margin-bottom: var(--spacing-md); position: relative;">
        <div style="position: absolute; left: -25px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-primary);"></div>
        <h3>Started New Job</h3>
        <p style="color: var(--text-secondary); font-size: 0.9em;">August 2026</p>
      </div>
      <div style="margin-bottom: var(--spacing-md); position: relative;">
        <div style="position: absolute; left: -25px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg-surface); border: 2px solid var(--color-primary);"></div>
        <h3>Highest Savings Month</h3>
        <p style="color: var(--text-secondary); font-size: 0.9em;">July 2026 - $1,200 saved</p>
      </div>
    </div>
  `;
}

export async function renderMonthlyReplay() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div style="text-align: center; margin-top: 10vh;">
      <h1 style="font-size: 3em; background: linear-gradient(to right, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; color: transparent;">July Replay</h1>
      <p style="font-size: 1.2em; color: var(--text-secondary); margin: var(--spacing-md) 0;">Let's see how you did this month.</p>
      
      <div class="card" style="margin: var(--spacing-lg) auto; max-width: 400px; padding: var(--spacing-lg);">
        <h3>Top Merchant</h3>
        <h2 class="mono" style="color: var(--color-primary); font-size: 2em; margin: var(--spacing-sm) 0;">Swiggy</h2>
        <p>You spent <strong>$140</strong> here in 12 orders.</p>
      </div>
      
      <button class="btn btn--primary" style="font-size: 1.1em; padding: var(--spacing-sm) var(--spacing-lg);">Play Next Slide</button>
    </div>
  `;
}

export async function renderAnalyzers() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1>Analyzers & Challenges</h1>
    
    <div class="card" style="margin-top: var(--spacing-lg); border-left: 4px solid var(--color-warning);">
      <h3>⚠️ Oops Detector</h3>
      <p style="color: var(--text-secondary);">You've ordered coffee 4 days in a row. Skipping tomorrow saves $5!</p>
    </div>
    
    <div class="card" style="margin-top: var(--spacing-md); border-left: 4px solid var(--color-primary);">
      <h3>🎯 No Spend Challenge</h3>
      <p style="color: var(--text-secondary);">Current Streak: <strong>2 Days</strong></p>
      <div style="background: var(--bg-primary); border-radius: 4px; height: 8px; margin-top: 8px;">
        <div style="width: 28%; height: 100%; background: var(--color-primary);"></div>
      </div>
      <p style="font-size: 0.8em; margin-top: var(--spacing-xs); color: var(--text-secondary);">Goal: 7 Days</p>
    </div>
    
    <div class="card" style="margin-top: var(--spacing-md); border-left: 4px solid var(--color-accent);">
      <h3>🔄 Subscription Analyzer</h3>
      <p style="color: var(--text-secondary);">You have 3 active video streaming subs. Cancelling one saves $14/mo ($168/yr).</p>
    </div>
  `;
}
