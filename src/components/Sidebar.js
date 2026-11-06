/**
 * Sidebar Component for NusaPS2
 */
import { icons } from '../utils/icons.js';
import { appState } from '../app/state.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { gamepadManager } from '../controllers/GamepadManager.js';
import { formatBytes } from '../utils/formatUtils.js';

export function renderSidebar() {
  const currentTab = appState.activeTab;
  const status = emulatorAdapter.getStatus();
  const gamepads = gamepadManager.connectedGamepads;
  const storage = appState.storageQuota;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'library', label: 'Game Library', icon: icons.library, badge: appState.games.length },
    { id: 'emulator', label: 'Emulator Player', icon: icons.emulator, isLive: status === 'RUNNING' },
    { id: 'controllers', label: 'Controllers', icon: icons.controller, badge: gamepads.size > 0 ? `${gamepads.size}` : null },
    { id: 'savedata', label: 'Save Data', icon: icons.save },
    { id: 'settings', label: 'Settings', icon: icons.settings },
    { id: 'diagnostics', label: 'Diagnostics', icon: icons.cpu },
    { id: 'about', label: 'About NusaPS2', icon: icons.about },
  ];

  return `
    <aside class="w-64 flex-shrink-0 min-h-screen bg-[#0a0d18] border-r border-white/5 flex flex-col justify-between select-none">
      <div>
        <!-- Logo & Brand Header -->
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center ps2-glow-shadow">
              <span class="font-['Rajdhani'] font-bold text-xl text-white tracking-wider">PS2</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-['Rajdhani'] text-2xl font-bold tracking-wide text-white">NUSA<span class="text-blue-400">PS2</span></span>
              </div>
              <p class="text-[10px] tracking-wider uppercase text-purple-300/70 font-semibold font-['JetBrains_Mono']">WASM Core Engine</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-1.5" id="sidebar-nav">
          ${navItems.map((item) => {
            const isActive = currentTab === item.id;
            return `
              <a href="#${item.id}" 
                 data-tab="${item.id}"
                 class="nav-tab-link flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                   isActive
                     ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/10 text-white border border-purple-500/40 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)]'
                     : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                 }">
                <div class="flex items-center gap-3">
                  <span class="${isActive ? 'text-purple-400' : 'text-slate-400'}">
                    ${item.icon}
                  </span>
                  <span>${item.label}</span>
                </div>
                ${
                  item.isLive
                    ? `<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE
                       </span>`
                    : item.badge
                    ? `<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/10 font-['JetBrains_Mono']">
                        ${item.badge}
                       </span>`
                    : ''
                }
              </a>
            `;
          }).join('')}
        </nav>
      </div>

      <!-- Bottom Status & System Health -->
      <div class="p-4 border-t border-white/5 space-y-3">
        <!-- Core Status Pill -->
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${
              status === 'RUNNING'
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                : status === 'INITIALIZING'
                ? 'bg-amber-400 animate-pulse'
                : status === 'READY'
                ? 'bg-blue-400'
                : 'bg-slate-500'
            }"></span>
            <span class="text-slate-300 font-medium font-['JetBrains_Mono'] text-[11px]">
              ${status === 'RUNNING' ? 'VM RUNNING' : status === 'READY' ? 'CORE READY' : status}
            </span>
          </div>
          <span class="text-[10px] text-slate-500 font-['JetBrains_Mono']">Play! v0.58</span>
        </div>

        <!-- Storage Indicator -->
        <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <div class="flex justify-between text-[11px] text-slate-400 font-['JetBrains_Mono']">
            <span>Storage</span>
            <span>${formatBytes(storage.usage || 0)}</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" 
                 style="width: ${Math.min(100, Math.max(2, storage.percent || 2))}%"></div>
          </div>
        </div>
      </div>
    </aside>
  `;
}
