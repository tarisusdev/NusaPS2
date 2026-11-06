/**
 * Game Library Page for NusaPS2
 */
import { icons } from '../utils/icons.js';
import { appState } from '../app/state.js';
import { renderGameCard } from '../components/GameCard.js';
import { formatBytes } from '../utils/formatUtils.js';

let activeFilter = 'ALL';
let activeSort = 'dateAdded';
let searchQuery = '';

export function renderLibrary() {
  const games = appState.games;
  const storage = appState.storageQuota;

  // Filter games
  const filtered = games.filter((g) => {
    if (activeFilter !== 'ALL' && g.format?.toUpperCase() !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.title?.toLowerCase().includes(q) ||
        g.filename?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort games
  filtered.sort((a, b) => {
    if (activeSort === 'dateAdded') return b.dateAdded - a.dateAdded;
    if (activeSort === 'lastPlayed') return (b.lastPlayed || 0) - (a.lastPlayed || 0);
    if (activeSort === 'name') return a.title.localeCompare(b.title);
    if (activeSort === 'size') return b.size - a.size;
    return 0;
  });

  const filterTabs = ['ALL', 'ELF', 'ISO', 'BIN', 'CHD', 'CSO'];

  return `
    <div class="space-y-6 pb-12">
      <!-- Top Action Bar: Search, Filters, Sort & Import -->
      <div class="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            ${icons.search}
          </span>
          <input 
            type="text" 
            id="library-search-input"
            value="${searchQuery}"
            placeholder="Search games by title or filename..." 
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          ${filterTabs.map((tab) => `
            <button class="btn-filter-tab px-3 py-1.5 rounded-xl text-xs font-semibold font-['JetBrains_Mono'] transition-all cursor-pointer ${
              activeFilter === tab
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }" data-filter="${tab}">
              ${tab}
            </button>
          `).join('')}
        </div>

        <!-- Sort Select & Import -->
        <div class="flex items-center gap-3">
          <select id="library-sort-select" class="px-3 py-2 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-['JetBrains_Mono']">
            <option value="dateAdded" ${activeSort === 'dateAdded' ? 'selected' : ''}>Recently Added</option>
            <option value="lastPlayed" ${activeSort === 'lastPlayed' ? 'selected' : ''}>Recently Played</option>
            <option value="name" ${activeSort === 'name' ? 'selected' : ''}>Title (A-Z)</option>
            <option value="size" ${activeSort === 'size' ? 'selected' : ''}>File Size</option>
          </select>

          <button id="btn-library-import" class="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex-shrink-0">
            ${icons.plus}
            <span>Add Game</span>
          </button>
        </div>
      </div>

      <!-- Drag & Drop Import Dropzone -->
      <div id="library-dropzone" class="relative rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/70 bg-[#0c1020]/50 hover:bg-[#121830]/60 p-8 text-center transition-all duration-300 cursor-pointer group">
        <div class="max-w-md mx-auto space-y-2 pointer-events-none">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            ${icons.upload}
          </div>
          <h4 class="text-sm font-bold text-white font-['Rajdhani'] tracking-wide">
            Drag & Drop PlayStation 2 Games Here
          </h4>
          <p class="text-xs text-slate-400">
            Supports <span class="text-purple-300 font-mono">.ISO</span>, <span class="text-blue-300 font-mono">.BIN</span>, <span class="text-cyan-300 font-mono">.CHD</span>, <span class="text-indigo-300 font-mono">.CSO</span>, and <span class="text-emerald-300 font-mono">.ELF</span> disc images and homebrew executables.
          </p>
          <p class="text-[11px] text-slate-500">
            Games stay 100% private in your browser IndexedDB storage and are never uploaded to any remote server.
          </p>
        </div>
        <input type="file" id="library-file-input" class="hidden" accept=".iso,.bin,.chd,.cso,.elf,.isz,.mdf" multiple />
      </div>

      <!-- Storage Quota Notice -->
      ${
        storage.supported
          ? `
          <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div class="flex items-center gap-2 font-['JetBrains_Mono']">
              <span>IndexedDB Storage:</span>
              <span class="text-purple-300 font-semibold">${formatBytes(storage.usage || 0)} used</span>
              <span>of ${formatBytes(storage.quota || 0, 0)} available</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-emerald-400 font-semibold font-['JetBrains_Mono']">
                ${storage.persisted ? '✓ Persistent Storage Enabled' : 'Browser Sandboxed'}
              </span>
            </div>
          </div>
        `
          : ''
      }

      <!-- Games Grid -->
      ${
        filtered.length > 0
          ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="library-games-grid">
            ${filtered.map((game) => renderGameCard(game)).join('')}
          </div>
        `
          : `
          <!-- Empty State -->
          <div class="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500 mx-auto">
              ${icons.disc}
            </div>
            <h3 class="text-lg font-bold text-white font-['Rajdhani']">No Games Found</h3>
            <p class="text-xs text-slate-400">
              ${
                searchQuery || activeFilter !== 'ALL'
                  ? 'No games match your active search or filter criteria. Try resetting filters.'
                  : 'Your PlayStation 2 library is currently empty. Import an ISO or ELF file to get started.'
              }
            </p>
            ${
              searchQuery || activeFilter !== 'ALL'
                ? `
                <button id="btn-reset-filters" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer">
                  Reset Filters
                </button>
              `
                : ''
            }
          </div>
        `
      }
    </div>
  `;
}

export function setLibraryFilter(filter) {
  activeFilter = filter;
}

export function setLibrarySort(sort) {
  activeSort = sort;
}

export function setLibrarySearch(q) {
  searchQuery = q;
}
