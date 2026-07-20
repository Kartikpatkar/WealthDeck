import { restoreFromDrive, backupToDrive, isDriveConfigured, initGoogleDrive } from '../services/googleDriveService.js';

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
        <div class="mod-style-2a8646">
          <img class="mod-style-a0c50f" src="./assets/icon-192.png" alt="WealthDeck">
          <h1 class="mod-style-a02548">Welcome to WealthDeck</h1>
          <p class="mod-style-73ca12">Securely sync your financial data across devices using your own Google Drive. No servers, complete privacy.</p>
          
          <div class="mod-style-269ea7">
            <button class="btn mod-style-1e27b8" type="button"  id="ob-btn-sync">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>
              Continue with Google
            </button>
            <button class="btn btn--secondary mod-style-5ad467" type="button"  id="ob-btn-skip">Skip for now</button>
          </div>
        </div>
      `;
    } else if (currentStep === 2) {
      stepContent = `
        <div class="mod-style-c19f7f">
          <h2 class="mod-style-9cc6e2">Your Profile</h2>
          <p class="mod-style-35042d">Let's set up the basics.</p>
        </div>
        <form id="onboarding-form-2">
          <div class="field mod-style-dc2cb2">
            <label class="mod-style-6766fb">What should we call you?</label>
            <input class="input mod-style-5bf267" type="text" id="ob-name"  placeholder="Your name" required>
          </div>
          <div class="field mod-style-91e2ae">
            <label class="mod-style-6766fb">Primary Currency</label>
            <select class="input mod-style-5bf267" id="ob-currency"  required>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <button class="btn mod-style-77eabe" type="submit">Next</button>
        </form>
      `;
    } else if (currentStep === 3) {
      stepContent = `
        <div class="mod-style-c19f7f">
          <h2 class="mod-style-9cc6e2">Personalize</h2>
          <p class="mod-style-35042d">Make WealthDeck yours.</p>
        </div>
        <form id="onboarding-form-3">
          <div class="field mod-style-dc2cb2">
            <label class="mod-style-03f9f4">Theme</label>
            <select class="input mod-style-5bf267" id="ob-theme">
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div class="field mod-style-138f8f">
            <label class="mod-style-03f9f4">Accent Color</label>
            <div class="mod-style-e75308">
              ${accentColors.map((c, i) => `
                <label class="mod-style-1034c1">
                  <input class="mod-style-628c86" type="radio" name="accent" value="${c.hex}" ${i === 0 ? 'checked' : ''}>
                  <div class="color-swatch color-swatch-lg" style="background: ${c.hex};"></div>
                </label>
              `).join('')}
              <label class="mod-style-1034c1" title="Custom Color">
                <input class="mod-style-628c86" type="radio" name="accent" value="custom">
                <div class="color-swatch custom-swatch-btn mod-style-2bf4ef"></div>
                <input class="mod-style-2a85bc" type="color" id="ob-custom-color-input">
              </label>
            </div>
          </div>
          <div class="field mod-style-ee3c34">
            <div>
              <label class="mod-style-135cbc">Biometric App Lock</label>
              <div class="mod-style-d464c9">Use FaceID, TouchID, or PIN to open app</div>
            </div>
            <label class="switch mod-style-2b10cb">
              <input class="mod-style-5e19e2" type="checkbox" id="ob-biometric-toggle">
              <span class="slider mod-style-2bc522"></span>
            </label>
          </div>
          <button class="btn mod-style-77eabe" type="submit"  id="ob-btn-finish">Finish Setup</button>
        </form>
      `;
    }

    container.innerHTML = `
      <div class="mod-style-6805bc">
        ${stepContent}
      </div>
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
        try {
          await initGoogleDrive();
          const restored = await restoreFromDrive();
          if (restored) {
            // restoreFromDrive automatically reloads on success
          } else {
            // No backup found or failed
            wantsDriveSync = true;
            currentStep = 2;
            drawStep();
          }
        } catch (err) {
          console.error(err);
          alert('Failed to connect to Google Drive.');
          btnSync.innerHTML = 'Continue with Google';
          btnSync.disabled = false;
        }
      });
      
      btnSkip.addEventListener('click', () => {
        wantsDriveSync = false;
        currentStep = 2;
        drawStep();
      });
    } else if (currentStep === 2) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      let guessed = 'USD';
      if (tz.includes('Kolkata') || tz.includes('India')) guessed = 'INR';
      else if (tz.includes('Europe/London')) guessed = 'GBP';
      else if (tz.includes('Europe/')) guessed = 'EUR';
      else if (tz.includes('Australia/')) guessed = 'AUD';
      
      const currSelect = document.getElementById('ob-currency');
      if (currSelect) currSelect.value = guessed;

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
        const selectedAccent = document.querySelector('input[name="accent"]:checked').value;
        const finalAccent = selectedAccent === 'custom' ? customInput.value : selectedAccent;
        localStorage.setItem('wealthdeck_accent', finalAccent);
        localStorage.setItem('wealthdeck_theme', document.getElementById('ob-theme').value);
        
        const btnFinish = document.getElementById('ob-btn-finish');
        btnFinish.innerHTML = 'Saving...';
        btnFinish.disabled = true;

        if (document.getElementById('ob-biometric-toggle').checked) {
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
                  user: { id: userId, name: "user@wealthdeck.local", displayName: "WealthDeck User" },
                  pubKeyCredParams: [{type: "public-key", alg: -7}, {type: "public-key", alg: -257}],
                  authenticatorSelection: { userVerification: "required" },
                  timeout: 60000,
                  attestation: "none"
                }
              });
            } else {
              console.warn('WebAuthn not supported. Simulating App Lock.');
            }
            localStorage.setItem('wealthdeck_biometric', 'true');
          } catch (err) {
            console.error(err);
            localStorage.removeItem('wealthdeck_biometric');
          }
        }
        
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
