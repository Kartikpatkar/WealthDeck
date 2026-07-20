import { exportDataJSON, importDataJSON } from '../services/exportService.js';
import { isDriveConfigured, initGoogleDrive, backupToDrive, restoreFromDrive, getLastSyncDate, isDriveSignedIn, signOutFromDrive } from '../services/googleDriveService.js';
import { showToast } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';

export async function render(container, params = {}) {
  const driveConfigured = isDriveConfigured();
  const lastSync = getLastSyncDate();
  const signedIn = isDriveSignedIn();
  
  const lastSyncText = lastSync ? 
    `<span class="mod-style-228149">Last synced: ${lastSync.toLocaleDateString()} at ${lastSync.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>` : 
    'Securely backup and restore your financial data to your personal Google Drive.';

  container.innerHTML = `
    <div class="mod-style-4cdf23">
      <h1>Sync & Backup</h1>
    </div>
    
    <div class="card mod-style-840a08">
      <div class="mod-style-c0b9e8">
        <div class="mod-style-7f8dc0">
          <svg class="mod-style-8ec4f0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 22h20L12 2z"/><path d="M12 2L2 22h10l10-20H12z" opacity="0.3"/></svg>
          <h2 class="mod-style-46dcee">Google Drive Sync</h2>
        </div>
        ${signedIn ? `<button class="mod-style-68ee44" id="drive-signout-btn">Sign Out</button>` : ''}
      </div>
      <p class="mod-style-0f62e6">
        ${lastSyncText}
      </p>
      
      ${driveConfigured ? `
        <div class="mod-style-b4832f">
          <button class="btn btn--primary mod-style-752897" id="drive-backup-btn">
            <svg class="mod-style-a2f16e" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Backup to Drive
          </button>
          <button class="btn btn--secondary mod-style-752897" id="drive-restore-btn">
            <svg class="mod-style-a2f16e" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Restore from Drive
          </button>
        </div>
      ` : `
        <div class="mod-style-86a849">
          <svg class="mod-style-5620c3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>Google Drive Client ID is missing. Open <code>js/services/googleDriveService.js</code> to configure it.</div>
        </div>
      `}
    </div>

    <div class="card">
      <div class="mod-style-28b841">
        <svg class="mod-style-b770e8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <h2 class="mod-style-46dcee">Local Backup</h2>
      </div>
      <p class="mod-style-0f62e6">
        Manually export your entire database to a JSON file, or restore from a previous file.
      </p>
      
      <div class="mod-style-b4832f">
        <button class="btn btn--secondary mod-style-752897" id="export-json-btn">
          <svg class="mod-style-a2f16e" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download JSON File
        </button>
        
        <label class="btn btn--secondary mod-style-868922" for="import-json-file">
          <svg class="mod-style-a2f16e" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Restore from JSON File
        </label>
        <input class="mod-style-93b8ea" type="file" id="import-json-file" accept=".json">
      </div>
    </div>
  `;

  if (driveConfigured) {
    // Initialize Google API scripts asynchronously
    initGoogleDrive().catch(err => console.error("Drive Init Error:", err));

    document.getElementById('drive-backup-btn').addEventListener('click', async () => {
      const success = await backupToDrive();
      if (success) render(container, params); // Re-render to show updated sync date
    });

    document.getElementById('drive-restore-btn').addEventListener('click', async () => {
      const isOk = await confirmModal('Restore from Drive', 'Are you sure? This will overwrite all local data with the Drive backup.');
      if (!isOk) return;
      await restoreFromDrive();
    });

    const signoutBtn = document.getElementById('drive-signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        signOutFromDrive();
      });
    }
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
