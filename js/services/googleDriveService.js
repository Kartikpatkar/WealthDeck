import { getRawExportJSON } from './exportService.js';
import { importDataJSON } from './exportService.js';
import { showToast } from '../components/toast.js';

// PLACEHOLDER: User needs to replace this with their actual Client ID from Google Cloud Console
const CLIENT_ID = '388767949571-ovgshl6mmvvv84naocsu0669ncm390s6.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let accessToken = null;
let tokenExpiry = null;
let gapiInited = false;
let gisInited = false;

export function isDriveConfigured() {
  return CLIENT_ID !== '[YOUR_CLIENT_ID_HERE]' && CLIENT_ID.trim() !== '';
}

export function isDriveSignedIn() {
  return accessToken !== null;
}

export async function initGoogleDrive() {
  if (!isDriveConfigured()) return false;

  return new Promise((resolve) => {
    // Load GAPI client for API calls
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      gapi.load('client', async () => {
        await gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkInit(resolve);
      });
    };
    document.body.appendChild(script1);

    // GIS client is already in index.html, but we initialize tokenClient here
    const checkGis = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGis);
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000) - 60000; // 1 min buffer
            // The actual action will be handled by the caller who requested the token
          },
        });
        gisInited = true;
        checkInit(resolve);
      }
    }, 100);
  });
}

function checkInit(resolve) {
  if (gapiInited && gisInited) {
    resolve(true);
  }
}

async function requireAuth() {
  return new Promise((resolve, reject) => {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) return resolve(true);

    if (!tokenClient) return reject(new Error('Google Auth not initialized'));

    // Override callback temporarily to catch the resolve
    const originalCallback = tokenClient.callback;
    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error !== undefined) {
        reject(tokenResponse);
      }
      accessToken = tokenResponse.access_token;
      tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000) - 60000;
      originalCallback(tokenResponse);
      resolve(true);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function backupToDrive() {
  try {
    await requireAuth();
    showToast('Uploading to Google Drive...', 'info');

    const fileContent = await getRawExportJSON();
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
      name: 'wealthdeck_backup.json',
      mimeType: 'application/json',
    };

    // 1. Check if file exists
    let fileId = null;
    const searchRes = await gapi.client.drive.files.list({
      q: "name='wealthdeck_backup.json' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (searchRes.result.files && searchRes.result.files.length > 0) {
      fileId = searchRes.result.files[0].id;
    }

    // 2. Upload (Create or Update)
    const token = gapi.client.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: form
    });

    if (!res.ok) throw new Error('Upload failed');

    localStorage.setItem('wealthdeck_last_sync', new Date().toISOString());
    showToast('Backup synced to Google Drive!', 'success');
    return true;
  } catch (err) {
    console.error(err);
    showToast('Drive Backup Failed', 'error');
    return false;
  }
}

export async function restoreFromDrive() {
  try {
    await requireAuth();
    showToast('Searching Google Drive...', 'info');

    // 1. Check if file exists
    const searchRes = await gapi.client.drive.files.list({
      q: "name='wealthdeck_backup.json' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (!searchRes.result.files || searchRes.result.files.length === 0) {
      showToast('No WealthDeck backup found on Google Drive.', 'error');
      return false;
    }

    const fileId = searchRes.result.files[0].id;

    showToast('Downloading backup...', 'info');

    // 2. Download file
    const res = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    if (res.body) {
      localStorage.setItem('wealthdeck_last_sync', new Date().toISOString());
      await importDataJSON(res.body);
      showToast('Restore successful! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1500);
      return true;
    } else {
      throw new Error('Empty file');
    }
  } catch (err) {
    console.error(err);
    showToast('Drive Restore Failed', 'error');
    return false;
  }
}

export function signOutFromDrive() {
  if (accessToken && window.google) {
    google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
      showToast('Signed out of Google Drive', 'info');
      window.location.reload();
    });
  } else {
    showToast('Not signed in', 'info');
  }
}

export function getLastSyncDate() {
  const d = localStorage.getItem('wealthdeck_last_sync');
  return d ? new Date(d) : null;
}
