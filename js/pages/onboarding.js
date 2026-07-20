import { restoreFromDrive, backupToDrive, isDriveConfigured } from '../services/googleDriveService.js';

export async function render(container, params = {}) {
  const accentColors = [
    { id: 'indigo', hex: '#6366f1', name: 'Indigo' },
    { id: 'emerald', hex: '#10b981', name: 'Emerald' },
    { id: 'rose', hex: '#f43f5e', name: 'Rose' },
    { id: 'amber', hex: '#f59e0b', name: 'Amber' },
    { id: 'sky', hex: '#0ea5e9', name: 'Sky' }
  ];
  
  let currentStep = 1;
  let wantsDriveSync = false;
  
  function drawStep() {
    let stepContent = '';
    
    if (currentStep === 1) {
      stepContent = `
        <div style="text-align: center; margin-bottom: 40px;">
          <img src="./assets/icon-192.png" alt="WealthDeck" style="width: 80px; height: 80px; border-radius: 20px; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
          <h1 style="font-size: 28px; margin-bottom: 12px;">Welcome to WealthDeck</h1>
          <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.5; margin-bottom: 32px;">Securely sync your financial data across devices using your own Google Drive. No servers, complete privacy.</p>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <button type="button" class="btn" id="ob-btn-sync" style="padding: 16px; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 12px;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
              Continue with Google
            </button>
            <button type="button" class="btn btn--secondary" id="ob-btn-skip" style="padding: 16px; font-size: 16px; background: transparent; border: none; color: var(--text-secondary);">Skip for now</button>
          </div>
        </div>
      `;
    } else if (currentStep === 2) {
      stepContent = `
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-size: 24px; margin-bottom: 8px;">Your Profile</h2>
          <p style="color: var(--text-secondary);">Let's set up the basics.</p>
        </div>
        <form id="onboarding-form-2">
          <div class="field" style="margin-bottom: 24px;">
            <label style="font-size: 15px; font-weight: 500; margin-bottom: 8px; display: block;">What should we call you?</label>
            <input type="text" id="ob-name" class="input" placeholder="Your name" required style="padding: 14px; font-size: 16px;">
          </div>
          <div class="field" style="margin-bottom: 32px;">
            <label style="font-size: 15px; font-weight: 500; margin-bottom: 8px; display: block;">Primary Currency</label>
            <select id="ob-currency" class="input" required style="padding: 14px; font-size: 16px;">
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <button type="submit" class="btn" style="padding: 16px; font-size: 16px; width: 100%;">Next</button>
        </form>
      `;
    } else if (currentStep === 3) {
      stepContent = `
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-size: 24px; margin-bottom: 8px;">Personalize</h2>
          <p style="color: var(--text-secondary);">Make WealthDeck yours.</p>
        </div>
        <form id="onboarding-form-3">
          <div class="field" style="margin-bottom: 24px;">
            <label style="font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;">Theme</label>
            <select id="ob-theme" class="input" style="padding: 14px; font-size: 16px;">
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div class="field" style="margin-bottom: 40px;">
            <label style="font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;">Accent Color</label>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              ${accentColors.map((c, i) => `
                <label style="cursor: pointer; position: relative;">
                  <input type="radio" name="accent" value="${c.hex}" ${i === 0 ? 'checked' : ''} style="position: absolute; opacity: 0;">
                  <div class="color-swatch" style="width: 48px; height: 48px; border-radius: 50%; background: ${c.hex}; border: 3px solid transparent; transition: 0.2s;"></div>
                </label>
              `).join('')}
              <label style="cursor: pointer; position: relative;" title="Custom Color">
                <input type="radio" name="accent" value="custom" style="position: absolute; opacity: 0;">
                <div class="color-swatch custom-swatch-btn" style="width: 48px; height: 48px; border-radius: 50%; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); border: 3px solid transparent; transition: 0.2s; display: flex; align-items: center; justify-content: center;"></div>
                <input type="color" id="ob-custom-color-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
              </label>
            </div>
          </div>
          <button type="submit" class="btn" id="ob-btn-finish" style="padding: 16px; font-size: 16px; width: 100%;">Finish Setup</button>
        </form>
      `;
    }

    container.innerHTML = `
      <div style="max-width: 400px; margin: 40px auto; padding: 20px;">
        ${stepContent}
      </div>
      <style>
        input[type="radio"]:checked + .color-swatch {
          border-color: var(--text-primary) !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      </style>
    `;
    
    bindEvents();
  }
  
  function bindEvents() {
    if (currentStep === 1) {
      const btnSync = document.getElementById('ob-btn-sync');
      const btnSkip = document.getElementById('ob-btn-skip');
      
      btnSync.addEventListener('click', async () => {
        if (!isDriveConfigured()) {
          alert('Google Drive Client ID is not configured. Falling back to local mode.');
          wantsDriveSync = false;
          currentStep = 2;
          drawStep();
          return;
        }
        
        btnSync.innerHTML = 'Connecting...';
        btnSync.disabled = true;
        const restored = await restoreFromDrive();
        if (restored) {
          // restoreFromDrive automatically reloads on success
        } else {
          // No backup found or failed
          wantsDriveSync = true;
          currentStep = 2;
          drawStep();
        }
      });
      
      btnSkip.addEventListener('click', () => {
        wantsDriveSync = false;
        currentStep = 2;
        drawStep();
      });
    } else if (currentStep === 2) {
      document.getElementById('onboarding-form-2').addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('wealthdeck_name', document.getElementById('ob-name').value);
        localStorage.setItem('wealthdeck_currency', document.getElementById('ob-currency').value);
        currentStep = 3;
        drawStep();
      });
    } else if (currentStep === 3) {
      const radios = document.querySelectorAll('input[name="accent"]');
      const customRadio = document.querySelector('input[name="accent"][value="custom"]');
      const customInput = document.getElementById('ob-custom-color-input');
      const customBtn = document.querySelector('.custom-swatch-btn');

      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          if (e.target.value !== 'custom') {
            document.documentElement.style.setProperty('--color-primary', e.target.value);
          } else {
            customInput.click();
          }
        });
      });
      
      customInput.addEventListener('input', (e) => {
        customRadio.value = e.target.value;
        customBtn.style.background = e.target.value;
        customRadio.checked = true;
        document.documentElement.style.setProperty('--color-primary', e.target.value);
      });
      
      document.getElementById('ob-theme').addEventListener('change', (e) => {
        const theme = e.target.value;
        if (theme !== 'system') {
          document.documentElement.setAttribute('data-theme', theme);
        } else {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
      });
      
      document.getElementById('onboarding-form-3').addEventListener('submit', async (e) => {
        e.preventDefault();
        const finishBtn = document.getElementById('ob-btn-finish');
        finishBtn.innerHTML = 'Saving...';
        finishBtn.disabled = true;
        
        const accent = document.querySelector('input[name="accent"]:checked').value;
        const theme = document.getElementById('ob-theme').value;
        
        localStorage.setItem('wealthdeck_accent', accent);
        localStorage.setItem('wealthdeck_theme', theme);
        
        if (wantsDriveSync) {
          await backupToDrive();
        }
        
        window.location.hash = '#/dashboard';
      });
    }
  }
  
  document.body.classList.add('onboarding-active');
  drawStep();
}

export function destroy() {
  document.body.classList.remove('onboarding-active');
}
