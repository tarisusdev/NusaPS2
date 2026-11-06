/**
 * Emulator Adapter for NusaPS2
 * Provides a clean, event-driven interface to the underlying Play! WebAssembly core.
 * Implements real PS2 emulation methods with standardized status reporting.
 */
import { EMULATOR_STATUS, DEFAULT_EMULATOR_CONFIG } from './emulatorConfig.js';
import { initializePlayCore, checkBrowserEnvironment } from './EmulatorLoader.js';
import { updateGameStats } from '../storage/gameRepository.js';

class EmulatorAdapter {
  constructor() {
    this.core = null;
    this.canvasElement = null;
    this.status = EMULATOR_STATUS.NOT_INITIALIZED;
    this.currentGame = null;
    this.currentFile = null;
    this.config = { ...DEFAULT_EMULATOR_CONFIG };
    this.listeners = new Set();
    this.logs = [];

    // Runtime error tracking
    this.lastError = null;

    // Performance & FPS tracking
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.fpsAnimationId = null;

    // Play session timer
    this.sessionStartTime = null;
    this.sessionTimerId = null;
    this.sessionElapsedSeconds = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload = {}) {
    for (const listener of this.listeners) {
      listener({
        event,
        status: this.status,
        game: this.currentGame,
        fps: this.fps,
        elapsedSeconds: this.sessionElapsedSeconds,
        config: this.config,
        lastError: this.lastError,
        ...payload,
      });
    }
  }

  clearError() {
    this.lastError = null;
    if (this.status === EMULATOR_STATUS.ERROR) {
      this.status = this.core ? EMULATOR_STATUS.READY : EMULATOR_STATUS.NOT_INITIALIZED;
    }
    this.notify('status_change');
  }

  getLastError() {
    return this.lastError;
  }

  log(message) {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${message}`;
    this.logs.push(entry);
    if (this.logs.length > 250) this.logs.shift();
    this.notify('log', { message: entry, logs: this.logs });
  }

  getStatus() {
    return this.status;
  }

  getCurrentGame() {
    return this.currentGame;
  }

  getCurrentFile() {
    return this.currentFile;
  }

  getLogs() {
    return [...this.logs];
  }

  /**
   * Initializes the WebAssembly core with the provided or discovered canvas
   */
  async initialize(canvasElement = null) {
    if (canvasElement) {
      this.canvasElement = canvasElement;
    } else if (!this.canvasElement) {
      this.canvasElement = document.getElementById('outputCanvas');
    }

    if (!this.canvasElement) {
      throw new Error('Canvas element (#outputCanvas) not found in DOM.');
    }

    if (this.core && this.status !== EMULATOR_STATUS.ERROR) {
      return { supported: true, core: this.core };
    }

    this.lastError = null;
    this.status = EMULATOR_STATUS.INITIALIZING;
    this.notify('status_change');

    try {
      this.core = await initializePlayCore({
        canvasElement: this.canvasElement,
        useOffscreen: true,
        onLog: (msg) => this.log(msg),
        onError: (err) => {
          this.log(`Core Error: ${err}`);
          this.lastError = err;
          this.status = EMULATOR_STATUS.ERROR;
          this.notify('error', { error: err });
        },
      });

      this.status = EMULATOR_STATUS.READY;
      this.lastError = null;
      this.log('Play! PS2 WebAssembly core initialized and ready.');
      this.notify('status_change');
      return { supported: true, core: this.core };
    } catch (err) {
      this.lastError = err.message || String(err);
      this.status = EMULATOR_STATUS.ERROR;
      this.log(`Core initialization failed: ${err.message}`);
      this.notify('error', { error: err.message });
      throw err;
    }
  }

  // Alias for backward compatibility
  async init(canvasElement = null) {
    return this.initialize(canvasElement);
  }

  /**
   * Loads a game file (ELF executable or ISO/BIN/CHD/CSO disc image)
   * into the emulator's filesystem without starting execution yet.
   */
  async loadGame(gameEntry, fileOrBlob, targetCanvas = null) {
    if (!this.core) {
      await this.initialize(targetCanvas);
    }

    if (!fileOrBlob) {
      throw new Error(`File is required to load game "${gameEntry.title}".`);
    }

    this.status = EMULATOR_STATUS.LOADING_GAME;
    this.currentGame = gameEntry;
    this.currentFile = fileOrBlob;
    this.notify('status_change');

    this.log(`Mounting "${gameEntry.title}" (${gameEntry.filename}, ${(fileOrBlob.size / (1024 * 1024)).toFixed(2)} MB)...`);

    const fileName = gameEntry.filename || fileOrBlob.name;
    const isElf = fileName.toLowerCase().endsWith('.elf');

    try {
      if (isElf) {
        this.log('Staging ELF executable into WebAssembly virtual file system...');
        const buffer = await fileOrBlob.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Stage ELF in Emscripten MEMFS
        const stream = this.core.FS.open(fileName, 'w+');
        this.core.FS.write(stream, data, 0, data.length, 0);
        this.core.FS.close(stream);
        this.log(`✓ Staged ELF: ${fileName} (${data.byteLength} bytes)`);
      } else {
        this.log('Connecting disc image to streaming virtual block device...');
        this.core.discImageDevice.setFile(fileOrBlob);
        this.log(`✓ Disc mounted: ${fileName} (${fileOrBlob.size} bytes)`);
      }

      return { supported: true, game: gameEntry, file: fileOrBlob, isElf };
    } catch (err) {
      this.lastError = err.message || String(err);
      this.status = EMULATOR_STATUS.ERROR;
      this.log(`Game loading failed: ${err.message}`);
      this.notify('error', { error: err.message });
      throw err;
    }
  }

  /**
   * Starts game execution in the Play! WebAssembly core
   * Only transitions to RUNNING once the core method confirms launch.
   */
  async start() {
    if (!this.core || !this.currentGame || !this.currentFile) {
      throw new Error('No game is currently loaded. Call loadGame() first.');
    }

    const fileName = this.currentGame.filename || this.currentFile.name;
    const isElf = fileName.toLowerCase().endsWith('.elf');

    try {
      if (isElf) {
        this.log(`Starting execution of ELF binary: ${fileName}...`);
        if (typeof this.core.bootElf === 'function') {
          this.core.bootElf(fileName);
        } else {
          throw new Error('bootElf function not exposed by WebAssembly core.');
        }
      } else {
        this.log(`Booting PlayStation 2 disc image: ${fileName}...`);
        if (typeof this.core.bootDiscImage === 'function') {
          this.core.bootDiscImage(fileName);
        } else {
          throw new Error('bootDiscImage function not exposed by WebAssembly core.');
        }
      }

      // Transition to RUNNING only after successful core boot dispatch
      this.lastError = null;
      this.status = EMULATOR_STATUS.RUNNING;
      this.startMetrics();
      this.startSessionTimer();
      this.log(`✓ "${this.currentGame.title}" is now running in WebAssembly core.`);
      this.notify('status_change');

      return { supported: true, game: this.currentGame };
    } catch (err) {
      this.lastError = err.message || String(err);
      this.status = EMULATOR_STATUS.ERROR;
      this.log(`Emulation start failed: ${err.message}`);
      this.notify('error', { error: err.message });
      throw err;
    }
  }

  /**
   * High-level helper: initializes core, mounts game, and boots execution
   */
  async bootGame(gameEntry, fileOrBlob, targetCanvas = null) {
    await this.loadGame(gameEntry, fileOrBlob, targetCanvas);
    return await this.start();
  }

  /**
   * Pauses emulation session
   */
  pause() {
    if (this.status !== EMULATOR_STATUS.RUNNING) {
      return { supported: false, error: 'NOT_RUNNING' };
    }
    this.status = EMULATOR_STATUS.PAUSED;
    this.stopMetrics();
    this.pauseSessionTimer();
    this.log('Emulation paused.');
    this.notify('status_change');
    return { supported: true };
  }

  /**
   * Resumes emulation session
   */
  resume() {
    if (this.status !== EMULATOR_STATUS.PAUSED) {
      return { supported: false, error: 'NOT_PAUSED' };
    }
    this.status = EMULATOR_STATUS.RUNNING;
    this.startMetrics();
    this.startSessionTimer();
    this.log('Emulation resumed.');
    this.notify('status_change');
    return { supported: true };
  }

  /**
   * Resets virtual machine and reboots the active game
   */
  async reset() {
    if (this.currentGame && this.currentFile) {
      this.log('Resetting virtual machine and restarting current title...');
      this.stop();
      return await this.bootGame(this.currentGame, this.currentFile, this.canvasElement);
    }
    return { supported: false, error: 'NO_ACTIVE_GAME' };
  }

  /**
   * Stops the current emulation session
   */
  stop() {
    if (this.status === EMULATOR_STATUS.NOT_INITIALIZED || this.status === EMULATOR_STATUS.STOPPED) {
      return { supported: true };
    }
    this.log('Stopping current emulation session...');
    this.stopMetrics();
    this.stopSessionTimer();
    this.currentGame = null;
    this.currentFile = null;
    this.status = EMULATOR_STATUS.STOPPED;
    this.notify('status_change');
    return { supported: true };
  }

  /**
   * Disposes emulator instance and resets adapter
   */
  dispose() {
    this.stop();
    this.core = null;
    this.status = EMULATOR_STATUS.NOT_INITIALIZED;
    this.notify('status_change');
    return { supported: true };
  }

  /**
   * Save State — clearly returns NOT_SUPPORTED if core doesn't expose it
   */
  saveState(slot = 0) {
    this.log('Save-state requested: Play! WebAssembly core utilizes native 8MB Memory Cards.');
    return {
      supported: false,
      result: 'NOT_SUPPORTED',
      message: 'The Play! WebAssembly build does not expose save-state memory snapshots. Native PS2 in-game saves are fully supported via the 8MB Memory Cards.',
    };
  }

  /**
   * Load State — clearly returns NOT_SUPPORTED if core doesn't expose it
   */
  loadState(slot = 0) {
    this.log('Load-state requested: Play! WebAssembly core utilizes native 8MB Memory Cards.');
    return {
      supported: false,
      result: 'NOT_SUPPORTED',
      message: 'The Play! WebAssembly build does not expose save-state memory snapshots. Native PS2 in-game saves are fully supported via the 8MB Memory Cards.',
    };
  }

  startMetrics() {
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    const loop = (timestamp) => {
      if (this.status !== EMULATOR_STATUS.RUNNING) return;

      this.frameCount++;
      const elapsed = timestamp - this.lastFpsUpdate;

      if (elapsed >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastFpsUpdate = timestamp;
        this.notify('fps_update', { fps: this.fps });
      }

      this.fpsAnimationId = requestAnimationFrame(loop);
    };

    this.fpsAnimationId = requestAnimationFrame(loop);
  }

  stopMetrics() {
    if (this.fpsAnimationId) {
      cancelAnimationFrame(this.fpsAnimationId);
      this.fpsAnimationId = null;
    }
    this.fps = 0;
  }

  startSessionTimer() {
    if (this.sessionTimerId) clearInterval(this.sessionTimerId);
    this.sessionStartTime = Date.now();
    this.sessionTimerId = setInterval(() => {
      this.sessionElapsedSeconds++;
      if (this.sessionElapsedSeconds % 10 === 0 && this.currentGame) {
        updateGameStats(this.currentGame.id, 10).catch(console.error);
      }
      this.notify('session_tick', { elapsedSeconds: this.sessionElapsedSeconds });
    }, 1000);
  }

  pauseSessionTimer() {
    if (this.sessionTimerId) {
      clearInterval(this.sessionTimerId);
      this.sessionTimerId = null;
    }
  }

  stopSessionTimer() {
    this.pauseSessionTimer();
    if (this.currentGame && this.sessionElapsedSeconds > 0) {
      updateGameStats(this.currentGame.id, this.sessionElapsedSeconds % 10).catch(console.error);
    }
    this.sessionElapsedSeconds = 0;
  }

  /**
   * Reads virtual memory card data from Emscripten MEMFS
   */
  getMemoryCardData(slot = 1) {
    if (!this.core || !this.core.FS) return null;
    const path = `/work/Memorycards/Memorycard${slot}.bin`;
    try {
      const data = this.core.FS.readFile(path);
      return new Uint8Array(data);
    } catch {
      return null;
    }
  }

  /**
   * Writes virtual memory card data to Emscripten MEMFS
   */
  writeMemoryCardData(slot = 1, uint8Data) {
    if (!this.core || !this.core.FS) return false;
    try {
      try {
        this.core.FS.mkdir('/work/Memorycards');
      } catch {}
      const path = `/work/Memorycards/Memorycard${slot}.bin`;
      this.core.FS.writeFile(path, uint8Data);
      this.log(`Memory card written to Slot ${slot} (${uint8Data.byteLength} bytes).`);
      return true;
    } catch (err) {
      console.error('Failed to write memory card:', err);
      return false;
    }
  }
}

export const emulatorAdapter = new EmulatorAdapter();
