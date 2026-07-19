export async function render(container, params = {}) {
  const accentColors = [
    { id: 'indigo', hex: '#6366f1', name: 'Indigo' },
    { id: 'emerald', hex: '#10b981', name: 'Emerald' },
    { id: 'rose', hex: '#f43f5e', name: 'Rose' },
    { id: 'amber', hex: '#f59e0b', name: 'Amber' },
    { id: 'sky', hex: '#0ea5e9', name: 'Sky' }
  ];
  
  container.innerHTML = `
    <div style="max-width: 400px; margin: 40px auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, var(--color-primary), #818cf8); border-radius: 18px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="width: 32px; height: 32px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 style="font-size: 28px; margin-bottom: 8px;">Welcome to WealthDeck</h1>
        <p style="color: var(--text-secondary);">Let's personalize your experience.</p>
      </div>
      
      <form id="onboarding-form">
        <div class="field" style="margin-bottom: 24px;">
          <label style="font-size: 15px; font-weight: 500; margin-bottom: 8px; display: block;">What should we call you?</label>
          <input type="text" id="ob-name" class="input" placeholder="Your name" required style="padding: 14px; font-size: 16px;">
        </div>
        
        <div class="field" style="margin-bottom: 32px;">
          <label style="font-size: 15px; font-weight: 500; margin-bottom: 12px; display: block;">Choose your accent color</label>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${accentColors.map((c, i) => `
              <label style="cursor: pointer; position: relative;">
                <input type="radio" name="accent" value="${c.hex}" ${i === 0 ? 'checked' : ''} style="position: absolute; opacity: 0;">
                <div class="color-swatch" style="width: 48px; height: 48px; border-radius: 50%; background: ${c.hex}; border: 3px solid transparent; transition: 0.2s;"></div>
              </label>
            `).join('')}
          </div>
        </div>
        
        <button type="submit" class="btn" style="padding: 16px; font-size: 16px;">Get Started</button>
      </form>
    </div>
    
    <style>
      input[type="radio"]:checked + .color-swatch {
        border-color: var(--text-primary) !important;
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    </style>
  `;
  
  document.body.classList.add('onboarding-active');
  
  // Real-time accent color preview
  const radios = document.querySelectorAll('input[name="accent"]');
  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      document.documentElement.style.setProperty('--color-primary', e.target.value);
    });
  });
  
  document.getElementById('onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ob-name').value;
    const accent = document.querySelector('input[name="accent"]:checked').value;
    
    localStorage.setItem('wealthdeck_name', name);
    localStorage.setItem('wealthdeck_accent', accent);
    
    window.location.hash = '#/dashboard';
  });
}

export function destroy() {
  document.body.classList.remove('onboarding-active');
}
