/**
 * Emulator Player Component for NusaPS2
 * Dedicated PlayStation 2 gameplay screen embedding the real Play! WebAssembly Canvas,
 * verified controls, responsive viewport with aspect ratio support, runtime error banner,
 * and performance metrics.
 */
import { icons } from '../utils/icons.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { appState } from '../app/state.js';
import { checkBrowserEnvironment } from '../emulator/EmulatorLoader.js';

export function renderEmulatorPlayer() {
  const status = emulatorAdapter.getStatus();
  const currentGame = emulatorAdapter.getCurrentGame();
  const env = checkBrowserEnvironment();
  const settings = appState.settings;
  const lastError = emulatorAdapter.getLastError();

  return `
    <div class="space-y-4">
      <!-- Runtime Error Banner (if error occurred) -->
      <div id="player-error-banner" class="${lastError || status === 'ERROR' ? 'flex' : 'hidden'} items-start justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 animate-fade-in">
        <div class="flex items-start gap-3">
          <span class="text-red-400 flex-shrink-0 mt-0.5">${icons.alert}</span>
          <div class="space-y-1">
            <h4 class="font-bold text-red-200 font-['Rajdhani'] text-sm tracking-wide">Emulator Core Error Encountered</h4>
            <p id="player-error-message" class="text-[11px] font-['JetBrains_Mono'] text-red-300/90 leading-relaxed">
              ${lastError || 'An unexpected error occurred during WebAssembly execution or disc mounting.'}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button id="btn-copy-player-error" class="btn-press px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-[11px] font-semibold transition-all cursor-pointer">
            Copy Error
          </button>
          <button id="btn-dismiss-player-error" class="btn-press p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-red-300 hover:text-white transition-all cursor-pointer" title="Dismiss">
            ${icons.close}
          </button>
        </div>
      </div>

      <!-- Emulator Controls Toolbar -->
      <div class="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <!-- Left: Return to Library & Game Info -->
        <div class="flex items-center gap-3">
          <!-- Return to Library Action -->
          <a href="#library" class="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 text-xs font-semibold transition-all flex-shrink-0" title="Return to Game Library">
            ${icons.library}
            <span class="hidden sm:inline">Library</span>
          </a>

          <div class="h-6 w-px bg-white/10"></div>

          <!-- Game Title & Status -->
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              ${icons.disc}
            </div>
            <div>
              <h2 id="player-game-title" class="text-sm font-bold text-white line-clamp-1 font-['Rajdhani'] tracking-wide">
                ${currentGame ? currentGame.title : 'Play! WebAssembly Core (Standby)'}
              </h2>
              <div class="flex items-center gap-2 text-[11px] font-['JetBrains_Mono']">
                <span id="player-status-badge" class="flex items-center gap-1.5 ${
                  status === 'RUNNING'
                    ? 'text-emerald-400'
                    : status === 'INITIALIZING' || status === 'LOADING_GAME'
                    ? 'text-amber-400'
                    : status === 'PAUSED'
                    ? 'text-cyan-400'
                    : 'text-slate-400'
                }">
                  <span id="player-status-dot" class="w-1.5 h-1.5 rounded-full ${
                    status === 'RUNNING'
                      ? 'bg-emerald-400 animate-pulse'
                      : status === 'PAUSED'
                      ? 'bg-cyan-400'
                      : status === 'INITIALIZING' || status === 'LOADING_GAME'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-500'
                  }"></span>
                  <span id="player-status-text">${status}</span>
                </span>
                <span class="text-white/20">•</span>
                <span id="player-session-time" class="text-slate-400">00:00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Controls: Play, Pause, Reset, Stop -->
        <div class="flex items-center gap-2">
          <button id="btn-player-pause" class="btn-press ${status === 'RUNNING' ? 'flex' : 'hidden'} items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 text-xs font-semibold border border-white/5 transition-all cursor-pointer">
            ${icons.pause}
            <span>Pause</span>
          </button>

          <button id="btn-player-resume" class="btn-press ${status === 'RUNNING' ? 'hidden' : 'flex'} items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] transition-all cursor-pointer">
            ${icons.play}
            <span id="btn-resume-label">${status === 'PAUSED' ? 'Resume' : 'Start Core'}</span>
          </button>

          <button id="btn-player-reset" class="btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer" title="Reset Virtual Machine">
            ${icons.refresh}
          </button>

          <button id="btn-player-stop" class="btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/5 transition-all cursor-pointer ${status === 'RUNNING' || status === 'PAUSED' ? 'flex' : 'hidden'}" title="Stop Game & Return to Standby">
            ${icons.stop}
          </button>
        </div>

        <!-- Right Side: Performance, Aspect Ratio, Scanlines, Logs, Fullscreen -->
        <div class="flex items-center gap-2.5 font-['JetBrains_Mono'] text-xs">
          <!-- Real FPS Display -->
          <div class="px-3 py-1.5 rounded-xl bg-[#090d19] border border-white/5 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">FPS</span>
            <span id="player-fps-counter" class="text-cyan-400 font-bold font-mono">
              ${status === 'RUNNING' ? emulatorAdapter.fps || '60' : '--'}
            </span>
          </div>

          <!-- Aspect Ratio Toggle: 4:3, 16:9, Auto, Fill -->
          <select id="select-aspect-ratio" class="px-2.5 py-1.5 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500">
            <option value="16:9" ${settings.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Widescreen)</option>
            <option value="4:3" ${settings.aspectRatio === '4:3' ? 'selected' : ''}>4:3 (PS2 CRT)</option>
            <option value="fill" ${settings.aspectRatio === 'fill' ? 'selected' : ''}>Fill / Stretch</option>
          </select>

          <!-- Scanlines Toggle -->
          <button id="btn-toggle-scanlines" class="btn-press p-2 rounded-xl ${settings.enableScanlines ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-white/[0.04] text-slate-400 border border-white/5'} transition-all cursor-pointer" title="Toggle CRT Scanline Overlay">
            ${icons.monitor}
          </button>

          <!-- Toggle Log Drawer -->
          <button id="btn-toggle-logs" class="btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer" title="Toggle Core Debug Logs">
            ${icons.cpu}
          </button>

          <!-- Fullscreen Viewport -->
          <button id="btn-player-fullscreen" class="btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer" title="Fullscreen (F)">
            ${icons.maximize}
          </button>
        </div>
      </div>

      <!-- Main Responsive Viewport Container -->
      <div id="emulator-viewport-container" class="relative w-full rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl min-h-[480px] lg:min-h-[580px] group">
        <!-- Floating Exit Fullscreen Button (visible only in fullscreen) -->
        <button id="btn-exit-fullscreen" class="hidden absolute top-4 right-4 z-40 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold border border-white/20 backdrop-blur-md cursor-pointer transition-all">
          Exit Fullscreen
        </button>

        <!-- The Emscripten WebAssembly Canvas -->
        <!-- Play.wasm binds to '#outputCanvas' for WebGL2 context -->
        <canvas id="outputCanvas" width="640" height="448" tabindex="0" 
                class="transition-all duration-300 max-w-full max-h-full cursor-default ${
                  settings.aspectRatio === '16:9'
                    ? 'aspect-[16/9]'
                    : settings.aspectRatio === 'fill'
                    ? 'w-full h-full'
                    : 'aspect-[4/3]'
                }">
        </canvas>

        <!-- Scanlines effect overlay if enabled -->
        <div id="player-scanlines-layer" class="scanlines absolute inset-0 pointer-events-none z-10 ${settings.enableScanlines ? 'block' : 'hidden'}"></div>

        <!-- Standby / Welcome Screen if no game is running -->
        <div id="player-standby-screen" class="absolute inset-0 z-20 bg-gradient-to-b from-[#0a0d18] to-[#04060c] flex flex-col items-center justify-center p-8 text-center select-none ${status === 'RUNNING' || status === 'INITIALIZING' || status === 'LOADING_GAME' ? 'hidden' : ''}">
          <!-- Animated Glowing Disc Ring -->
          <div class="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin"></div>
            <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-900/40 via-blue-900/30 to-indigo-900/40 border border-white/10 flex items-center justify-center ps2-glow-shadow">
              <span class="font-['Rajdhani'] font-bold text-2xl text-blue-400">PS2</span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-white font-['Rajdhani'] tracking-wide mb-2">
            Ready to Emulate PlayStation 2
          </h3>
          <p class="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Powered by Play! WebAssembly core. Load your legally owned PS2 games (.ISO, .BIN, .CHD, .CSO, .ELF) or launch the built-in wLaunchELF shell.
          </p>

          ${
            !env.hasSharedArrayBuffer
              ? `
              <div class="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 max-w-lg text-left flex items-start gap-3">
                <span class="text-amber-400 flex-shrink-0 mt-0.5">${icons.alert}</span>
                <div class="space-y-1">
                  <p class="font-semibold">SharedArrayBuffer Initializing</p>
                  <p class="text-[11px] text-amber-300/80">
                    WebAssembly multithreading requires Cross-Origin Isolation (COOP/COEP). Click below to reload and activate the headers.
                  </p>
                  <button id="btn-reload-coi" class="mt-2 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-xs cursor-pointer">
                    Reload with COOP/COEP Isolation
                  </button>
                </div>
              </div>
            `
              : ''
          }

          <div class="flex flex-wrap items-center justify-center gap-3">
            <button id="btn-quick-launch-homebrew" class="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
              ${icons.play}
              <span>Boot wLaunchELF Homebrew</span>
            </button>

            <a href="#library" class="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/10 transition-all">
              ${icons.library}
              <span>Browse Game Library</span>
            </a>
          </div>
        </div>

        <!-- Loading spinner if initializing or mounting game -->
        <div id="player-loading-screen" class="absolute inset-0 z-30 bg-[#070913]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center ${status === 'INITIALIZING' || status === 'LOADING_GAME' ? '' : 'hidden'}">
          <div class="w-12 h-12 rounded-full border-3 border-purple-500/20 border-t-purple-400 animate-spin mb-4"></div>
          <h4 class="text-sm font-bold text-white font-['Rajdhani'] tracking-wider mb-1" id="player-loading-title">
            ${status === 'LOADING_GAME' ? 'Mounting Disc Image...' : 'Initializing Emotion Engine VM...'}
          </h4>
          <p class="text-xs text-slate-400 font-['JetBrains_Mono'] max-w-sm" id="player-loading-message">
            ${status === 'LOADING_GAME' ? 'Staging streaming virtual block device & verifying format' : 'Compiling WebAssembly binaries & mounting memory cards'}
          </p>
        </div>
      </div>

      <!-- Core Debug Log Drawer (Collapsible) -->
      <div id="core-log-drawer" class="hidden glass-panel rounded-2xl p-4 font-['JetBrains_Mono'] text-xs border border-white/10">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
          <div class="flex items-center gap-2 text-slate-300 font-semibold">
            ${icons.cpu}
            <span>WebAssembly Core Console Output</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-copy-logs" class="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
              Copy Logs
            </button>
            <span class="text-white/20">•</span>
            <button id="btn-clear-logs" class="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer">
              Clear Logs
            </button>
          </div>
        </div>
        <div id="core-log-content" class="h-40 overflow-y-auto space-y-1 text-slate-400 text-[11px]">
          ${emulatorAdapter.getLogs().map((l) => `<div>${l}</div>`).join('') || '<div class="text-slate-600">No logs generated yet.</div>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Updates emulator player overlay and indicators dynamically without destroying the canvas
 */
export function updateEmulatorPlayerUI() {
  const status = emulatorAdapter.getStatus();
  const game = emulatorAdapter.getCurrentGame();
  const lastError = emulatorAdapter.getLastError();

  const statusText = document.getElementById('player-status-text');
  if (statusText) statusText.textContent = status;

  const statusDot = document.getElementById('player-status-dot');
  if (statusDot) {
    statusDot.className = `w-1.5 h-1.5 rounded-full ${
      status === 'RUNNING'
        ? 'bg-emerald-400 animate-pulse'
        : status === 'PAUSED'
        ? 'bg-cyan-400'
        : status === 'INITIALIZING' || status === 'LOADING_GAME'
        ? 'bg-amber-400 animate-pulse'
        : status === 'ERROR'
        ? 'bg-red-400'
        : 'bg-slate-500'
    }`;
  }

  const statusBadge = document.getElementById('player-status-badge');
  if (statusBadge) {
    statusBadge.className = `flex items-center gap-1.5 ${
      status === 'RUNNING'
        ? 'text-emerald-400'
        : status === 'INITIALIZING' || status === 'LOADING_GAME'
        ? 'text-amber-400'
        : status === 'PAUSED'
        ? 'text-cyan-400'
        : status === 'ERROR'
        ? 'text-red-400'
        : 'text-slate-400'
    }`;
  }

  const gameTitle = document.getElementById('player-game-title');
  if (gameTitle) {
    gameTitle.textContent = game ? game.title : 'Play! WebAssembly Core (Standby)';
  }

  // Error Banner update
  const errorBanner = document.getElementById('player-error-banner');
  const errorMsg = document.getElementById('player-error-message');
  if (errorBanner && errorMsg) {
    if (lastError || status === 'ERROR') {
      errorBanner.classList.remove('hidden');
      errorBanner.classList.add('flex');
      errorMsg.textContent = lastError || 'An error occurred during emulation.';
    } else {
      errorBanner.classList.add('hidden');
      errorBanner.classList.remove('flex');
    }
  }

  // Standby overlay
  const standby = document.getElementById('player-standby-screen');
  if (standby) {
    if (status === 'RUNNING' || status === 'INITIALIZING' || status === 'LOADING_GAME') {
      standby.classList.add('hidden');
    } else {
      standby.classList.remove('hidden');
    }
  }

  // Loading overlay
  const loading = document.getElementById('player-loading-screen');
  const loadingTitle = document.getElementById('player-loading-title');
  const loadingMsg = document.getElementById('player-loading-message');
  if (loading) {
    if (status === 'INITIALIZING' || status === 'LOADING_GAME') {
      loading.classList.remove('hidden');
      if (loadingTitle) {
        loadingTitle.textContent = status === 'LOADING_GAME' ? 'Mounting Disc Image...' : 'Initializing Emotion Engine VM...';
      }
      if (loadingMsg) {
        loadingMsg.textContent = status === 'LOADING_GAME' ? 'Staging streaming virtual block device & verifying format' : 'Compiling WebAssembly binaries & mounting memory cards';
      }
    } else {
      loading.classList.add('hidden');
    }
  }

  // Pause / Resume buttons
  const pauseBtn = document.getElementById('btn-player-pause');
  const resumeBtn = document.getElementById('btn-player-resume');
  if (pauseBtn && resumeBtn) {
    if (status === 'RUNNING') {
      pauseBtn.classList.remove('hidden');
      pauseBtn.classList.add('flex');
      resumeBtn.classList.add('hidden');
      resumeBtn.classList.remove('flex');
    } else {
      pauseBtn.classList.add('hidden');
      pauseBtn.classList.remove('flex');
      resumeBtn.classList.remove('hidden');
      resumeBtn.classList.add('flex');
      const label = document.getElementById('btn-resume-label');
      if (label) label.textContent = status === 'PAUSED' ? 'Resume' : 'Start Core';
    }
  }

  // Stop button
  const stopBtn = document.getElementById('btn-player-stop');
  if (stopBtn) {
    if (status === 'RUNNING' || status === 'PAUSED') {
      stopBtn.classList.remove('hidden');
      stopBtn.classList.add('flex');
    } else {
      stopBtn.classList.add('hidden');
      stopBtn.classList.remove('flex');
    }
  }

  // FPS counter
  const fpsCounter = document.getElementById('player-fps-counter');
  if (fpsCounter && status !== 'RUNNING') {
    fpsCounter.textContent = '--';
  }
}
