/**
 * IndexedDB Database for NusaPS2
 * Stores game library metadata, covers, user game files, and memory card saves
 */

const DB_NAME = 'NusaPS2_DB';
const DB_VERSION = 1;

let dbInstance = null;

export function openDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Games store: stores metadata, file references/blobs, play stats
      if (!db.objectStoreNames.contains('games')) {
        const gameStore = db.createObjectStore('games', { keyPath: 'id' });
        gameStore.createIndex('title', 'title', { unique: false });
        gameStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        gameStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
      }

      // Saves store: memory card snapshots and exports
      if (!db.objectStoreNames.contains('saves')) {
        const saveStore = db.createObjectStore('saves', { keyPath: 'id' });
        saveStore.createIndex('gameId', 'gameId', { unique: false });
        saveStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // App Settings / Config
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open failed:', event.target.error);
      reject(event.target.error);
    };
  });
}

export async function getStore(storeName, mode = 'readonly') {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  return { store: tx.objectStore(storeName), tx };
}
