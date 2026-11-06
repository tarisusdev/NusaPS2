/**
 * About Page for NusaPS2
 */
import { icons } from '../utils/icons.js';

export function renderAbout() {
  return `
    <div class="space-y-6 pb-12 max-w-4xl font-['Plus_Jakarta_Sans']">
      <!-- Project Mission Header -->
      <div class="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#141b34] via-[#0d1224] to-[#181130] p-8 ps2-glow-shadow">
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 font-['JetBrains_Mono']">
            <span>NusaPS2</span>
            <span>•</span>
            <span>Production WebAssembly Architecture</span>
          </div>

          <h2 class="text-3xl font-extrabold text-white font-['Rajdhani'] tracking-wide mb-3">
            About the <span class="ps2-gradient-text">NusaPS2 Project</span>
          </h2>

          <p class="text-sm text-slate-300 leading-relaxed font-normal">
            NusaPS2 is a high-performance, browser-based PlayStation 2 emulator frontend. Built with modern WebAssembly, WebGL2, and the Gamepad API, it allows desktop browsers to emulate PlayStation 2 software with no plugins, downloads, or external servers.
          </p>
        </div>
      </div>

      <!-- Core Engine Information -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-purple-400">${icons.cpu}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            Play! WebAssembly Core Integration
          </h3>
        </div>

        <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            NusaPS2 integrates the official WebAssembly port of <strong class="text-white">Play!</strong> (created by Jean-Philip Desjardins and contributors). Play! is an open-source, portable PlayStation 2 emulator capable of running real PS2 games through High-Level Emulation (HLE).
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-400 font-['JetBrains_Mono'] text-[11px]">
            <li><strong class="text-slate-200">No Proprietary BIOS Required:</strong> Uses built-in HLE system modules, bypassing the need for copyrighted PS2 BIOS ROM dumps.</li>
            <li><strong class="text-slate-200">Streaming Disc Device:</strong> Implements a custom WebAssembly virtual block device that streams chunks of multi-gigabyte ISO/CSO images on demand via <code class="text-purple-300">File.slice()</code>, avoiding browser memory exhaustion.</li>
            <li><strong class="text-slate-200">Hardware Acceleration:</strong> Utilizes WebGL 2.0 to translate Graphics Synthesizer primitives directly into GPU shader draw calls.</li>
            <li><strong class="text-slate-200">Gamepad Bridge:</strong> Intercepts physical controller events from the W3C Gamepad API and bridges them to emulator virtual inputs with zero latency.</li>
          </ul>
        </div>
      </div>

      <!-- Legal & Security Compliance -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 border border-emerald-500/20">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-emerald-400">${icons.shield}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            Legal & Security Constitution
          </h3>
        </div>

        <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            NusaPS2 is developed strictly for preservation, research, and legal emulation of user-owned software:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span class="text-emerald-400 font-bold font-['JetBrains_Mono'] text-[11px]">Zero Piracy</span>
              <p class="text-[11px] text-slate-400">
                NusaPS2 does not host, distribute, or link to any copyrighted commercial game ROMs or proprietary console BIOS files.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span class="text-blue-400 font-bold font-['JetBrains_Mono'] text-[11px]">100% Client-Side Privacy</span>
              <p class="text-[11px] text-slate-400">
                Your game files, save data, and memory cards never leave your device. All processing occurs locally inside your browser sandbox.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Open Source Community & GitHub Repository -->
      <div class="glass-panel rounded-2xl p-6 space-y-4 border border-purple-500/20 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10">
        <div class="flex items-center justify-between border-b border-white/5 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-purple-400">${icons.github}</span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
              Open Source Community & GitHub
            </h3>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-['JetBrains_Mono']">
            MIT Licensed
          </span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          NusaPS2 is 100% free and open-source software built for emulation enthusiasts, WebAssembly developers, and retro gaming preservationists. Contributions, issue reports, and stars are warmly welcome.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a href="https://github.com/wawansaid/nusaps2" target="_blank" rel="noopener noreferrer" class="btn-press flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all">
            <span class="text-yellow-400">${icons.star}</span>
            <span>Star on GitHub</span>
          </a>

          <a href="https://github.com/wawansaid/nusaps2/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" class="btn-press flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all">
            <span>🤝 Contribute</span>
          </a>

          <a href="https://github.com/wawansaid/nusaps2/issues" target="_blank" rel="noopener noreferrer" class="btn-press flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all">
            <span>🐛 Report Issue</span>
          </a>
        </div>
      </div>

      <!-- System Architecture & Credits -->
      <div class="glass-panel rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <span class="text-cyan-400">${icons.about}</span>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-['Rajdhani']">
            Credits & Upstream Open Source
          </h3>
        </div>

        <div class="space-y-2 text-xs text-slate-400 font-['JetBrains_Mono']">
          <div class="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span>NusaPS2 GitHub Repository</span>
            <a href="https://github.com/wawansaid/nusaps2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
              github.com/wawansaid/nusaps2 ${icons.externalLink}
            </a>
          </div>
          <div class="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span>Play! PS2 Emulator (jpd002/Play-)</span>
            <a href="https://purei.org" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 flex items-center gap-1">
              purei.org ${icons.externalLink}
            </a>
          </div>
          <div class="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span>wLaunchELF Open Source Homebrew Shell</span>
            <a href="https://github.com/ps2homebrew/wLaunchELF" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 flex items-center gap-1">
              GitHub ${icons.externalLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
