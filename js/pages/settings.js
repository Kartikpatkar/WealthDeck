export async function render(container) {
  const currentTheme = localStorage.getItem('wealthdeck_theme') || 'dark';
  const currentCurrency = localStorage.getItem('wealthdeck_currency') || 'USD';
  const currentName = localStorage.getItem('wealthdeck_name') || '';
  const currentAccent = localStorage.getItem('wealthdeck_accent') || '#6366f1';
  
  const accentColors = [
    { id: 'indigo', hex: '#6366f1', name: 'Indigo' },
    { id: 'emerald', hex: '#10b981', name: 'Emerald' },
    { id: 'rose', hex: '#f43f5e', name: 'Rose' },
    { id: 'amber', hex: '#f59e0b', name: 'Amber' },
    { id: 'sky', hex: '#0ea5e9', name: 'Sky' }
  ];

  container.innerHTML = `
    <div class="page-head"><h2>Settings</h2></div>
    
    <div class="card mt-16">
      <div class="section-title">Profile</div>
      <div class="field">
        <label>Your Name</label>
        <input type="text" id="name-input" class="input" value="${currentName}" placeholder="Enter your name">
      </div>
    </div>
    
    <div class="card mt-16">
      <div class="section-title">Appearance</div>
      <div class="field">
        <label>Theme</label>
        <select id="theme-select">
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
        </select>
      </div>
      
      <div class="field mt-16">
        <label class="mb-8 block">Accent Color</label>
        <div class="d-flex gap-12 flex-wrap" id="accent-picker">
          ${accentColors.map(c => `
            <label class="cursor-pointer relative">
              <input type="radio" name="accent" value="${c.hex}" ${currentAccent === c.hex ? 'checked' : ''} class="sr-only">
              <div class="color-swatch ${currentAccent === c.hex ? 'active' : ''}" style="background: ${c.hex};"></div>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="card mt-16">
      <div class="section-title">Preferences</div>
      <div class="field">
        <label>Currency</label>
        <select id="currency-select">
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
    
    <div class="card mt-16">
      <div class="section-title">Security</div>
      <div class="field" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <label style="margin:0; font-size:15px;">Biometric App Lock</label>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Use FaceID, TouchID, or device PIN to open app</div>
        </div>
        <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 28px;">
          <input type="checkbox" id="biometric-toggle" style="opacity: 0; width: 0; height: 0;" ${localStorage.getItem('wealthdeck_biometric') === 'true' ? 'checked' : ''}>
          <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 34px;"></span>
        </label>
      </div>
    </div>
    
    <div class="card mt-16" style="border-color: #ef444433; background: #ef44440a;">
      <div class="section-title text-danger">Danger Zone</div>
      <div class="field" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <label style="margin:0; font-size:15px;" class="text-danger">Clear All Data</label>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Permanently delete all your local accounts, transactions, and settings</div>
        </div>
        <button id="clear-data-btn" class="btn btn--secondary" style="background: #fee2e2; color: #ef4444; border-color: transparent;">Reset App</button>
      </div>
    </div>
    
    <style>
      .switch input:checked + .slider { background-color: var(--color-primary); }
      .switch .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
      .switch input:checked + .slider:before { transform: translateX(22px); }
    </style>
  `;
  
  // Handlers
  document.getElementById('name-input').addEventListener('change', (e) => {
    localStorage.setItem('wealthdeck_name', e.target.value.trim());
    import('../components/toast.js').then(m => m.showToast('Name updated'));
  });

  document.getElementById('theme-select').addEventListener('change', (e) => {
    const val = e.target.value;
    localStorage.setItem('wealthdeck_theme', val);
    document.documentElement.setAttribute('data-theme', val);
    import('../components/toast.js').then(m => m.showToast('Theme updated'));
  });
  
  document.getElementById('currency-select').addEventListener('change', (e) => {
    const val = e.target.value;
    localStorage.setItem('wealthdeck_currency', val);
    import('../components/toast.js').then(m => m.showToast('Currency updated.'));
  });
  
  const radios = document.querySelectorAll('input[name="accent"]');
  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      const val = e.target.value;
      localStorage.setItem('wealthdeck_accent', val);
      document.documentElement.style.setProperty('--color-primary', val);
      
      // Update UI active states
      document.querySelectorAll('.color-swatch').forEach(sw => {
        sw.style.borderColor = 'transparent';
        sw.style.transform = 'none';
        sw.style.boxShadow = 'none';
      });
      const activeSwatch = e.target.nextElementSibling;
      activeSwatch.style.borderColor = 'var(--text-primary)';
      activeSwatch.style.transform = 'scale(1.1)';
      activeSwatch.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      
      import('../components/toast.js').then(m => m.showToast('Accent color updated'));
    });
  });

  const bioToggle = document.getElementById('biometric-toggle');
  if (bioToggle) {
    bioToggle.addEventListener('change', async (e) => {
      if (e.target.checked) {
        try {
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);
          const userId = new Uint8Array(16);
          crypto.getRandomValues(userId);
          
          await navigator.credentials.create({
            publicKey: {
              challenge: challenge,
              rp: { name: "WealthDeck", id: location.hostname },
              user: {
                id: userId,
                name: "user@wealthdeck.local",
                displayName: "WealthDeck User"
              },
              pubKeyCredParams: [{type: "public-key", alg: -7}, {type: "public-key", alg: -257}],
              authenticatorSelection: { userVerification: "required" },
              timeout: 60000,
              attestation: "none"
            }
          });
          
          localStorage.setItem('wealthdeck_biometric', 'true');
          import('../components/toast.js').then(m => m.showToast('App Lock Enabled'));
        } catch (err) {
          console.error(err);
          e.target.checked = false; // Revert
          import('../components/toast.js').then(m => m.showToast('Failed to enable App Lock. Your device may not support it.', 'error'));
        }
      } else {
        localStorage.removeItem('wealthdeck_biometric');
        import('../components/toast.js').then(m => m.showToast('App Lock Disabled'));
      }
    });
  }

  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    const { confirmModal } = await import('../components/modal.js');
    if (await confirmModal('Clear All Data?', 'Are you absolutely sure? This will delete all your accounts, transactions, and settings. This cannot be undone.')) {
      localStorage.clear();
      window.location.href = '/';
      window.location.reload();
    }
  });
}

export function destroy() {
  // Cleanup if needed
}
