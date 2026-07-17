export async function renderReports() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1>Reports</h1>
    <p>Advanced filtering and analytics charts.</p>
    <div class="card" style="margin-top: var(--spacing-md); height: 300px; display:flex; align-items:center; justify-content:center; color: var(--text-secondary);">
      Chart visualization area
    </div>
  `;
}
