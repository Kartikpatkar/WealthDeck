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
        <input class="input" type="text" id="name-input"  value="${currentName}" placeholder="Enter your name">
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
              <input class="sr-only" type="radio" name="accent" value="${c.hex}" ${currentAccent === c.hex ? 'checked' : ''}>
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
      <div class="field mod-style-948e6d">
        <div>
          <label class="mod-style-e3b1f7">Biometric App Lock</label>
          <div class="mod-style-d464c9">Use FaceID, TouchID, or device PIN to open app</div>
        </div>
        <label class="switch mod-style-2b10cb">
          <input class="mod-style-5e19e2" type="checkbox" id="biometric-toggle"  ${localStorage.getItem('wealthdeck_biometric') === 'true' ? 'checked' : ''}>
          <span class="slider mod-style-2bc522"></span>
        </label>
      </div>
    </div>
    
    <div class="card mt-16 mod-style-8bcdab">
      <div class="section-title text-danger">Danger Zone</div>
      <div class="field mod-style-948e6d">
        <div>
          <label class="mod-style-e3b1f7 text-danger">Clear All Data</label>
          <div class="mod-style-d464c9">Permanently delete all your local accounts, transactions, and settings</div>
        </div>
        <button class="btn btn--secondary mod-style-c61a87" id="clear-data-btn">Reset App</button>
      </div>
    </div>
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
          
          if (window.isSecureContext && navigator.credentials) {
            await navigator.credentials.create({
              publicKey: {
                challenge: challenge,
                rp: { name: "WealthDeck" },
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
          } else {
            console.warn('WebAuthn not supported. Simulating Biometric Lock.');
          }
          
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
      try {
        const { getDB } = await import('../db/database.js');
        const db = getDB();
        if (db) {
          const tx = db.transaction(['transactions', 'accounts'], 'readwrite');
          tx.objectStore('transactions').clear();
          tx.objectStore('accounts').clear();
          tx.oncomplete = () => {
            window.location.href = '/';
            window.location.reload();
          };
          tx.onerror = () => {
            window.location.href = '/';
            window.location.reload();
          }
        } else {
          window.location.href = '/';
          window.location.reload();
        }
      } catch (err) {
        window.location.href = '/';
        window.location.reload();
      }
    }
  });
}

export function destroy() {
  // Cleanup if needed
}
