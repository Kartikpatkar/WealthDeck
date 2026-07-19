import { exportDataJSON, importDataJSON } from '../services/exportService.js';
import { isDriveConfigured, initGoogleDrive, backupToDrive, restoreFromDrive } from '../services/googleDriveService.js';
import { showToast } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';

export async function render(container, params = {}) {
  const driveConfigured = isDriveConfigured();
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
      <h1>Sync & Backup</h1>
    </div>
    
    <div class="card" style="margin-bottom: var(--spacing-lg);">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom: 12px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:24px; height:24px; color:#4285F4;"><path d="M12 2L2 22h20L12 2z"/><path d="M12 2L2 22h10l10-20H12z" opacity="0.3"/></svg>
        <h2 style="margin:0;">Google Drive Sync</h2>
      </div>
      <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md); font-size: 14px;">
        Securely backup and restore your financial data to your personal Google Drive.
      </p>
      
      ${driveConfigured ? `
        <div style="display:flex; flex-direction:column; gap:var(--spacing-sm);">
          <button id="drive-backup-btn" class="btn btn--primary" style="display:flex; align-items:center; justify-content:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Backup to Drive
          </button>
          <button id="drive-restore-btn" class="btn btn--secondary" style="display:flex; align-items:center; justify-content:center; gap:8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Restore from Drive
          </button>
        </div>
      ` : `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 13px; color: var(--text-secondary); display:flex; align-items:flex-start; gap:8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px; flex-shrink:0; margin-top:2px; color:var(--color-expense);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>Google Drive Client ID is missing. Open <code>js/services/googleDriveService.js</code> to configure it.</div>
        </div>
      `}
    </div>

    <div class="card">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom: 12px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:24px; height:24px; color:var(--text-primary);"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <h2 style="margin:0;">Local Backup</h2>
      </div>
      <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md); font-size: 14px;">
        Manually export your entire database to a JSON file, or restore from a previous file.
      </p>
      
      <div style="display:flex; flex-direction:column; gap:var(--spacing-sm);">
        <button id="export-json-btn" class="btn btn--secondary" style="display:flex; align-items:center; justify-content:center; gap:8px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download JSON File
        </button>
        
        <label for="import-json-file" class="btn btn--secondary" style="display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; margin:0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Restore from JSON File
        </label>
        <input type="file" id="import-json-file" accept=".json" style="display:none;">
      </div>
    </div>
  `;

  if (driveConfigured) {
    // Initialize Google API scripts asynchronously
    initGoogleDrive().catch(err => console.error("Drive Init Error:", err));

    document.getElementById('drive-backup-btn').addEventListener('click', async () => {
      await backupToDrive();
    });

    document.getElementById('drive-restore-btn').addEventListener('click', async () => {
      const isOk = await confirmModal('Restore from Drive', 'Are you sure? This will overwrite all local data with the Drive backup.');
      if (!isOk) return;
      await restoreFromDrive();
    });
  }

  document.getElementById('export-json-btn').addEventListener('click', async () => {
    try {
      await exportDataJSON();
      showToast('Export complete', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  });

  document.getElementById('import-json-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isOk = await confirmModal('Restore Local Data', 'Are you sure? This will delete all current local data and replace it with the selected backup.');
    if (!isOk) {
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await importDataJSON(ev.target.result);
        showToast('Restore successful! App will reload.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast('Restore failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });
}

export function destroy() {}
