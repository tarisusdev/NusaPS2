/**
 * Central Reactive State Store for NusaPS2
 */
import { seedDefaultHomebrewIfEmpty } from '../storage/gameRepository.js';
import { getStorageQuotaInfo } from '../utils/fileUtils.js';

class AppState {
  constructor() {
    this.activeTab = 'dashboard';
    this.games = [];
    this.selectedGame = null;
    this.storageQuota = { usage: 0, quota: 0, percent: 0, supported: false };
    this.settings = this.loadSettings();
    this.subscribers = new Set();
  }

  loadSettings() {
    const defaultSettings = {
      theme: 'dark',
      resolutionScale: '1',
      aspectRatio: '4:3',
      forceBilinear: true,
      audioVolume: 100,
      enableScanlines: false,
      autoBackupSaves: true,
    };
    try {
      const saved = localStorage.getItem('nusaps2_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('nusaps2_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
    this.notify('settings_change');
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, payload = {}) {
    for (const callback of this.subscribers) {
      callback({ event, state: this, ...payload });
    }
  }

  async refreshGames() {
    this.games = await seedDefaultHomebrewIfEmpty();
    this.notify('games_updated');
    this.refreshStorage();
  }

  async refreshStorage() {
    this.storageQuota = await getStorageQuotaInfo();
    this.notify('storage_updated');
  }

  setActiveTab(tabName) {
    if (this.activeTab !== tabName) {
      this.activeTab = tabName;
      window.location.hash = tabName;
      this.notify('tab_change', { tab: tabName });
    }
  }

  setSelectedGame(game) {
    this.selectedGame = game;
    this.notify('selected_game_change', { game });
  }
}

export const appState = new AppState();
