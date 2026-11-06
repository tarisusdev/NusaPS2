/**
 * Emulator Page for NusaPS2
 */
import { renderEmulatorPlayer } from '../components/EmulatorPlayer.js';
import { appState } from '../app/state.js';
import { icons } from '../utils/icons.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { formatBytes } from '../utils/formatUtils.js';

export function renderEmulator() {
  const games = appState.games;
  const currentGame = emulatorAdapter.getCurrentGame();

  return `
    <div class="space-y-6 pb-12">
      <!-- Embedded Real WebAssembly Viewport & Toolbar -->
      ${renderEmulatorPlayer()}

      <!-- Quick Switcher Bar -->
      <div class="glass-panel rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-white/5 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-purple-400">${icons.library}</span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              Quick Game Switcher (${games.length} Available)
            </h3>
          </div>
          <a href="#library" class="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Manage Full Library &rarr;
          </a>
        </div>

        <div class="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          ${games.map((g) => {
            const isCurrent = currentGame && currentGame.id === g.id;
            return `
              <button class="btn-quick-switch-game flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border cursor-pointer ${
                isCurrent
                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
              }" data-id="${g.id}">
                <div class="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-bold font-['Rajdhani'] text-purple-400">
                  ${g.format || 'PS2'}
                </div>
                <div class="max-w-[140px]">
                  <p class="text-xs font-semibold truncate leading-tight">${g.title}</p>
                  <p class="text-[10px] text-slate-500 font-['JetBrains_Mono']">${formatBytes(g.size)}</p>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Quick Controller Reference Box -->
      <div class="glass-panel rounded-2xl p-5 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-['JetBrains_Mono']">
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="text-blue-400 font-semibold block mb-1">Actions</span>
          <p class="text-slate-300 text-[11px]">✕: Z • ○: X • □: A • △: S</p>
        </div>
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="text-purple-400 font-semibold block mb-1">D-Pad</span>
          <p class="text-slate-300 text-[11px]">Arrow Keys (↑ ↓ ← →)</p>
        </div>
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="text-cyan-400 font-semibold block mb-1">Analog Sticks</span>
          <p class="text-slate-300 text-[11px]">Left: F, H, T, G • Right: J, L, I, K</p>
        </div>
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="text-emerald-400 font-semibold block mb-1">Shoulders & System</span>
          <p class="text-slate-300 text-[11px]">L1/R1: 1, 8 • Start: Enter</p>
        </div>
      </div>
    </div>
  `;
}
