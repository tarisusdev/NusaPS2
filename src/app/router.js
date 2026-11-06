/**
 * Client Router for NusaPS2
 */
import { appState } from './state.js';

export function initRouter() {
  const handleHashChange = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['dashboard', 'library', 'emulator', 'controllers', 'savedata', 'settings', 'diagnostics', 'about'];
    if (validTabs.includes(hash)) {
      appState.setActiveTab(hash);
    } else {
      window.location.hash = appState.activeTab;
    }
  };

  window.addEventListener('hashchange', handleHashChange);

  // Initialize with current hash or default to dashboard
  if (window.location.hash) {
    handleHashChange();
  } else {
    window.location.hash = 'dashboard';
  }
}
