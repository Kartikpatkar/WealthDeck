export async function renderGoals() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1>Savings Goals</h1>
    <p>Visual progress tracking for savings goals.</p>
    <div class="card" style="margin-top: var(--spacing-md);">
      <h3>Emergency Fund</h3>
      <div style="display: flex; justify-content: space-between; margin: var(--spacing-sm) 0;">
        <span>$2,500</span>
        <span>Target: $10,000</span>
      </div>
      <div style="background: var(--bg-primary); border-radius: 4px; height: 12px; overflow: hidden;">
        <div style="width: 25%; height: 100%; background: var(--color-primary);"></div>
      </div>
    </div>
  `;
}
