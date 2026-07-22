import { getSetting, saveSetting } from '../services/settingsService.js';
import { getCurrency } from '../utils/format.js';
import { isDriveConfigured, initGoogleDrive, signInToDrive, backupToDrive, restoreFromDrive, getLastSyncDate, isDriveSignedIn, signOutFromDrive } from '../services/googleDriveService.js';
import { exportDataJSON, importDataJSON } from '../services/exportService.js';
import { confirmModal } from '../components/modal.js';

export async function render(container) {
  const bioEnabled = await getSetting('wealthdeck_biometric');
  const currentTheme = localStorage.getItem('wealthdeck_theme') || 'dark';
  const currentCurrency = getCurrency();
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
          <option value="system" ${currentTheme === 'system' ? 'selected' : ''}>System Default</option>
          <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="amoled" ${currentTheme === 'amoled' ? 'selected' : ''}>Amoled Dark</option>
          <option value="midnight" ${currentTheme === 'midnight' ? 'selected' : ''}>Midnight Blue</option>
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
          <label class="cursor-pointer relative mod-style-4cb8ce" title="Custom Color">
            <input class="sr-only" type="radio" name="accent" value="custom" ${!accentColors.some(c => c.hex === currentAccent) ? 'checked' : ''}>
            <div class="color-swatch custom-swatch-btn ${!accentColors.some(c => c.hex === currentAccent) ? 'active' : ''}" style="background: ${!accentColors.some(c => c.hex === currentAccent) ? currentAccent : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'};"></div>
            <input class="sr-only mod-style-4fd600" type="color" id="settings-custom-color-input">
          </label>
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
      <div class="field mod-style-668074">
        <div>
          <label class="mod-style-8f2f77">Biometric App Lock</label>
          <div class="mod-style-c0485e">Use FaceID, TouchID, or device PIN to open app</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="biometric-toggle"  ${bioEnabled === 'true' ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    </div>
    
    <div class="card mt-16">
      <div class="section-title">Storage & Data</div>
      <div class="field mod-style-668074">
        <div>
          <label class="mod-style-8f2f77">Local Data Usage</label>
          <div class="mod-style-c0485e" id="storage-usage-text">Calculating...</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-16">
      <div class="section-title">Sync & Backup</div>
      <p class="mod-style-0f62e6" style="margin-bottom:12px; font-size:13px; color:var(--text-secondary);">
        ${getLastSyncDate() ? `<span class="mod-style-228149">Last synced: ${getLastSyncDate().toLocaleDateString()} at ${getLastSyncDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>` : 'Securely backup and restore your financial data to your personal Google Drive.'}
      </p>
      ${isDriveConfigured() ? `
        <div class="mod-style-b4832f" style="display:flex; flex-direction:column; gap:10px; margin-bottom: 24px;">
          ${isDriveSignedIn() ? `
            <button class="btn btn-primary" id="drive-backup-btn">Backup to Drive</button>
            <button class="btn btn--secondary" id="drive-restore-btn">Restore from Drive</button>
            <button class="btn btn-ghost" id="drive-signout-btn" style="color:var(--text-danger);">Sign Out</button>
          ` : `
            <button class="btn btn--secondary" id="drive-signin-btn" style="display:flex; align-items:center; justify-content:center; gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>
          `}
        </div>
      ` : `
        <div class="mod-style-86a849" style="margin-bottom:24px; font-size:12px; color:var(--text-secondary);">
          Google Drive Client ID is missing. Open <code>js/services/googleDriveService.js</code> to configure it.
        </div>
      `}
      
      <div class="section-title">Local Backup</div>
      <div class="mod-style-b4832f" style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn btn--secondary" id="local-export-btn">Export Data (JSON)</button>
        <button class="btn btn--secondary" id="local-import-btn">Import Data (JSON)</button>
        <input type="file" id="local-import-input" accept=".json" style="display:none;">
      </div>
    </div>

    <div class="card mt-16">
      <div class="section-title text-danger">Danger Zone</div>
      <div class="field">
        <div class="mod-style-53463d">
          <label class="text-danger mod-style-8f2f77">Clear All Data</label>
          <div class="mod-style-c0485e">Permanently delete all your local accounts, transactions, and settings</div>
        </div>
        <button class="btn btn--secondary mod-style-73e64d" id="clear-data-btn">Reset App</button>
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
  const customInput = document.getElementById('settings-custom-color-input');
  const customBtn = document.querySelector('.custom-swatch-btn');
  const customRadio = document.querySelector('input[name="accent"][value="custom"]');

  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      let val = e.target.value;
      if (val === 'custom') {
        customInput.click();
        return;
      }

      localStorage.setItem('wealthdeck_accent', val);
      document.documentElement.style.setProperty('--color-primary', val);
      
      // Update UI active states
      document.querySelectorAll('.color-swatch').forEach(sw => {
        sw.classList.remove('active');
        sw.style.borderColor = 'transparent';
        sw.style.transform = 'none';
        sw.style.boxShadow = 'none';
      });
      const activeSwatch = e.target.nextElementSibling;
      activeSwatch.classList.add('active');
      activeSwatch.style.borderColor = 'var(--text-primary)';
      activeSwatch.style.transform = 'scale(1.1)';
      activeSwatch.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      
      import('../components/toast.js').then(m => m.showToast('Accent color updated'));
    });
  });

  if (customInput && customRadio) {
    customInput.addEventListener('input', (e) => {
      const val = e.target.value;
      customBtn.style.background = val;
      customRadio.checked = true;
      localStorage.setItem('wealthdeck_accent', val);
      document.documentElement.style.setProperty('--color-primary', val);
      
      document.querySelectorAll('.color-swatch').forEach(sw => {
        sw.classList.remove('active');
        sw.style.borderColor = 'transparent';
        sw.style.transform = 'none';
        sw.style.boxShadow = 'none';
      });
      customBtn.classList.add('active');
      customBtn.style.borderColor = 'var(--text-primary)';
      customBtn.style.transform = 'scale(1.1)';
      customBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
  }

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
                authenticatorSelection: { 
                  authenticatorAttachment: "platform", 
                  residentKey: "required", 
                  userVerification: "required" 
                },
                timeout: 60000,
                attestation: "none"
              }
            });
          } else {
            console.warn('WebAuthn not supported. Simulating Biometric Lock.');
          }
          
          await saveSetting('wealthdeck_biometric', 'true');
          import('../components/toast.js').then(m => m.showToast('App Lock Enabled'));
        } catch (err) {
          console.error(err);
          e.target.checked = false; // Revert
          import('../components/toast.js').then(m => m.showToast('Failed to enable App Lock. Your device may not support it.', 'error'));
        }
      } else {
        await saveSetting('wealthdeck_biometric', null);
        import('../components/toast.js').then(m => m.showToast('App Lock Disabled'));
      }
    });
  }

  // Sync & Backup Handlers
  const signInBtn = document.getElementById('drive-signin-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      try {
        await signInToDrive();
        render(container);
      } catch (err) {
        console.error('Sign in failed', err);
      }
    });
  }
  
  const backupBtn = document.getElementById('drive-backup-btn');
  if (backupBtn) {
    backupBtn.addEventListener('click', async () => {
      const { showToast } = await import('../components/toast.js');
      backupBtn.textContent = 'Backing up...';
      backupBtn.disabled = true;
      try {
        await backupToDrive();
        render(container); // re-render to update timestamp
      } catch (e) {
        showToast('Backup failed: ' + e.message, 'error');
      }
      backupBtn.textContent = 'Backup to Drive';
      backupBtn.disabled = false;
    });
  }
  
  const restoreBtn = document.getElementById('drive-restore-btn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', async () => {
      const { showToast } = await import('../components/toast.js');
      if (await confirmModal('Restore Backup', 'This will overwrite your current local data. Continue?')) {
        restoreBtn.textContent = 'Restoring...';
        restoreBtn.disabled = true;
        try {
          await restoreFromDrive();
        } catch (e) {
          showToast('Restore failed: ' + e.message, 'error');
          restoreBtn.textContent = 'Restore from Drive';
          restoreBtn.disabled = false;
        }
      }
    });
  }
  
  const signOutBtn = document.getElementById('drive-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      signOutFromDrive();
      render(container);
    });
  }
  
  // Local Backup Handlers
  document.getElementById('local-export-btn').addEventListener('click', async () => {
    try {
      await exportDataJSON();
      const { showToast } = await import('../components/toast.js');
      showToast('Export complete', 'success');
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  });

  document.getElementById('local-import-btn').addEventListener('click', () => {
    document.getElementById('local-import-input').click();
  });

  document.getElementById('local-import-input').addEventListener('change', async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (await confirmModal('Import Data', 'This will merge/overwrite existing data. Continue?')) {
      try {
        await importDataJSON(file);
        const { showToast } = await import('../components/toast.js');
        showToast('Import successful! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        alert('Import failed: ' + err.message);
      }
    }
    e.target.value = ''; // Reset
  });

  document.getElementById('clear-data-btn').addEventListener('click', async () => {
    const { confirmModal } = await import('../components/modal.js');
    if (await confirmModal('Clear All Data?', 'Are you absolutely sure? This will delete all your accounts, transactions, and settings. This cannot be undone.')) {
      localStorage.clear();
      try {
        const { getDB } = await import('../db/database.js');
        const db = getDB();
        if (db) {
          const stores = ['transactions', 'accounts', 'categories', 'budgets', 'bills', 'goals'];
          const tx = db.transaction(stores, 'readwrite');
          stores.forEach(store => {
            try {
              tx.objectStore(store).clear();
            } catch(e) {}
          });
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
  
  // Calculate Storage
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      const usageKB = (estimate.usage / 1024).toFixed(2);
      const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
      const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
      
      const displayStr = estimate.usage > 1024 * 1024 
        ? `${usageMB} MB / ${quotaMB} MB used`
        : `${usageKB} KB / ${quotaMB} MB used`;
        
      const storageEl = document.getElementById('storage-usage-text');
      if (storageEl) storageEl.textContent = displayStr;
    }).catch(err => {
      const storageEl = document.getElementById('storage-usage-text');
      if (storageEl) storageEl.textContent = 'Storage API unavailable';
    });
  } else {
    document.getElementById('storage-usage-text').textContent = 'Storage API unsupported';
  }
}

export function destroy() {
  // Cleanup if needed
}
