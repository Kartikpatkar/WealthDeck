export async function render(container) {
  document.getElementById('topbar-title').textContent = 'Guide & About';

  container.innerHTML = `
    <div class="page-container" style="padding-bottom: 80px;">
      <div class="card mb-16">
        <h2 class="section-title">App Guide</h2>
        <div style="line-height: 1.6;" class="text-secondary">
          <h3 style="color: var(--text-primary); margin: 16px 0 8px;">1. Privacy Masking</h3>
          <p>Tap the 'eye' icon in the top right corner to instantly hide all your balances. Perfect for when you're checking your finances in public spaces.</p>
          
          <h3 style="color: var(--text-primary); margin: 16px 0 8px;">2. Cloud Sync</h3>
          <p>Head over to 'Settings' or 'Backup & Restore' to connect your Google Drive. WealthDeck only stores data in a hidden app folder that it controls. It cannot read your other personal files.</p>
          
          <h3 style="color: var(--text-primary); margin: 16px 0 8px;">3. Smart CSV Import</h3>
          <p>Under the 'Smart CSV Import' tab, you can drop your bank's CSV. WealthDeck learns your categorization over time. Assign a merchant to a category once, and it remembers forever!</p>
          
          <h3 style="color: var(--text-primary); margin: 16px 0 8px;">4. Offline Mode</h3>
          <p>WealthDeck is a Progressive Web App (PWA). You can 'Install' or 'Add to Home Screen' and use it without any internet connection. It will sync to Drive automatically the next time you connect.</p>
          
          <h3 style="color: var(--text-primary); margin: 16px 0 8px;">5. Monthly Replay</h3>
          <p>Once you log a few months of data, check out the 'Monthly Replay' feature to see an Instagram-style story of your financial habits and top spending categories.</p>
        </div>
      </div>

      <!-- About & Contact -->
      <div class="card" style="text-align:center;margin-top: 15px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">WealthDeck</h2>
        <p class="text-secondary" style="margin-bottom: 16px;">Your personal financial tracker.</p>
        
        <div style="margin-bottom: 24px; font-size: 14px;">
          Created with ❤️ by <span style="font-weight: 700;">Kartik Patkar</span>
        </div>

        <div class="d-flex" style="justify-content:center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
          <a href="https://github.com/Kartikpatkar/WealthDeck" target="_blank" class="btn btn--secondary" style="border-radius:20px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding: 6px 16px; font-size: 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/kartik-patkar" target="_blank" class="btn btn--secondary" style="border-radius:20px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding: 6px 16px; font-size: 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            LinkedIn
          </a>
          <a href="https://www.salesforce.com/trailblazer/kpatkar1" target="_blank" class="btn btn--secondary" style="border-radius:20px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding: 6px 16px; font-size: 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-4.71c.38-1.54 1.74-2.29 3.29-2.29 2.21 0 4 1.79 4 4s-1.79 4-4 4Z"/></svg>
            Trailhead
          </a>
          <a href="mailto:kartikkp.assets@gmail.com" class="btn btn--secondary" style="border-radius:20px; display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding: 6px 16px; font-size: 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Email
          </a>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top: 16px; font-size: 12px; color: var(--text-tertiary);">
          © ${new Date().getFullYear()} Kartik Patkar. WealthDeck is open source.
        </div>
      </div>
    </div>
  `;
}

export function destroy() {
  // Cleanup if needed
}
