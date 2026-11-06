/**
 * Save Data and Memory Card Repository for NusaPS2
 */
import { getStore } from './database.js';

export async function getAllSaveBackups() {
  const { store } = await getStore('saves', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function createSaveBackup({ title, gameId, gameTitle, slot = 1, dataBlob }) {
  const id = 'save_' + Date.now();
  const backup = {
    id,
    title: title || `Memory Card Slot ${slot} Snapshot`,
    gameId: gameId || 'generic',
    gameTitle: gameTitle || 'PlayStation 2 System',
    slot,
    timestamp: Date.now(),
    size: dataBlob ? dataBlob.size : 8 * 1024 * 1024,
    dataBlob,
    type: 'memcard',
  };

  const { store } = await getStore('saves', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(backup);
    request.onsuccess = () => resolve(backup);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSaveBackup(id) {
  const { store } = await getStore('saves', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export function downloadBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
