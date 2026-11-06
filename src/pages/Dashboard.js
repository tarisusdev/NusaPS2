/**
 * Dashboard Page for NusaPS2
 */
import { icons } from '../utils/icons.js';
import { appState } from '../app/state.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { gamepadManager } from '../controllers/GamepadManager.js';
import { formatBytes } from '../utils/formatUtils.js';
import { renderGameCard } from '../components/GameCard.js';

export function renderDashboard() {
  const games = appState.games;
  const status = emulatorAdapter.getStatus();
  const currentGame = emulatorAdapter.getCurrentGame();
  const gamepads = gamepadManager.connectedGamepads;
  const storage = appState.storageQuota;

  // Filter recently added
  const recentlyAdded = [...games].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 4);

  return `
    <div class="space-y-8 pb-12">
      <!-- Welcome Hero Banner -->
      <div class="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#141b34] via-[#0d1224] to-[#181130] p-8 ps2-glow-shadow">
        <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 font-['JetBrains_Mono']">
            <span>PlayStation 2 Browser Runtime</span>
            <span>•</span>
            <span>WebAssembly 64-bit</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-extrabold text-white font-['Rajdhani'] tracking-wide leading-tight mb-3">
            Welcome to <span class="ps2-gradient-text">NusaPS2 Console</span>
          </h1>

          <p class="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
            PlayStation 2 WebAssembly emulation running entirely in client-side desktop browsers. Load ISO, BIN, CHD, CSO, or ELF files directly from your local storage without cloud uploads.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <button id="btn-hero-launch-sample" class="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
              ${icons.play}
              <span>${status === 'RUNNING' ? 'Return to Running Game' : 'Quick Launch wLaunchELF'}</span>
            </button>

            <button id="btn-hero-import" class="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer">
              ${icons.upload}
              <span>Import PS2 Game File</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Games in Library -->
        <div class="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-medium mb-1">Installed Games</p>
            <h3 class="text-2xl font-bold text-white font-['Rajdhani']">${games.length}</h3>
            <p class="text-[11px] text-purple-400 font-['JetBrains_Mono'] mt-1">IndexedDB Stored</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            ${icons.library}
          </div>
        </div>

        <!-- Emulator Core Status -->
        <div class="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-medium mb-1">Core Engine</p>
            <h3 class="text-xl font-bold text-white font-['Rajdhani'] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}"></span>
              ${status === 'RUNNING' ? 'Emulating' : 'Play! Core'}
            </h3>
            <p class="text-[11px] text-slate-400 font-['JetBrains_Mono'] mt-1">
              ${status === 'RUNNING' && currentGame ? currentGame.title.substring(0, 16) + '...' : 'HLE BIOS Active'}
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            ${icons.cpu}
          </div>
        </div>

        <!-- Controller Status -->
        <div class="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-medium mb-1">Controllers</p>
            <h3 class="text-xl font-bold text-white font-['Rajdhani']">
              ${gamepads.size > 0 ? `${gamepads.size} Connected` : 'Keyboard Mode'}
            </h3>
            <p class="text-[11px] ${gamepads.size > 0 ? 'text-emerald-400' : 'text-slate-400'} font-['JetBrains_Mono'] mt-1">
              ${gamepads.size > 0 ? 'Gamepad API Active' : 'Arrow keys + Action keys'}
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            ${icons.controller}
          </div>
        </div>

        <!-- Storage Quota -->
        <div class="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400 font-medium mb-1">Local Storage</p>
            <h3 class="text-2xl font-bold text-white font-['Rajdhani']">${formatBytes(storage.usage || 0)}</h3>
            <p class="text-[11px] text-slate-400 font-['JetBrains_Mono'] mt-1">
              Quota: ${formatBytes(storage.quota || 0, 0)}
            </p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            ${icons.harddrive}
          </div>
        </div>
      </div>

      <!-- Quick Launch & Recently Added -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white font-['Rajdhani'] tracking-wide">Quick Launch</h2>
            <p class="text-xs text-slate-400">Jump right back into your PlayStation 2 library</p>
          </div>
          <a href="#library" class="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors">
            <span>View All (${games.length})</span>
            <span>&rarr;</span>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${recentlyAdded.map((game) => renderGameCard(game)).join('')}
        </div>
      </div>

      <!-- PS2 Hardware Architecture Sheet -->
      <div class="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-purple-400">${icons.monitor}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              PlayStation 2 Virtual Subsystems Overview
            </h3>
          </div>
          <span class="text-[11px] text-slate-500 font-['JetBrains_Mono']">Hardware Target: SCPH-39000</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-['JetBrains_Mono'] text-xs">
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span class="text-purple-400 font-bold">Emotion Engine (EE)</span>
            <p class="text-slate-300 text-[11px]">MIPS III R5900 128-bit Core @ 294.912 MHz</p>
            <p class="text-[10px] text-slate-500">Vector Units VU0 & VU1, 32MB Direct RDRAM</p>
          </div>

          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span class="text-blue-400 font-bold">Graphics Synthesizer (GS)</span>
            <p class="text-slate-300 text-[11px]">Parallel Rendering Engine @ 147.456 MHz</p>
            <p class="text-[10px] text-slate-500">4MB Embedded eDRAM, 48Gb/s bandwidth</p>
          </div>

          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span class="text-emerald-400 font-bold">Sound Processor (SPU2)</span>
            <p class="text-slate-300 text-[11px]">48 ADPCM Voice Channels @ 44.1/48 kHz</p>
            <p class="text-[10px] text-slate-500">2MB Sound RAM with Reverb & Echo DSP</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
