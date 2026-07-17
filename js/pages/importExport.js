import { exportDataJSON, importDataJSON } from '../services/exportService.js';
import { showToast } from '../components/toast.js';

export async function renderImportExport() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h1>Import & Export</h1>
    
    <div class="card" style="margin-top: var(--spacing-lg);">
      <h2>Backup Data</h2>
      <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">Download your full database to a JSON file. Keep it safe.</p>
      <button id="export-json-btn" class="btn btn--primary">Download JSON Backup</button>
    </div>

    <div class="card" style="margin-top: var(--spacing-lg);">
      <h2>Restore Data</h2>
      <p style="color: var(--color-expense); margin-bottom: var(--spacing-md);">Warning: Restoring will overwrite all current local data.</p>
      <input type="file" id="import-json-file" accept=".json" style="margin-bottom: var(--spacing-md);">
      <br>
      <button id="import-json-btn" class="btn btn--primary">Restore from File</button>
    </div>
  `;

  document.getElementById('export-json-btn').addEventListener('click', async () => {
    try {
      await exportDataJSON();
      showToast('Export complete', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  });

  document.getElementById('import-json-btn').addEventListener('click', async () => {
    const file = document.getElementById('import-json-file').files[0];
    if (!file) return showToast('Select a file first', 'error');
    
    if (!confirm('Are you sure? This will delete current data.')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await importDataJSON(e.target.result);
        showToast('Restore successful! App will reload.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast('Restore failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });
}
