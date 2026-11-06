/**
 * Settings Page for NusaPS2
 * Configures graphics, aspect ratio, resolution scaling, SPU2 audio,
 * and transparently documents supported emulator features vs platform-fixed constraints.
 */
import { icons } from '../utils/icons.js';
import { appState } from '../app/state.js';
import { checkBrowserEnvironment } from '../emulator/EmulatorLoader.js';
import { formatBytes } from '../utils/formatUtils.js';

export function renderSettings() {
  const settings = appState.settings;
  const env = checkBrowserEnvironment();
  const storage = appState.storageQuota;

  // Detect WebGL renderer info if available
  let glRenderer = 'Standard WebGL2 Context';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        glRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || glRenderer;
      }
    }
  } catch (e) {
    // ignore
  }

  return `
    <div class="space-y-6 pb-12 max-w-4xl">
      <!-- Graphics & Display Settings Section -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-purple-400">${icons.monitor}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              Graphics & Presentation
            </h3>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-['JetBrains_Mono']">
            WebGL2 Active
          </span>
        </div>

        <div class="space-y-4">
          <!-- Aspect Ratio -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-200">Default Aspect Ratio</label>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">SUPPORTED</span>
              </div>
              <p class="text-[11px] text-slate-400">Controls the geometry scaling of the PlayStation 2 viewport</p>
            </div>
            <select id="settings-aspect-ratio" class="px-3 py-1.5 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-['JetBrains_Mono'] cursor-pointer">
              <option value="16:9" ${settings.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Widescreen)</option>
              <option value="4:3" ${settings.aspectRatio === '4:3' ? 'selected' : ''}>4:3 (PS2 CRT Standard)</option>
              <option value="fill" ${settings.aspectRatio === 'fill' ? 'selected' : ''}>Fill / Stretch to Viewport</option>
            </select>
          </div>

          <!-- Internal Resolution Multiplier -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 pt-3">
            <div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-200">Internal Resolution Multiplier</label>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">SUPPORTED</span>
              </div>
              <p class="text-[11px] text-slate-400">Scales the WebGL2 canvas framebuffer pixel density</p>
            </div>
            <select id="settings-resolution" class="px-3 py-1.5 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-['JetBrains_Mono'] cursor-pointer">
              <option value="1" ${settings.resolutionScale === '1' ? 'selected' : ''}>1x Native (640 × 448)</option>
              <option value="2" ${settings.resolutionScale === '2' ? 'selected' : ''}>2x HD (1280 × 896)</option>
              <option value="3" ${settings.resolutionScale === '3' ? 'selected' : ''}>3x Full HD (1920 × 1344)</option>
            </select>
          </div>

          <!-- Force Bilinear Textures -->
          <div class="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-200">Bilinear Texture Filtering</label>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">SUPPORTED</span>
              </div>
              <p class="text-[11px] text-slate-400">Enforces smooth hardware texture interpolation on 3D polygon surfaces</p>
            </div>
            <input type="checkbox" id="settings-bilinear" class="w-4 h-4 rounded accent-purple-600 cursor-pointer" ${settings.forceBilinear ? 'checked' : ''} />
          </div>

          <!-- CRT Scanlines Shader Overlay -->
          <div class="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-200">CRT Scanline Shader Overlay</label>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">SUPPORTED</span>
              </div>
              <p class="text-[11px] text-slate-400">Simulates authentic 480i Sony Trinitron scanlines over the gameplay canvas</p>
            </div>
            <input type="checkbox" id="settings-scanlines" class="w-4 h-4 rounded accent-purple-600 cursor-pointer" ${settings.enableScanlines ? 'checked' : ''} />
          </div>

          <!-- VSync & Frame Limiter (Documented as fixed by browser) -->
          <div class="flex items-center justify-between border-t border-white/5 pt-3 opacity-75">
            <div>
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-300">VSync & Frame Limiter</label>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">BROWSER LOCKED</span>
              </div>
              <p class="text-[11px] text-slate-500">Automatically synchronized to display refresh rate via requestAnimationFrame (60Hz)</p>
            </div>
            <span class="text-xs text-slate-400 font-['JetBrains_Mono']">60 FPS Locked</span>
          </div>
        </div>
      </div>

      <!-- SPU2 Audio Processor Settings -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-blue-400">${icons.volume}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            Sound Processor (SPU2) Audio
          </h3>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex-1 pr-4">
              <label class="text-xs font-semibold text-slate-200">Master Volume (<span id="settings-volume-label">${settings.audioVolume}%</span>)</label>
              <p class="text-[11px] text-slate-400">Adjust overall WebAudio emulator audio playback volume</p>
            </div>
            <input type="range" id="settings-volume" min="0" max="100" value="${settings.audioVolume}" class="w-48 accent-purple-500 cursor-pointer" />
          </div>

          <div class="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <label class="text-xs font-semibold text-slate-200">Audio Output Enabled</label>
              <p class="text-[11px] text-slate-400">Enable or mute WebAudio SPU2 output</p>
            </div>
            <input type="checkbox" id="settings-audio-enabled" class="w-4 h-4 rounded accent-purple-600 cursor-pointer" ${settings.audioVolume > 0 ? 'checked' : ''} />
          </div>
        </div>
      </div>

      <!-- Hardware & Performance Architecture Details -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 font-['JetBrains_Mono'] text-xs">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-emerald-400">${icons.cpu}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              Runtime Architecture & Diagnostics
            </h3>
          </div>
          <a href="#diagnostics" class="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Full Diagnostics View &rarr;
          </a>
        </div>

        <div class="space-y-2.5">
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span class="text-slate-400">Cross-Origin Isolation (COOP/COEP)</span>
            <span class="${env.isIsolated ? 'text-emerald-400' : 'text-amber-400'} font-semibold">
              ${env.isIsolated ? '✓ Active (SharedArrayBuffer Enabled)' : '⚠ Coi Service Worker Running'}
            </span>
          </div>

          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span class="text-slate-400">OffscreenCanvas Context</span>
            <span class="${env.hasOffscreenCanvas ? 'text-emerald-400' : 'text-amber-400'} font-semibold">
              ${env.hasOffscreenCanvas ? '✓ Active (Decoupled Thread Rendering)' : '⚠ Direct DOM Canvas Fallback'}
            </span>
          </div>

          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
            <span class="text-slate-300 font-semibold block mb-0.5">GPU Hardware Renderer:</span>
            <span class="text-purple-300 truncate block">${glRenderer}</span>
          </div>
        </div>
      </div>

      <!-- Storage & Preferences Reset -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-purple-400">${icons.harddrive}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            IndexedDB Storage Quota
          </h3>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p class="font-semibold text-slate-200">Local Storage Used: <span class="text-purple-300">${formatBytes(storage.usage || 0)}</span></p>
            <p class="text-[11px] text-slate-400">Total Quota: ${formatBytes(storage.quota || 0, 0)}</p>
          </div>
          <button id="btn-request-persist" class="btn-press px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer">
            ${storage.persisted ? '✓ Storage Persisted' : 'Request Persistent Storage'}
          </button>
        </div>

        <div class="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-200">Reset Application Preferences</p>
            <p class="text-[11px] text-slate-400">Restore default graphics, audio, and controller layout</p>
          </div>
          <button id="btn-reset-settings" class="btn-press px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  `;
}
