/**
 * Game Card Component for NusaPS2
 */
import { icons } from '../utils/icons.js';
import { formatBytes, formatRelativeTime, formatPlayTime } from '../utils/formatUtils.js';

export function renderGameCard(game) {
  const formatColors = {
    ELF: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ISO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    BIN: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    CHD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CSO: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    DEFAULT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const badgeClass = formatColors[game.format?.toUpperCase()] || formatColors.DEFAULT;

  return `
    <div class="game-card group relative rounded-2xl bg-gradient-to-b from-[#13192c]/90 to-[#0c101d]/90 border border-white/5 hover:border-purple-500/50 p-4 transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)] flex flex-col justify-between overflow-hidden" data-id="${game.id}">
      <!-- Background subtle gradient shine -->
      <div class="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none"></div>

      <div>
        <!-- Cover Art or PS2 Disc Graphic -->
        <div class="relative w-full aspect-[16/10] rounded-xl bg-[#090d19] border border-white/5 overflow-hidden flex items-center justify-center mb-3.5 group-hover:border-purple-500/30 transition-all">
          ${
            game.coverUrl
              ? `<img src="${game.coverUrl}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`
              : `
              <!-- Stylized PS2 Disc Presentation -->
              <div class="w-24 h-24 rounded-full border border-white/10 bg-gradient-to-tr from-[#1a2238] via-[#0e1424] to-[#252f4c] flex items-center justify-center relative shadow-inner group-hover:rotate-45 transition-transform duration-700">
                <div class="w-10 h-10 rounded-full border border-white/20 bg-[#070913] flex items-center justify-center">
                  <div class="w-4 h-4 rounded-full bg-purple-500/30"></div>
                </div>
                <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent opacity-60"></div>
              </div>
              <span class="absolute bottom-2 right-2 text-[10px] font-['Rajdhani'] font-bold text-slate-400/80 tracking-wider">PS2 NATIVE</span>
            `
          }

          <!-- Format Tag -->
          <div class="absolute top-2.5 left-2.5">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border font-['JetBrains_Mono'] ${badgeClass}">
              ${game.format || 'ROM'}
            </span>
          </div>

          ${
            game.isBuiltIn
              ? `
              <div class="absolute top-2.5 right-2.5">
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Built-in Demo
                </span>
              </div>
            `
              : game.lastPlayed
              ? `
              <div class="absolute top-2.5 right-2.5">
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-['JetBrains_Mono']">
                  Recent
                </span>
              </div>
            `
              : ''
          }
        </div>

        <!-- Title & Metadata -->
        <h3 class="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1" title="${game.title}">
          ${game.title}
        </h3>
        <p class="text-[11px] text-slate-400 font-['JetBrains_Mono'] truncate mb-3" title="${game.filename}">
          ${game.filename}
        </p>
      </div>

      <!-- Footer Info & Actions -->
      <div class="pt-3 border-t border-white/5 space-y-2.5">
        <div class="flex items-center justify-between text-[11px] text-slate-400 font-['JetBrains_Mono']">
          <span>${formatBytes(game.size)}</span>
          <span>${game.lastPlayed ? formatRelativeTime(game.lastPlayed) : 'Never played'}</span>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-launch-game flex-1 btn-press flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] transition-all cursor-pointer" data-id="${game.id}">
            ${icons.play}
            <span>Launch</span>
          </button>
          
          <button class="btn-game-details btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer" data-id="${game.id}" title="Game Details & Inspection">
            ${icons.about}
          </button>

          ${
            !game.isBuiltIn
              ? `
              <button class="btn-delete-game btn-press p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer" data-id="${game.id}" title="Remove from Library">
                ${icons.trash}
              </button>
            `
              : ''
          }
        </div>
      </div>
    </div>
  `;
}
