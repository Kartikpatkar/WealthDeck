export async function render(container) {
  const currentTheme = localStorage.getItem('wealthdeck_theme') || 'dark';
  const currentCurrency = localStorage.getItem('wealthdeck_currency') || 'USD';
  
  container.innerHTML = `
    <header class="page-header">
      <h1 class="page-header__title">Settings</h1>
    </header>
    
    <div class="card" style="margin-top: var(--spacing-lg);">
      <h2 style="margin-bottom: var(--spacing-md); font-size: 1.1rem;">Appearance</h2>
      <div class="form-group" style="margin-bottom: var(--spacing-md);">
        <label class="form-label" for="theme-select">Theme</label>
        <select class="form-input" id="theme-select">
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
        </select>
      </div>
    </div>
    
    <div class="card" style="margin-top: var(--spacing-md);">
      <h2 style="margin-bottom: var(--spacing-md); font-size: 1.1rem;">Preferences</h2>
      <div class="form-group" style="margin-bottom: var(--spacing-md);">
        <label class="form-label" for="currency-select">Currency</label>
        <select class="form-input" id="currency-select">
          <option value="USD" ${currentCurrency === 'USD' ? 'selected' : ''}>USD ($)</option>
          <option value="EUR" ${currentCurrency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
          <option value="GBP" ${currentCurrency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
          <option value="INR" ${currentCurrency === 'INR' ? 'selected' : ''}>INR (₹)</option>
          <option value="AUD" ${currentCurrency === 'AUD' ? 'selected' : ''}>AUD (A$)</option>
          <option value="CAD" ${currentCurrency === 'CAD' ? 'selected' : ''}>CAD (C$)</option>
          <option value="JPY" ${currentCurrency === 'JPY' ? 'selected' : ''}>JPY (¥)</option>
        </select>
      </div>
    </div>
  `;
  
  document.getElementById('theme-select').addEventListener('change', (e) => {
    const val = e.target.value;
    localStorage.setItem('wealthdeck_theme', val);
    document.documentElement.setAttribute('data-theme', val);
    import('../components/toast.js').then(m => m.showToast('Theme updated'));
  });
  
  document.getElementById('currency-select').addEventListener('change', (e) => {
    const val = e.target.value;
    localStorage.setItem('wealthdeck_currency', val);
    import('../components/toast.js').then(m => m.showToast('Currency updated. Note: You may need to refresh to see all changes.'));
  });
}

export function destroy() {
  // Cleanup if needed
}
