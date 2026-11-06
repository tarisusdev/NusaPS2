/**
 * Save Data & Memory Card Page for NusaPS2
 * Provides strict separation between:
 * 1. Native Virtual Memory Cards (.bin / .ps2)
 * 2. Emulator Save States (Transparently documenting WebAssembly core limitations)
 * 3. Local Memory Card Snapshots & Backups with delete confirmation
 * 4. Application Configuration Data
 */
import { icons } from '../utils/icons.js';
import { emulatorAdapter } from '../emulator/EmulatorAdapter.js';
import { getAllSaveBackups } from '../storage/saveRepository.js';
import { formatDate, formatBytes } from '../utils/formatUtils.js';

let saveBackupsList = [];

export async function loadSaveBackups() {
  saveBackupsList = await getAllSaveBackups();
}

export function renderSaveData() {
  const currentGame = emulatorAdapter.getCurrentGame();

  return `
    <div class="space-y-8 pb-12">
      <!-- 1. Virtual Memory Cards (Native MagicGate 8MB) -->
      <div class="glass-panel rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-purple-400">${icons.save}</span>
              <h2 class="text-lg font-bold text-white font-['Rajdhani'] tracking-wide">
                1. Virtual PlayStation 2 Memory Cards
              </h2>
            </div>
            <p class="text-xs text-slate-400">
              Native PS2 MagicGate 8MB Memory Cards stored in the WebAssembly virtual filesystem (/work/Memorycards). Fully compatible with .ps2 and .bin formats.
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-['JetBrains_Mono']">
            MagicGate™ 8MB Native
          </span>
        </div>

        <!-- Dual Memory Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Memory Card Slot 1 -->
          <div class="rounded-2xl bg-gradient-to-br from-[#12182c] to-[#0a0e1b] border border-white/10 p-5 space-y-4 shadow-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-12 rounded-lg bg-gradient-to-b from-purple-900/60 to-blue-900/40 border border-white/20 flex flex-col items-center justify-between py-1.5 shadow-inner">
                  <div class="w-5 h-1.5 bg-yellow-500/40 rounded-sm"></div>
                  <span class="text-[9px] font-bold font-['Rajdhani'] text-white">8MB</span>
                  <div class="w-6 h-1 bg-white/20 rounded-full"></div>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white font-['Rajdhani'] tracking-wide">Memory Card 1</h3>
                  <p class="text-[11px] text-slate-400 font-['JetBrains_Mono']">Slot 1 (/work/Memorycards/Memorycard1.bin)</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-['JetBrains_Mono']">
                MOUNTED
              </span>
            </div>

            <!-- Capacity Info -->
            <div class="space-y-1.5 text-xs font-['JetBrains_Mono']">
              <div class="flex justify-between text-slate-400 text-[11px]">
                <span>Standard 8,192 KB</span>
                <span class="text-purple-300">Format: .BIN / .PS2</span>
              </div>
              <div class="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[20%]"></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <button class="btn-export-memcard btn-press flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="1" data-format="bin" title="Export as standard .bin file">
                ${icons.download}
                <span>Export (.bin)</span>
              </button>
              <button class="btn-export-memcard-ps2 btn-press flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="1" data-format="ps2" title="Export as .ps2 file">
                ${icons.download}
                <span>Export (.ps2)</span>
              </button>
              <button class="btn-import-memcard btn-press col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="1">
                ${icons.upload}
                <span>Import Memory Card (.bin / .ps2)</span>
              </button>
              <button class="btn-backup-memcard btn-press col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer" data-slot="1">
                ${icons.save}
                <span>Save Local Snapshot ${currentGame ? `(for "${currentGame.title.substring(0, 20)}")` : ''}</span>
              </button>
            </div>
            <input type="file" id="file-import-memcard-1" class="hidden" accept=".bin,.ps2,.raw" />
          </div>

          <!-- Memory Card Slot 2 -->
          <div class="rounded-2xl bg-gradient-to-br from-[#12182c] to-[#0a0e1b] border border-white/10 p-5 space-y-4 shadow-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-12 rounded-lg bg-gradient-to-b from-blue-900/60 to-cyan-900/40 border border-white/20 flex flex-col items-center justify-between py-1.5 shadow-inner">
                  <div class="w-5 h-1.5 bg-yellow-500/40 rounded-sm"></div>
                  <span class="text-[9px] font-bold font-['Rajdhani'] text-white">8MB</span>
                  <div class="w-6 h-1 bg-white/20 rounded-full"></div>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white font-['Rajdhani'] tracking-wide">Memory Card 2</h3>
                  <p class="text-[11px] text-slate-400 font-['JetBrains_Mono']">Slot 2 (/work/Memorycards/Memorycard2.bin)</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-['JetBrains_Mono']">
                MOUNTED
              </span>
            </div>

            <!-- Capacity Info -->
            <div class="space-y-1.5 text-xs font-['JetBrains_Mono']">
              <div class="flex justify-between text-slate-400 text-[11px]">
                <span>Standard 8,192 KB</span>
                <span class="text-cyan-300">Format: .BIN / .PS2</span>
              </div>
              <div class="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[5%]"></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <button class="btn-export-memcard btn-press flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="2" data-format="bin" title="Export as standard .bin file">
                ${icons.download}
                <span>Export (.bin)</span>
              </button>
              <button class="btn-export-memcard-ps2 btn-press flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="2" data-format="ps2" title="Export as .ps2 file">
                ${icons.download}
                <span>Export (.ps2)</span>
              </button>
              <button class="btn-import-memcard btn-press col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-slot="2">
                ${icons.upload}
                <span>Import Memory Card (.bin / .ps2)</span>
              </button>
              <button class="btn-backup-memcard btn-press col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer" data-slot="2">
                ${icons.save}
                <span>Save Local Snapshot ${currentGame ? `(for "${currentGame.title.substring(0, 20)}")` : ''}</span>
              </button>
            </div>
            <input type="file" id="file-import-memcard-2" class="hidden" accept=".bin,.ps2,.raw" />
          </div>
        </div>
      </div>

      <!-- 2. Emulator Save States Status & Core Architecture -->
      <div class="glass-panel rounded-2xl p-6 space-y-3 font-['JetBrains_Mono'] text-xs border border-white/10">
        <div class="flex items-center justify-between border-b border-white/5 pb-2">
          <div class="flex items-center gap-2 text-slate-300 font-semibold">
            <span class="text-amber-400">${icons.alert}</span>
            <span class="font-['Rajdhani'] text-sm uppercase tracking-wider font-bold">2. Emulator Real-Time Save States Status</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            NOT SUPPORTED IN WASM BUILD
          </span>
        </div>
        <p class="text-slate-400 text-xs leading-relaxed">
          The Play! WebAssembly core operates across multithreaded Web Workers with SharedArrayBuffer memory synchronization. Real-time RAM memory snapshot states (instant save/load state) are not exposed in the browser WebAssembly runtime to avoid threading race conditions and heap desynchronization.
        </p>
        <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-300 space-y-1">
          <span class="text-emerald-400 font-semibold block">✓ Recommended Saving Method:</span>
          <span>
            Use native in-game PlayStation 2 saving at save points or game menus. All progress is written directly to the virtual 8MB MagicGate Memory Cards above and automatically retained in IndexedDB.
          </span>
        </div>
      </div>

      <!-- 3. Local Memory Card Snapshots & Save Data Backups -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-purple-400">${icons.save}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              3. Local Memory Card Snapshots (${saveBackupsList.length})
            </h3>
          </div>
          <span class="text-[11px] text-slate-500 font-['JetBrains_Mono']">Stored in browser IndexedDB</span>
        </div>

        ${
          saveBackupsList.length > 0
            ? `
            <div class="divide-y divide-white/5">
              ${saveBackupsList.map((backup) => `
                <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-['JetBrains_Mono'] text-xs">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-bold text-slate-200 text-sm font-['Plus_Jakarta_Sans']">${backup.title}</h4>
                      <span class="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Slot ${backup.slot}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                      ${formatDate(backup.timestamp)} • ${formatBytes(backup.size)}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="btn-download-backup btn-press px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition-colors cursor-pointer" data-id="${backup.id}">
                      ${icons.download}
                      <span>Download .bin</span>
                    </button>
                    <button class="btn-delete-backup-prompt btn-press p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" data-id="${backup.id}" data-title="${backup.title}" title="Delete Backup Snapshot">
                      ${icons.trash}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `
            : `
            <div class="text-center py-8 text-slate-500 text-xs">
              No local memory card snapshots created yet. Click "Save Local Snapshot" above during or after a game session to capture an 8MB card backup.
            </div>
          `
        }
      </div>

      <!-- 4. Application Configuration Data -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-blue-400">${icons.settings}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              4. Application Configuration & Settings Data
            </h3>
          </div>
          <span class="text-[11px] text-slate-500 font-['JetBrains_Mono']">Client JSON Export</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p class="font-semibold text-slate-200">Export or Restore NusaPS2 Preferences</p>
            <p class="text-[11px] text-slate-400">Includes graphics settings, audio configuration, and custom keyboard controller mappings.</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-export-app-config" class="btn-press px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer">
              Export Config JSON
            </button>
            <button id="btn-import-app-config" class="btn-press px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer">
              Import Config JSON
            </button>
            <input type="file" id="file-import-app-config" class="hidden" accept=".json" />
          </div>
        </div>
      </div>
    </div>
  `;
}
