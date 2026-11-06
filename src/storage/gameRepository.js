/**
 * Game Repository for NusaPS2
 * Persists game entries and file blobs in IndexedDB
 */
import { getStore } from './database.js';
import { cleanGameTitle, getFileExtension } from '../utils/formatUtils.js';

// In-memory runtime cache for the active session to avoid redundant disk reads
const runtimeFileCache = new Map();

export function setRuntimeFile(gameId, file) {
  if (gameId && file) {
    runtimeFileCache.set(gameId, file);
  }
}

export function getRuntimeFile(gameId) {
  return runtimeFileCache.get(gameId) || null;
}

// Pre-packaged verified homebrew demo entry
export const SAMPLE_GAME = {
  id: 'ps2-sample-wlaunchelf',
  title: 'wLaunchELF v4.43a (PS2 System Shell)',
  filename: 'wLaunchELF.elf',
  size: 462917,
  format: 'ELF',
  dateAdded: Date.now() - 86400000,
  lastPlayed: null,
  playTime: 0,
  coverUrl: '',
  isBuiltIn: true,
  url: '/samples/wLaunchELF.elf',
  description: 'Official open-source PlayStation 2 homebrew file manager, memory card browser, and ELF launcher. Runs directly on the Play! WebAssembly core.',
};

export async function getAllGames() {
  const { store } = await getStore('games', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getGameById(id) {
  const { store } = await getStore('games', 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGame(game) {
  const { store } = await getStore('games', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(game);
    request.onsuccess = () => resolve(game);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteGame(id) {
  runtimeFileCache.delete(id);
  const { store } = await getStore('games', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function updateGameStats(id, addedPlayTimeSeconds = 0) {
  const game = await getGameById(id);
  if (!game) return;
  game.lastPlayed = Date.now();
  game.playTime = (game.playTime || 0) + addedPlayTimeSeconds;
  await saveGame(game);
}

export async function createGameFromFile(file, customCoverUrl = '') {
  const id = 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const title = cleanGameTitle(file.name);
  const format = getFileExtension(file.name);

  // Cache in active session memory immediately
  setRuntimeFile(id, file);

  const newGame = {
    id,
    title,
    filename: file.name,
    size: file.size,
    format,
    dateAdded: Date.now(),
    lastPlayed: null,
    playTime: 0,
    coverUrl: customCoverUrl || '',
    isBuiltIn: false,
    fileBlob: file, // Store File/Blob in IndexedDB
    description: `User-imported ${format} game file (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
  };

  try {
    await saveGame(newGame);
  } catch (err) {
    console.warn('[GameRepository] IndexedDB blob save warning (quota):', err);
    // If browser quota is restricted, persist metadata and keep file in session memory
    newGame.fileBlob = null;
    newGame.isLargeFile = true;
    await saveGame(newGame);
  }

  return { game: newGame, rawFile: file };
}

/**
 * Retrieves the File or Blob for a game without re-prompting the user
 */
export async function getGameFile(game) {
  if (!game) return null;

  // 1. Check in-memory session cache
  const cached = getRuntimeFile(game.id);
  if (cached) return cached;

  // 2. Check IndexedDB stored fileBlob
  if (game.fileBlob) {
    setRuntimeFile(game.id, game.fileBlob);
    return game.fileBlob;
  }

  // 3. Built-in sample game URL (e.g. wLaunchELF.elf)
  if (game.url) {
    const response = await fetch(game.url);
    if (!response.ok) throw new Error(`HTTP ${response.status} loading ${game.url}`);
    const blob = await response.blob();
    const file = new File([blob], game.filename, { type: 'application/octet-stream' });
    setRuntimeFile(game.id, file);
    return file;
  }

  return null;
}

export async function seedDefaultHomebrewIfEmpty() {
  const games = await getAllGames();
  if (games.length === 0) {
    await saveGame(SAMPLE_GAME);
    return [SAMPLE_GAME];
  }
  return games;
}
