/**
 * Game Details Modal Component for NusaPS2
 * Displays technical binary inspection, specs, play history,
 * and allows in-place metadata editing (title & notes) and safe deletion.
 */
import { icons } from '../utils/icons.js';
import { formatBytes, formatDate, formatPlayTime } from '../utils/formatUtils.js';
import { inspectFileHeader } from '../utils/fileUtils.js';

export async function renderGameDetailsModal(game, isEditing = false) {
  let headerInfo = { type: game.format || 'PS2', desc: 'PlayStation 2 Binary' };
  if (game.fileBlob) {
    headerInfo = await inspectFileHeader(game.fileBlob);
  }

  return `
    <div id="game-details-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-lg rounded-3xl bg-[#0e1322] border border-white/10 shadow-2xl p-6 space-y-6 overflow-hidden">
        <!-- Close Button -->
        <button id="btn-close-game-modal" class="btn-press absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
          ${icons.close}
        </button>

        <!-- Header: Title & Badges or Edit Mode Inputs -->
        <div class="flex items-start gap-4 pr-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-blue-900/40 border border-white/10 flex items-center justify-center text-purple-400 flex-shrink-0">
            ${icons.disc}
          </div>
          <div class="flex-1 min-w-0">
            ${
              isEditing
                ? `
                <div class="space-y-2">
                  <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Game Title</label>
                  <input type="text" id="edit-modal-game-title" value="${game.title.replace(/"/g, '&quot;')}" class="w-full px-3 py-1.5 rounded-xl bg-[#090d19] border border-white/15 text-sm font-bold text-white focus:outline-none focus:border-purple-500 font-['Rajdhani']" />
                </div>
              `
                : `
                <h3 class="text-lg font-bold text-white font-['Rajdhani'] leading-snug">${game.title}</h3>
                <p class="text-xs text-slate-400 font-['JetBrains_Mono'] truncate max-w-xs mt-0.5">${game.filename}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-['JetBrains_Mono']">
                    ${game.format || 'PS2'}
                  </span>
                  ${game.isBuiltIn ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Built-in Demo</span>` : ''}
                  ${game.lastPlayed ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">Recently Played</span>` : ''}
                </div>
              `
            }
          </div>
        </div>

        <!-- File Inspection & Specs -->
        <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 font-['JetBrains_Mono'] text-xs">
          <div class="flex justify-between">
            <span class="text-slate-400">Binary Format:</span>
            <span class="text-slate-200 font-semibold">${headerInfo.desc}</span>
          </div>
          <div class="flex justify-between border-t border-white/5 pt-2">
            <span class="text-slate-400">Exact File Size:</span>
            <span class="text-purple-300 font-semibold">${formatBytes(game.size)} (${game.size.toLocaleString()} bytes)</span>
          </div>
          <div class="flex justify-between border-t border-white/5 pt-2">
            <span class="text-slate-400">Date Added:</span>
            <span class="text-slate-200">${formatDate(game.dateAdded)}</span>
          </div>
          <div class="flex justify-between border-t border-white/5 pt-2">
            <span class="text-slate-400">Total Play Time:</span>
            <span class="text-emerald-400 font-semibold">${formatPlayTime(game.playTime || 0)}</span>
          </div>
          <div class="flex justify-between border-t border-white/5 pt-2">
            <span class="text-slate-400">Last Played:</span>
            <span class="text-slate-200">${game.lastPlayed ? formatDate(game.lastPlayed) : 'Never'}</span>
          </div>
        </div>

        <!-- Description or Notes -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-['JetBrains_Mono']">
              Custom Notes / Description
            </span>
            ${
              !isEditing
                ? `
                <button id="btn-toggle-edit-metadata" class="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer" data-id="${game.id}">
                  Edit Notes & Title
                </button>
              `
                : ''
            }
          </div>
          ${
            isEditing
              ? `
              <textarea id="edit-modal-game-notes" rows="3" class="w-full p-3 rounded-xl bg-[#090d19] border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500">${game.description || ''}</textarea>
            `
              : `
              <p class="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-white/[0.01] border border-white/5">
                ${game.description || 'No custom notes provided for this PlayStation 2 game file.'}
              </p>
            `
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          ${
            isEditing
              ? `
              <button id="btn-save-metadata" class="btn-press flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer" data-id="${game.id}">
                ${icons.check}
                <span>Save Changes</span>
              </button>
              <button id="btn-cancel-edit-metadata" class="btn-press px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer" data-id="${game.id}">
                Cancel
              </button>
            `
              : `
              <button id="btn-modal-launch-game" class="btn-press flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer" data-id="${game.id}">
                ${icons.play}
                <span>Launch in Core</span>
              </button>

              ${
                !game.isBuiltIn
                  ? `
                  <button id="btn-modal-delete-game" class="btn-press px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold border border-white/5 transition-all cursor-pointer" data-id="${game.id}" title="Remove Game from Library">
                    ${icons.trash}
                  </button>
                `
                  : ''
              }
            `
          }
        </div>
      </div>
    </div>
  `;
}
