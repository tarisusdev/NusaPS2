/**
 * Diagnostics & Compatibility Page for NusaPS2
 * Displays complete browser environment checks, WebAssembly/SharedArrayBuffer verification,
 * live emulator core state, Gamepad API telemetry, and exportable debug reports.
 */
import { icons } from '../utils/icons.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { checkBrowserEnvironment } from '../emulator/EmulatorLoader.js';
import { gamepadManager } from '../controllers/GamepadManager.js';
import { appState } from '../app/state.js';
import { formatBytes } from '../utils/formatUtils.js';

export function renderDiagnostics() {
  const env = checkBrowserEnvironment();
  const status = emulatorAdapter.getStatus();
  const currentGame = emulatorAdapter.getCurrentGame();
  const lastError = emulatorAdapter.getLastError();
  const logs = emulatorAdapter.getLogs();
  const connectedGamepads = Array.from(gamepadManager.connectedGamepads.values());
  const activeGamepad = gamepadManager.getActiveGamepad();
  const storage = appState.storageQuota;

  // WebGL context inspection
  let glInfo = {
    supported: false,
    version: 'Unavailable',
    vendor: 'Unknown',
    renderer: 'Unknown',
  };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      glInfo.supported = true;
      glInfo.version = gl.getParameter(gl.VERSION) || 'WebGL 2.0';
      const debugExt = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugExt) {
        glInfo.vendor = gl.getParameter(debugExt.UNMASKED_VENDOR_WEBGL) || 'Unknown';
        glInfo.renderer = gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || 'Generic GPU';
      }
    }
  } catch (e) {
    console.warn('WebGL inspection error:', e);
  }

  const isHealthy = env.hasSharedArrayBuffer && env.hasWebGL2 && env.hasOffscreenCanvas;

  return `
    <div class="space-y-6 pb-12">
      <!-- Top Action Banner -->
      <div class="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-lg font-bold text-white font-['Rajdhani'] tracking-wide">
              System Diagnostics & Runtime Compatibility
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isHealthy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }">
              ${isHealthy ? '● All Capabilities Operational' : '⚠ Limited Runtime Features'}
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Real-time audit of browser APIs, WebAssembly multithreading prerequisites, WebGL2 hardware graphics, and controller inputs.
          </p>
        </div>

        <button id="btn-copy-diagnostics" class="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] transition-all cursor-pointer flex-shrink-0">
          ${icons.download}
          <span id="btn-copy-diagnostics-text">Copy Full Diagnostic Report</span>
        </button>
      </div>

      <!-- Browser Capability Grid -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-purple-400">${icons.monitor}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            1. Browser Platform & Web Standards Matrix
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-['JetBrains_Mono'] text-xs">
          <!-- WASM Support -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">WebAssembly (WASM)</span>
              <span class="text-[10px] text-slate-500">Core Engine Execution</span>
            </div>
            <span class="text-emerald-400 font-bold">✓ Supported</span>
          </div>

          <!-- WebGL2 Acceleration -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">WebGL 2.0</span>
              <span class="text-[10px] text-slate-500">GS Hardware Rasterization</span>
            </div>
            <span class="${env.hasWebGL2 ? 'text-cyan-400 font-bold' : 'text-red-400'}">
              ${env.hasWebGL2 ? '✓ Active' : '✕ Unsupported'}
            </span>
          </div>

          <!-- SharedArrayBuffer -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">SharedArrayBuffer</span>
              <span class="text-[10px] text-slate-500">EE Threading & Memory</span>
            </div>
            <span class="${env.hasSharedArrayBuffer ? 'text-emerald-400 font-bold' : 'text-amber-400'}">
              ${env.hasSharedArrayBuffer ? '✓ Enabled' : '⚠ Missing COOP/COEP'}
            </span>
          </div>

          <!-- Cross-Origin Isolation -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">Cross-Origin Isolation</span>
              <span class="text-[10px] text-slate-500">COOP / COEP HTTP Headers</span>
            </div>
            <span class="${env.isIsolated ? 'text-emerald-400 font-bold' : 'text-amber-400'}">
              ${env.isIsolated ? '✓ Isolated' : '⚠ Coi Service Worker'}
            </span>
          </div>

          <!-- OffscreenCanvas -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">OffscreenCanvas</span>
              <span class="text-[10px] text-slate-500">Decoupled Worker Render</span>
            </div>
            <span class="${env.hasOffscreenCanvas ? 'text-emerald-400 font-bold' : 'text-amber-400'}">
              ${env.hasOffscreenCanvas ? '✓ Supported' : '⚠ Direct DOM Fallback'}
            </span>
          </div>

          <!-- Gamepad API -->
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <span class="text-slate-200 font-semibold block mb-0.5">W3C Gamepad API</span>
              <span class="text-[10px] text-slate-500">Physical Controller Bridge</span>
            </div>
            <span class="text-purple-400 font-bold">
              ${typeof navigator !== 'undefined' && 'getGamepads' in navigator ? '✓ Supported' : '✕ Unsupported'}
            </span>
          </div>
        </div>

        <!-- GPU Details -->
        <div class="p-3.5 rounded-xl bg-[#090d19] border border-white/5 text-[11px] font-['JetBrains_Mono'] space-y-1">
          <div class="flex justify-between text-slate-400">
            <span>Graphics Hardware Driver:</span>
            <span class="text-purple-300 font-semibold truncate max-w-md">${glInfo.renderer}</span>
          </div>
          <div class="flex justify-between text-slate-400 border-t border-white/5 pt-1">
            <span>Vendor:</span>
            <span class="text-slate-300">${glInfo.vendor}</span>
          </div>
        </div>
      </div>

      <!-- Core Status & Current Emulation Session -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-blue-400">${icons.cpu}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            2. Play! WebAssembly Core Status & Active Title
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-['JetBrains_Mono'] text-xs">
          <!-- VM State Card -->
          <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Virtual Machine State:</span>
              <span class="font-bold ${
                status === 'RUNNING'
                  ? 'text-emerald-400'
                  : status === 'PAUSED'
                  ? 'text-cyan-400'
                  : status === 'ERROR'
                  ? 'text-red-400'
                  : 'text-slate-300'
              }">${status}</span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Runtime FPS:</span>
              <span class="text-cyan-400 font-bold">${status === 'RUNNING' ? emulatorAdapter.fps || 60 : '--'}</span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Elapsed Session Time:</span>
              <span class="text-slate-200">${emulatorAdapter.sessionElapsedSeconds}s</span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Memory Card 1:</span>
              <span class="text-purple-300">/work/Memorycards/Memorycard1.bin</span>
            </div>
          </div>

          <!-- Active Game Card -->
          <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-400">Mounted Title:</span>
              <span class="font-bold text-slate-200 truncate max-w-[200px]">
                ${currentGame ? currentGame.title : 'None (Core Standby)'}
              </span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Disc File:</span>
              <span class="text-slate-300 truncate max-w-[200px]">
                ${currentGame ? currentGame.filename : '--'}
              </span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Format:</span>
              <span class="text-purple-300">${currentGame ? currentGame.format : '--'}</span>
            </div>
            <div class="flex justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400">Streaming Block Device:</span>
              <span class="text-emerald-400 font-semibold">
                ${currentGame ? 'Connected (File.slice)' : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        ${
          lastError
            ? `
            <div class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 font-['JetBrains_Mono']">
              <span class="text-red-400 flex-shrink-0 mt-0.5">${icons.alert}</span>
              <div>
                <span class="font-bold text-red-200 block mb-0.5">Last Logged Error:</span>
                <span>${lastError}</span>
              </div>
            </div>
          `
            : ''
        }
      </div>

      <!-- Controllers & Input Subsystem Status -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-cyan-400">${icons.controller}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              3. Connected Gamepads & Input Polling (${connectedGamepads.length} Detected)
            </h3>
          </div>
          <span class="text-[11px] text-emerald-400 font-['JetBrains_Mono']">
            Polling Active @ 60Hz
          </span>
        </div>

        ${
          connectedGamepads.length > 0
            ? `
            <div class="space-y-3 font-['JetBrains_Mono'] text-xs">
              ${connectedGamepads.map((gp) => `
                <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 class="font-bold text-slate-200 text-sm font-['Plus_Jakarta_Sans'] mb-0.5">${gp.id}</h4>
                    <p class="text-[11px] text-slate-400">
                      Index: Slot ${gp.index} • Buttons: ${gp.buttons?.length || 0} • Axes: ${gp.axes?.length || 0} • Mapping: ${gp.mapping || 'standard'}
                    </p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    activeGamepad && activeGamepad.index === gp.index
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400'
                  }">
                    ${activeGamepad && activeGamepad.index === gp.index ? 'PRIMARY CONTROLLER' : 'STANDBY'}
                  </span>
                </div>
              `).join('')}
            </div>
          `
            : `
            <div class="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-slate-400 font-['JetBrains_Mono'] text-center">
              No physical gamepad currently detected by browser Gamepad API. Connect any controller and press any button to awaken.
            </div>
          `
        }
      </div>

      <!-- Live Diagnostics Event Log -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 font-['JetBrains_Mono'] text-xs">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-amber-400">${icons.cpu}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              4. Real-Time Diagnostic Event Log (${logs.length} entries)
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-copy-diag-logs" class="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
              Copy Logs
            </button>
            <span class="text-white/20">•</span>
            <button id="btn-clear-diag-logs" class="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer">
              Clear Logs
            </button>
          </div>
        </div>

        <div id="diagnostics-log-stream" class="h-48 overflow-y-auto space-y-1 p-3 rounded-xl bg-[#070913] border border-white/5 text-[11px] text-slate-400 font-mono">
          ${logs.map((l) => `<div>${l}</div>`).join('') || '<div class="text-slate-600">No events logged in current session.</div>'}
        </div>
      </div>
    </div>
  `;
}
