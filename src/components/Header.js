/**
 * Header Component for NusaPS2
 */
import { icons } from '../utils/icons.js';
import { appState } from '../app/state.js';
import { gamepadManager } from '../controllers/GamepadManager.js';
import { checkBrowserEnvironment } from '../emulator/EmulatorLoader.js';

export function renderHeader() {
  const currentTab = appState.activeTab;
  const env = checkBrowserEnvironment();
  const gamepads = gamepadManager.connectedGamepads;

  const titles = {
    dashboard: { main: 'Console Dashboard', sub: 'System Overview & Quick Launch' },
    library: { main: 'PlayStation 2 Library', sub: 'Installed Games, Disc Images & Homebrew' },
    emulator: { main: 'WebAssembly Emulator', sub: 'Play! Core Embedded Gameplay Viewport' },
    controllers: { main: 'Controllers & Input', sub: 'Gamepad API & DualShock 2 Button Mapping' },
    savedata: { main: 'Memory Cards & Saves', sub: 'Dual 8MB Virtual Cards & Backup Manager' },
    settings: { main: 'System Settings', sub: 'Graphics, Audio, Core & Interface Preferences' },
    diagnostics: { main: 'System Diagnostics', sub: 'Browser Runtime & WebAssembly Environment Audit' },
    about: { main: 'About NusaPS2', sub: 'Hardware Architecture, Open Source & Compliance' },
  };

  const titleInfo = titles[currentTab] || { main: 'NusaPS2', sub: 'PlayStation 2 Browser System' };

  return `
    <header class="h-20 border-b border-white/5 bg-[#070913]/80 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 class="text-xl font-bold font-['Rajdhani'] tracking-wide text-white flex items-center gap-2">
          ${titleInfo.main}
        </h1>
        <p class="text-xs text-slate-400 font-medium">${titleInfo.sub}</p>
      </div>

      <div class="flex items-center gap-2.5 sm:gap-3">
        <!-- Star on GitHub Button -->
        <a href="https://github.com/tarisusdev/NusaPS2" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="btn-press flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-semibold shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)] transition-all cursor-pointer group"
           title="Star NusaPS2 on GitHub">
          <span class="text-yellow-400 group-hover:scale-110 transition-transform">${icons.star}</span>
          <span class="hidden sm:inline font-['Rajdhani'] tracking-wider uppercase font-bold text-[11px]">Star on GitHub</span>
        </a>

        <!-- Diagnostic Status Badges -->
        <div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-['JetBrains_Mono']">
          <span class="flex items-center gap-1.5 ${env.hasSharedArrayBuffer ? 'text-emerald-400' : 'text-amber-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${env.hasSharedArrayBuffer ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
            ${env.hasSharedArrayBuffer ? 'SAB READY' : 'COOP/COEP'}
          </span>
          <span class="text-white/20">|</span>
          <span class="flex items-center gap-1.5 ${env.hasWebGL2 ? 'text-cyan-400' : 'text-red-400'}">
            <span class="w-1.5 h-1.5 rounded-full ${env.hasWebGL2 ? 'bg-cyan-400' : 'bg-red-400'}"></span>
            WebGL2
          </span>
        </div>

        <!-- Controller Quick Indicator -->
        <a href="#controllers" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/40 text-xs text-slate-300 transition-all font-['JetBrains_Mono']">
          <span class="${gamepads.size > 0 ? 'text-purple-400' : 'text-slate-500'}">
            ${icons.controller}
          </span>
          <span>${gamepads.size > 0 ? `${gamepads.size} Gamepad` : 'No Pad'}</span>
        </a>

        <!-- Quick Import Button -->
        <button id="btn-header-import" class="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
          ${icons.plus}
          <span class="hidden sm:inline">Import Game</span>
          <span class="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  `;
}
