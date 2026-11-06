/**
 * NusaPS2 — Main Application Entry Point
 * Vite + Vanilla JavaScript (ES Modules) + HTML5 + Modern CSS
 */
import './style.css';
import { appState } from './app/state.js';
import { initRouter } from './app/router.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHeader } from './components/Header.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderLibrary, setLibraryFilter, setLibrarySort, setLibrarySearch } from './pages/Library.js';
import { renderEmulator } from './pages/Emulator.js';
import { updateEmulatorPlayerUI } from './components/EmulatorPlayer.js';
import { renderControllerPanel, initControllerVisualizer, getActiveRebindAction, setActiveRebindAction } from './components/ControllerPanel.js';
import { renderSaveData, loadSaveBackups } from './pages/SaveData.js';
import { renderSettings } from './pages/Settings.js';
import { renderDiagnostics } from './pages/Diagnostics.js';
import { renderAbout } from './pages/About.js';
import { renderGameDetailsModal } from './components/GameDetailsModal.js';
import { emulatorAdapter } from './emulator/EmulatorAdapter.js';
import { gamepadManager } from './controllers/GamepadManager.js';
import { getKeyMap, updateKeyBinding, resetKeyMap } from './controllers/InputMapper.js';
import { isSupportedGameFile, requestPersistentStorage } from './utils/fileUtils.js';
import { createGameFromFile, deleteGame, getGameById, getGameFile, saveGame, SAMPLE_GAME } from './storage/gameRepository.js';
import { createSaveBackup, deleteSaveBackup, downloadBlobAsFile, getAllSaveBackups } from './storage/saveRepository.js';
import { checkBrowserEnvironment } from './emulator/EmulatorLoader.js';

let visualizerUnsubscribe = null;

// Primary App Shell Setup
async function initApp() {
  const root = document.getElementById('app');
  if (!root) return;

  // Build Layout Structure with dedicated persistent emulator container
  root.innerHTML = `
    <div id="sidebar-container"></div>
    <div class="flex-1 flex flex-col min-w-0 min-h-screen bg-[#070913] relative overflow-y-auto">
      <div id="header-container"></div>
      <main id="main-content" class="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto relative">
        <!-- Persistent Emulator View: Canvas is initialized once and never destroyed -->
        <div id="emulator-view" class="w-full"></div>
        <!-- Dynamic Page View for other tabs (Dashboard, Library, Controllers, Settings, Diagnostics, etc.) -->
        <div id="page-view" class="w-full"></div>
      </main>
    </div>
    <!-- Global Hidden File Inputs -->
    <input type="file" id="global-game-file-input" class="hidden" accept=".iso,.bin,.chd,.cso,.elf,.isz,.mdf" multiple />
    <!-- Dynamic Modal Container -->
    <div id="modal-container"></div>
  `;

  // Initialize persistent emulator DOM container once
  const emulatorView = document.getElementById('emulator-view');
  if (emulatorView) {
    emulatorView.innerHTML = renderEmulator();
  }

  // Hook canvas element to emulatorAdapter and GamepadManager immediately
  const canvas = document.getElementById('outputCanvas');
  if (canvas) {
    emulatorAdapter.canvasElement = canvas;
    gamepadManager.setTargetElement(canvas);
  }

  // Initialize DB and load games
  await appState.refreshGames();
  await appState.refreshStorage();
  await loadSaveBackups();

  // Attach Router
  initRouter();

  // Render Shell
  updateShell();

  // Listen to State Changes
  appState.subscribe(({ event }) => {
    if (event === 'tab_change' || event === 'games_updated') {
      updateShell();
    }
  });

  // Listen to Emulator status changes
  emulatorAdapter.subscribe(({ event, status, fps, elapsedSeconds, message }) => {
    if (event === 'status_change') {
      const sidebarEl = document.getElementById('sidebar-container');
      if (sidebarEl) sidebarEl.innerHTML = renderSidebar();
      updateEmulatorPlayerUI();
    } else if (event === 'fps_update') {
      const el = document.getElementById('player-fps-counter');
      if (el) el.textContent = fps;
    } else if (event === 'session_tick') {
      const el = document.getElementById('player-session-time');
      if (el) {
        const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const s = (elapsedSeconds % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${s}`;
      }
    } else if (event === 'log') {
      const container = document.getElementById('core-log-content');
      if (container) {
        const div = document.createElement('div');
        div.textContent = message;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
      }
      const diagStream = document.getElementById('diagnostics-log-stream');
      if (diagStream) {
        const div = document.createElement('div');
        div.textContent = message;
        diagStream.appendChild(div);
        diagStream.scrollTop = diagStream.scrollHeight;
      }
    }
  });

  // Setup Global Event Delegations
  setupEventListeners();

  console.log('[NusaPS2] Console dashboard initialized.');
}

function updateShell() {
  const sidebarEl = document.getElementById('sidebar-container');
  const headerEl = document.getElementById('header-container');
  const emulatorView = document.getElementById('emulator-view');
  const pageView = document.getElementById('page-view');

  if (sidebarEl) sidebarEl.innerHTML = renderSidebar();
  if (headerEl) headerEl.innerHTML = renderHeader();

  if (visualizerUnsubscribe) {
    visualizerUnsubscribe();
    visualizerUnsubscribe = null;
  }

  const isEmulatorTab = appState.activeTab === 'emulator';

  // Toggle visibility between emulator view and page view
  if (emulatorView) {
    if (isEmulatorTab) {
      emulatorView.classList.remove('hidden');
    } else {
      emulatorView.classList.add('hidden');
    }
  }

  if (pageView) {
    if (isEmulatorTab) {
      pageView.classList.add('hidden');
    } else {
      pageView.classList.remove('hidden');
      switch (appState.activeTab) {
        case 'dashboard':
          pageView.innerHTML = renderDashboard();
          break;
        case 'library':
          pageView.innerHTML = renderLibrary();
          setupDropzone();
          break;
        case 'controllers':
          pageView.innerHTML = renderControllerPanel();
          visualizerUnsubscribe = initControllerVisualizer();
          break;
        case 'savedata':
          pageView.innerHTML = renderSaveData();
          break;
        case 'settings':
          pageView.innerHTML = renderSettings();
          break;
        case 'diagnostics':
          pageView.innerHTML = renderDiagnostics();
          break;
        case 'about':
          pageView.innerHTML = renderAbout();
          break;
        default:
          pageView.innerHTML = renderDashboard();
      }
    }
  }

  // Update emulator toolbar & overlay state dynamically
  updateEmulatorPlayerUI();
}

/**
 * Game Launch Handler: Boots game in Emulator Player
 */
async function launchGameById(gameId) {
  const game = appState.games.find((g) => g.id === gameId);
  if (!game) return;

  // Switch to Emulator Tab first to make it visible
  appState.setActiveTab('emulator');

  const canvas = document.getElementById('outputCanvas');

  try {
    let fileToBoot = await getGameFile(game);

    // If large file without stored blob or user file reference is needed
    if (!fileToBoot) {
      const file = await promptFileSelect(game.filename);
      if (!file) return;
      fileToBoot = file;
    }

    await emulatorAdapter.bootGame(game, fileToBoot, canvas);
  } catch (err) {
    console.error('Boot error:', err);
    updateEmulatorPlayerUI();
  }
}

function promptFileSelect(hintFilename = '') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.iso,.bin,.chd,.cso,.elf,.isz,.mdf';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      resolve(file || null);
    };
    input.click();
  });
}

/**
 * Handle importing game files via file input or drag-and-drop
 */
async function handleImportFiles(fileList) {
  if (!fileList || fileList.length === 0) return;

  let addedCount = 0;
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!isSupportedGameFile(file)) {
      alert(`"${file.name}" is not a recognized PS2 game format. Supported formats: .ISO, .BIN, .CHD, .CSO, .ELF`);
      continue;
    }

    try {
      const { game } = await createGameFromFile(file);
      addedCount++;
      console.log(`[NusaPS2] Imported "${game.title}" (${game.filename})`);
    } catch (err) {
      console.error(`Failed to import ${file.name}:`, err);
    }
  }

  if (addedCount > 0) {
    await appState.refreshGames();
    if (appState.activeTab !== 'library') {
      appState.setActiveTab('library');
    }
  }
}

/**
 * Drag & Drop Dropzone Setup on Library Page
 */
function setupDropzone() {
  const dropzone = document.getElementById('library-dropzone');
  const fileInput = document.getElementById('library-file-input');
  if (!dropzone || !fileInput) return;

  dropzone.onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    handleImportFiles(e.target.files);
  };

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add('border-purple-500', 'bg-purple-500/10');
  };

  dropzone.ondragleave = (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-purple-500', 'bg-purple-500/10');
  };

  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-purple-500', 'bg-purple-500/10');
    if (e.dataTransfer?.files) {
      handleImportFiles(e.dataTransfer.files);
    }
  };
}

/**
 * Central Click and Input Event Listeners
 */
function setupEventListeners() {
  const globalInput = document.getElementById('global-game-file-input');
  if (globalInput) {
    globalInput.onchange = (e) => handleImportFiles(e.target.files);
  }

  // Fullscreen change listener to toggle floating exit button
  document.addEventListener('fullscreenchange', () => {
    const exitBtn = document.getElementById('btn-exit-fullscreen');
    if (exitBtn) {
      if (document.fullscreenElement) {
        exitBtn.classList.remove('hidden');
      } else {
        exitBtn.classList.add('hidden');
      }
    }
  });

  // Global Keydown listener for rebinding keys
  window.addEventListener('keydown', (e) => {
    const rebindingAction = getActiveRebindAction();
    if (rebindingAction) {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind Escape - use Escape to cancel
      if (e.code === 'Escape') {
        setActiveRebindAction(null);
        if (appState.activeTab === 'controllers') {
          updateShell();
        }
        return;
      }

      updateKeyBinding(rebindingAction, e.code, e.key);
      setActiveRebindAction(null);
      if (appState.activeTab === 'controllers') {
        updateShell();
      }
    }
  }, true);

  document.addEventListener('click', async (e) => {
    // 1. Header & Hero Import buttons
    if (e.target.closest('#btn-header-import') || e.target.closest('#btn-hero-import') || e.target.closest('#btn-library-import')) {
      if (globalInput) globalInput.click();
      return;
    }

    // 2. Hero Quick Launch wLaunchELF
    if (e.target.closest('#btn-hero-launch-sample') || e.target.closest('#btn-quick-launch-homebrew')) {
      launchGameById(SAMPLE_GAME.id);
      return;
    }

    // 3. Launch game from GameCard
    const launchBtn = e.target.closest('.btn-launch-game');
    if (launchBtn) {
      const id = launchBtn.getAttribute('data-id');
      launchGameById(id);
      return;
    }

    // 4. Quick Switcher game click
    const quickSwitchBtn = e.target.closest('.btn-quick-switch-game');
    if (quickSwitchBtn) {
      const id = quickSwitchBtn.getAttribute('data-id');
      launchGameById(id);
      return;
    }

    // 5. Open Game Details Modal
    const detailsBtn = e.target.closest('.btn-game-details');
    if (detailsBtn) {
      const id = detailsBtn.getAttribute('data-id');
      const game = await getGameById(id);
      if (game) {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = await renderGameDetailsModal(game, false);
        }
      }
      return;
    }

    // 6. Close Modal
    if (e.target.closest('#btn-close-game-modal')) {
      const modal = document.getElementById('game-details-modal');
      if (modal) modal.remove();
      return;
    }

    // 7. Toggle Edit Metadata in Modal
    if (e.target.closest('#btn-toggle-edit-metadata')) {
      const id = e.target.closest('#btn-toggle-edit-metadata').getAttribute('data-id');
      const game = await getGameById(id);
      if (game) {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = await renderGameDetailsModal(game, true);
        }
      }
      return;
    }

    // 8. Cancel Edit Metadata
    if (e.target.closest('#btn-cancel-edit-metadata')) {
      const id = e.target.closest('#btn-cancel-edit-metadata').getAttribute('data-id');
      const game = await getGameById(id);
      if (game) {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = await renderGameDetailsModal(game, false);
        }
      }
      return;
    }

    // 9. Save Metadata Changes
    if (e.target.closest('#btn-save-metadata')) {
      const id = e.target.closest('#btn-save-metadata').getAttribute('data-id');
      const game = await getGameById(id);
      const titleInput = document.getElementById('edit-modal-game-title');
      const notesInput = document.getElementById('edit-modal-game-notes');
      if (game && titleInput) {
        game.title = titleInput.value.trim() || game.title;
        game.description = notesInput ? notesInput.value.trim() : game.description;
        await saveGame(game);
        await appState.refreshGames();
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = await renderGameDetailsModal(game, false);
        }
      }
      return;
    }

    // 10. Launch from Modal
    const modalLaunch = e.target.closest('#btn-modal-launch-game');
    if (modalLaunch) {
      const id = modalLaunch.getAttribute('data-id');
      const modal = document.getElementById('game-details-modal');
      if (modal) modal.remove();
      launchGameById(id);
      return;
    }

    // 11. Delete game from library or modal
    const deleteBtn = e.target.closest('.btn-delete-game') || e.target.closest('#btn-modal-delete-game');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const game = await getGameById(id);
      if (game && confirm(`Are you sure you want to remove "${game.title}" from your library?`)) {
        await deleteGame(id);
        const modal = document.getElementById('game-details-modal');
        if (modal) modal.remove();
        await appState.refreshGames();
      }
      return;
    }

    // 12. Player Controls: Pause / Resume / Reset / Stop
    if (e.target.closest('#btn-player-pause')) {
      emulatorAdapter.pause();
      return;
    }
    if (e.target.closest('#btn-player-resume')) {
      if (emulatorAdapter.getStatus() === 'PAUSED') {
        emulatorAdapter.resume();
      } else {
        launchGameById(SAMPLE_GAME.id);
      }
      return;
    }
    if (e.target.closest('#btn-player-reset')) {
      emulatorAdapter.reset();
      return;
    }
    if (e.target.closest('#btn-player-stop')) {
      emulatorAdapter.stop();
      updateEmulatorPlayerUI();
      return;
    }

    // 13. Dismiss Player Error Banner
    if (e.target.closest('#btn-dismiss-player-error')) {
      emulatorAdapter.clearError();
      updateEmulatorPlayerUI();
      return;
    }

    // 14. Copy Player Error
    if (e.target.closest('#btn-copy-player-error')) {
      const err = emulatorAdapter.getLastError() || 'Unknown emulator error';
      navigator.clipboard.writeText(err).then(() => {
        alert('Error message copied to clipboard.');
      });
      return;
    }

    // 15. Toggle Fullscreen
    if (e.target.closest('#btn-player-fullscreen')) {
      const container = document.getElementById('emulator-viewport-container');
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(console.error);
        } else {
          document.exitFullscreen().catch(console.error);
        }
      }
      return;
    }

    // 16. Exit Fullscreen floating button
    if (e.target.closest('#btn-exit-fullscreen')) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
      return;
    }

    // 17. Toggle Scanlines
    if (e.target.closest('#btn-toggle-scanlines')) {
      const newScanlines = !appState.settings.enableScanlines;
      appState.saveSettings({ enableScanlines: newScanlines });
      const layer = document.getElementById('player-scanlines-layer');
      if (layer) {
        layer.classList.toggle('hidden', !newScanlines);
        layer.classList.toggle('block', newScanlines);
      }
      return;
    }

    // 18. Toggle Core Logs Drawer
    if (e.target.closest('#btn-toggle-logs')) {
      const drawer = document.getElementById('core-log-drawer');
      if (drawer) drawer.classList.toggle('hidden');
      return;
    }

    // 19. Copy Logs
    if (e.target.closest('#btn-copy-logs') || e.target.closest('#btn-copy-diag-logs')) {
      const logsText = emulatorAdapter.getLogs().join('\n');
      navigator.clipboard.writeText(logsText).then(() => {
        alert('Logs copied to clipboard.');
      });
      return;
    }

    // 20. Clear Logs
    if (e.target.closest('#btn-clear-logs') || e.target.closest('#btn-clear-diag-logs')) {
      emulatorAdapter.logs = [];
      const content = document.getElementById('core-log-content');
      if (content) content.innerHTML = '<div class="text-slate-600">Logs cleared.</div>';
      const diagStream = document.getElementById('diagnostics-log-stream');
      if (diagStream) diagStream.innerHTML = '<div class="text-slate-600">Logs cleared.</div>';
      return;
    }

    // 21. Rebind Key Click in Controller Panel
    const rebindBtn = e.target.closest('.btn-rebind-key');
    if (rebindBtn) {
      const action = rebindBtn.getAttribute('data-action');
      setActiveRebindAction(action);
      updateShell();
      return;
    }

    // 22. Reset Keybindings in Controller Panel
    if (e.target.closest('#btn-reset-keymap')) {
      resetKeyMap();
      setActiveRebindAction(null);
      updateShell();
      alert('Keybindings restored to default layout.');
      return;
    }

    // 23. Reload with COI
    if (e.target.closest('#btn-reload-coi')) {
      window.location.reload();
      return;
    }

    // 24. Export Memory Card (.bin or .ps2)
    const exportCardBtn = e.target.closest('.btn-export-memcard') || e.target.closest('.btn-export-memcard-ps2');
    if (exportCardBtn) {
      const slot = parseInt(exportCardBtn.getAttribute('data-slot') || '1', 10);
      const format = exportCardBtn.getAttribute('data-format') || 'bin';
      const data = emulatorAdapter.getMemoryCardData(slot);
      const filename = `Mcd00${slot}.${format}`;
      if (data && data.byteLength > 0) {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        downloadBlobAsFile(blob, filename);
      } else {
        // Export standard 8MB blank memory card template
        const emptyData = new Uint8Array(8 * 1024 * 1024);
        const blob = new Blob([emptyData], { type: 'application/octet-stream' });
        downloadBlobAsFile(blob, filename);
      }
      return;
    }

    // 25. Import Memory Card (.bin or .ps2)
    const importCardBtn = e.target.closest('.btn-import-memcard');
    if (importCardBtn) {
      const slot = importCardBtn.getAttribute('data-slot');
      const input = document.getElementById(`file-import-memcard-${slot}`);
      if (input) {
        input.onchange = async (ev) => {
          const file = ev.target.files?.[0];
          if (file) {
            const buf = await file.arrayBuffer();
            emulatorAdapter.writeMemoryCardData(parseInt(slot, 10), new Uint8Array(buf));
            alert(`Memory card Slot ${slot} updated successfully with "${file.name}".`);
          }
        };
        input.click();
      }
      return;
    }

    // 26. Create Local Snapshot Backup
    const backupBtn = e.target.closest('.btn-backup-memcard');
    if (backupBtn) {
      const slot = parseInt(backupBtn.getAttribute('data-slot') || '1', 10);
      const data = emulatorAdapter.getMemoryCardData(slot) || new Uint8Array(8 * 1024 * 1024);
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const current = emulatorAdapter.getCurrentGame();
      const titleSuffix = current ? ` - ${current.title.substring(0, 24)}` : '';
      await createSaveBackup({
        slot,
        title: `Slot ${slot}${titleSuffix} (${new Date().toLocaleDateString()})`,
        dataBlob: blob,
      });
      await loadSaveBackups();
      updateShell();
      alert(`Local snapshot created for Memory Card Slot ${slot}.`);
      return;
    }

    // 27. Download Backup Snapshot
    const dlBackupBtn = e.target.closest('.btn-download-backup');
    if (dlBackupBtn) {
      const id = dlBackupBtn.getAttribute('data-id');
      const backups = await getAllSaveBackups();
      const backup = backups.find((b) => b.id === id);
      if (backup && backup.dataBlob) {
        downloadBlobAsFile(backup.dataBlob, `${backup.title.replace(/\s+/g, '_')}.bin`);
      }
      return;
    }

    // 28. Delete Backup with Confirmation
    const delBackupBtn = e.target.closest('.btn-delete-backup-prompt');
    if (delBackupBtn) {
      const id = delBackupBtn.getAttribute('data-id');
      const title = delBackupBtn.getAttribute('data-title') || 'this snapshot';
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        await deleteSaveBackup(id);
        await loadSaveBackups();
        updateShell();
      }
      return;
    }

    // 29. Export App Configuration JSON
    if (e.target.closest('#btn-export-app-config')) {
      const configData = {
        settings: appState.settings,
        keyMap: getKeyMap(),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
      downloadBlobAsFile(blob, 'NusaPS2_Config.json');
      return;
    }

    // 30. Import App Configuration JSON
    if (e.target.closest('#btn-import-app-config')) {
      const input = document.getElementById('file-import-app-config');
      if (input) {
        input.onchange = async (ev) => {
          const file = ev.target.files?.[0];
          if (file) {
            try {
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (parsed.settings) appState.saveSettings(parsed.settings);
              if (parsed.keyMap) localStorage.setItem('nusaps2_custom_keymap', JSON.stringify(parsed.keyMap));
              updateShell();
              alert('Application configuration restored successfully!');
            } catch (err) {
              alert('Invalid configuration JSON file.');
            }
          }
        };
        input.click();
      }
      return;
    }

    // 31. Copy Full Diagnostic Report
    if (e.target.closest('#btn-copy-diagnostics')) {
      const env = checkBrowserEnvironment();
      const report = {
        app: 'NusaPS2',
        version: 'Phase 3 - Play! WASM v0.58',
        timestamp: new Date().toISOString(),
        browser: {
          userAgent: navigator.userAgent,
          crossOriginIsolated: Boolean(window.crossOriginIsolated),
          sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
          webGL2: env.hasWebGL2,
          offscreenCanvas: env.hasOffscreenCanvas,
          gamepadAPI: typeof navigator !== 'undefined' && 'getGamepads' in navigator,
        },
        emulator: {
          status: emulatorAdapter.getStatus(),
          fps: emulatorAdapter.fps,
          sessionElapsedSeconds: emulatorAdapter.sessionElapsedSeconds,
          currentGame: emulatorAdapter.getCurrentGame() ? {
            title: emulatorAdapter.getCurrentGame().title,
            filename: emulatorAdapter.getCurrentGame().filename,
            format: emulatorAdapter.getCurrentGame().format,
            size: emulatorAdapter.getCurrentGame().size,
          } : null,
          lastError: emulatorAdapter.getLastError(),
        },
        controllers: {
          count: gamepadManager.connectedGamepads.size,
          activeSlot: gamepadManager.activeGamepadIndex,
          devices: Array.from(gamepadManager.connectedGamepads.values()).map((g) => ({
            id: g.id,
            buttonsCount: g.buttons?.length,
            axesCount: g.axes?.length,
          })),
        },
        storage: {
          usage: appState.storageQuota.usage,
          quota: appState.storageQuota.quota,
          persisted: appState.storageQuota.persisted,
        },
        recentLogs: emulatorAdapter.getLogs().slice(-20),
      };

      const markdownReport = `### NusaPS2 Diagnostic Report\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\``;
      navigator.clipboard.writeText(markdownReport).then(() => {
        const textSpan = document.getElementById('btn-copy-diagnostics-text');
        if (textSpan) textSpan.textContent = '✓ Diagnostic Report Copied!';
        setTimeout(() => {
          if (textSpan) textSpan.textContent = 'Copy Full Diagnostic Report';
        }, 3000);
      });
      return;
    }

    // 32. Library Filter Tab
    const filterBtn = e.target.closest('.btn-filter-tab');
    if (filterBtn) {
      const filter = filterBtn.getAttribute('data-filter');
      setLibraryFilter(filter);
      updateShell();
      return;
    }

    // 33. Reset Filters
    if (e.target.closest('#btn-reset-filters')) {
      setLibraryFilter('ALL');
      setLibrarySearch('');
      updateShell();
      return;
    }

    // 34. Request Persistent Storage in Settings
    if (e.target.closest('#btn-request-persist')) {
      const granted = await requestPersistentStorage();
      await appState.refreshStorage();
      updateShell();
      alert(granted ? 'Persistent storage granted by browser!' : 'Storage persistence could not be granted.');
      return;
    }

    // 35. Reset Settings
    if (e.target.closest('#btn-reset-settings')) {
      localStorage.removeItem('nusaps2_settings');
      appState.settings = appState.loadSettings();
      updateShell();
      alert('Application preferences reset to defaults.');
      return;
    }
  });

  // Handle Search Input in Library
  document.addEventListener('input', (e) => {
    if (e.target.id === 'library-search-input') {
      setLibrarySearch(e.target.value);
      // Update grid only without re-rendering entire page to avoid losing focus
      const grid = document.getElementById('library-games-grid');
      const query = e.target.value.toLowerCase().trim();
      if (grid) {
        const filtered = appState.games.filter((g) => {
          return !query || g.title.toLowerCase().includes(query) || g.filename.toLowerCase().includes(query);
        });
        grid.innerHTML = filtered.map((g) => renderGameCard(g)).join('');
      }
    } else if (e.target.id === 'settings-volume') {
      const val = e.target.value;
      const label = document.getElementById('settings-volume-label');
      if (label) label.textContent = `${val}%`;
      appState.saveSettings({ audioVolume: parseInt(val, 10) });
    }
  });

  // Handle Select Changes
  document.addEventListener('change', (e) => {
    if (e.target.id === 'library-sort-select') {
      setLibrarySort(e.target.value);
      updateShell();
    } else if (e.target.id === 'select-aspect-ratio' || e.target.id === 'settings-aspect-ratio') {
      const val = e.target.value;
      appState.saveSettings({ aspectRatio: val });
      const canvas = document.getElementById('outputCanvas');
      if (canvas) {
        canvas.classList.remove('aspect-[4/3]', 'aspect-[16/9]', 'w-full', 'h-full');
        if (val === '16:9') canvas.classList.add('aspect-[16/9]');
        else if (val === 'fill') canvas.classList.add('w-full', 'h-full');
        else canvas.classList.add('aspect-[4/3]');
      }
    } else if (e.target.id === 'settings-resolution') {
      appState.saveSettings({ resolutionScale: e.target.value });
      const scale = parseInt(e.target.value, 10) || 1;
      const canvas = document.getElementById('outputCanvas');
      if (canvas && !canvas.__nusaOffscreenCanvas) {
        canvas.width = 640 * scale;
        canvas.height = 448 * scale;
      }
    } else if (e.target.id === 'settings-bilinear') {
      appState.saveSettings({ forceBilinear: e.target.checked });
    } else if (e.target.id === 'settings-scanlines') {
      appState.saveSettings({ enableScanlines: e.target.checked });
      const layer = document.getElementById('player-scanlines-layer');
      if (layer) {
        layer.classList.toggle('hidden', !e.target.checked);
        layer.classList.toggle('block', e.target.checked);
      }
    } else if (e.target.id === 'select-active-gamepad') {
      gamepadManager.setActiveGamepadIndex(parseInt(e.target.value, 10));
    }
  });
}

// Start application
initApp();
