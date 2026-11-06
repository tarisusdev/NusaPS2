/**
 * Controller Panel & DualShock Visualizer Component for NusaPS2
 * Provides real Gamepad API integration, interactive DualShock 2 button testing,
 * and a fully configurable keyboard mapping interface.
 */
import { gamepadManager } from '../controllers/GamepadManager.js';
import { getKeyMap } from '../controllers/InputMapper.js';
import { icons } from '../utils/icons.js';

let activeRebindAction = null;

export function getActiveRebindAction() {
  return activeRebindAction;
}

export function setActiveRebindAction(action) {
  activeRebindAction = action;
}

export function renderControllerPanel() {
  const connected = gamepadManager.connectedGamepads;
  const activeGamepad = gamepadManager.getActiveGamepad();
  const gamepadsList = Array.from(connected.values());
  const keyMap = getKeyMap();

  return `
    <div class="space-y-6">
      <!-- Top Status Banner -->
      <div class="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h2 class="text-lg font-bold text-white font-['Rajdhani'] tracking-wide">Gamepad API & Controller Mapping</h2>
            <span id="controller-status-badge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              activeGamepad
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }">
              ${activeGamepad ? '● Controller Active' : '○ Listening for Gamepad...'}
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Plug in any USB or Bluetooth PlayStation (DualShock 4 / DualSense), Xbox, Switch Pro, or generic HID controller. Press any button to initialize.
          </p>
        </div>

        <!-- Controller Selector & Quick Test Action -->
        <div class="flex items-center gap-3">
          ${
            gamepadsList.length > 1
              ? `
              <div class="flex items-center gap-2">
                <label class="text-xs text-slate-400 font-medium">Controller:</label>
                <select id="select-active-gamepad" class="px-3 py-1.5 rounded-xl bg-[#090d19] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500">
                  ${gamepadsList.map((gp) => `
                    <option value="${gp.index}" ${gp.index === gamepadManager.activeGamepadIndex ? 'selected' : ''}>
                      ${gp.id.substring(0, 28)} (Slot ${gp.index})
                    </option>
                  `).join('')}
                </select>
              </div>
            `
              : ''
          }
          <button id="btn-reset-keymap" class="btn-press px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer" title="Reset all keyboard bindings to defaults">
            Reset Keybindings
          </button>
        </div>
      </div>

      <!-- Main Visualizer and Live Input Area -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- DualShock 2 Graphic Visualizer & Real-time Test -->
        <div class="lg:col-span-7 glass-panel-elevated rounded-2xl p-6 flex flex-col items-center justify-between">
          <div class="w-full flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-['JetBrains_Mono']">
                DualShock 2 Interactive Test Visualizer
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-['JetBrains_Mono'] font-bold">
                Live 60Hz
              </span>
            </div>
            <span class="text-xs text-purple-400 font-['JetBrains_Mono'] truncate max-w-[220px]" id="controller-device-name">
              ${activeGamepad ? activeGamepad.id : 'No controller detected — Press any button'}
            </span>
          </div>

          <!-- DualShock 2 SVG Interactive Layout -->
          <div class="relative w-full max-w-[500px] aspect-[16/10] flex items-center justify-center my-4 select-none">
            <!-- Controller Silhouette Base -->
            <svg viewBox="0 0 500 320" class="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
              <!-- Body Outline -->
              <path d="M 120 70 C 180 65, 320 65, 380 70 C 440 75, 480 140, 460 250 C 445 295, 395 300, 375 250 C 355 200, 335 180, 250 180 C 165 180, 145 200, 125 250 C 105 300, 55 295, 40 250 C 20 140, 60 75, 120 70 Z" 
                    fill="#101526" stroke="#252d47" stroke-width="3" />
              
              <!-- Center Logo Plaque -->
              <rect x="220" y="85" width="60" height="28" rx="6" fill="#090d19" stroke="#333f63" stroke-width="1.5" />
              <text x="250" y="104" font-family="'Rajdhani', sans-serif" font-weight="700" font-size="14" fill="#60a5fa" text-anchor="middle" letter-spacing="2">PS2</text>

              <!-- Shoulder Buttons L1 / L2 / R1 / R2 visual -->
              <rect id="vis-l2" x="90" y="35" width="45" height="20" rx="4" fill="#161e36" stroke="#2b385e" class="transition-colors" />
              <text x="112" y="49" font-family="'JetBrains Mono'" font-size="10" fill="#94a3b8" text-anchor="middle">L2</text>
              <rect id="vis-l1" x="145" y="45" width="40" height="15" rx="4" fill="#161e36" stroke="#2b385e" class="transition-colors" />
              <text x="165" y="56" font-family="'JetBrains Mono'" font-size="9" fill="#94a3b8" text-anchor="middle">L1</text>

              <rect id="vis-r2" x="365" y="35" width="45" height="20" rx="4" fill="#161e36" stroke="#2b385e" class="transition-colors" />
              <text x="388" y="49" font-family="'JetBrains Mono'" font-size="10" fill="#94a3b8" text-anchor="middle">R2</text>
              <rect id="vis-r1" x="315" y="45" width="40" height="15" rx="4" fill="#161e36" stroke="#2b385e" class="transition-colors" />
              <text x="335" y="56" font-family="'JetBrains Mono'" font-size="9" fill="#94a3b8" text-anchor="middle">R1</text>

              <!-- D-Pad (Left Side) -->
              <g id="vis-dpad" transform="translate(115, 125)">
                <!-- Base cross -->
                <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#1a233d" stroke="#2f3d66" />
                <rect x="-12" y="-35" width="24" height="70" rx="4" fill="#1a233d" stroke="#2f3d66" />
                <!-- Buttons -->
                <polygon id="vis-dpadUp" points="0,-28 -8,-15 8,-15" fill="#475569" class="transition-colors" />
                <polygon id="vis-dpadDown" points="0,28 -8,15 8,15" fill="#475569" class="transition-colors" />
                <polygon id="vis-dpadLeft" points="-28,0 -15,-8 -15,8" fill="#475569" class="transition-colors" />
                <polygon id="vis-dpadRight" points="28,0 15,-8 15,8" fill="#475569" class="transition-colors" />
              </g>

              <!-- Action Buttons (Right Side) -->
              <g id="vis-actions" transform="translate(385, 125)">
                <!-- Triangle (Top - Green) -->
                <circle id="vis-triangle-bg" cx="0" cy="-26" r="14" fill="#1a233d" stroke="#2f3d66" class="transition-colors" />
                <text id="vis-triangle" x="0" y="-21" font-size="14" font-weight="bold" fill="#34d399" text-anchor="middle">△</text>

                <!-- Circle (Right - Red) -->
                <circle id="vis-circle-bg" cx="26" cy="0" r="14" fill="#1a233d" stroke="#2f3d66" class="transition-colors" />
                <text id="vis-circle" x="0" y="5" font-size="14" font-weight="bold" fill="#f87171" text-anchor="middle" transform="translate(26,0)">○</text>

                <!-- Cross (Bottom - Blue) -->
                <circle id="vis-cross-bg" cx="0" cy="26" r="14" fill="#1a233d" stroke="#2f3d66" class="transition-colors" />
                <text id="vis-cross" x="0" y="31" font-size="14" font-weight="bold" fill="#60a5fa" text-anchor="middle">✕</text>

                <!-- Square (Left - Pink) -->
                <circle id="vis-square-bg" cx="-26" cy="0" r="14" fill="#1a233d" stroke="#2f3d66" class="transition-colors" />
                <text id="vis-square" x="0" y="5" font-size="14" font-weight="bold" fill="#f472b6" text-anchor="middle" transform="translate(-26,0)">□</text>
              </g>

              <!-- Select & Start Buttons -->
              <rect id="vis-select" x="185" y="125" width="22" height="10" rx="3" fill="#334155" class="transition-colors" />
              <text x="196" y="145" font-size="7" font-family="'JetBrains Mono'" fill="#64748b" text-anchor="middle">SELECT</text>

              <rect id="vis-start" x="293" y="125" width="22" height="10" rx="3" fill="#334155" class="transition-colors" />
              <text x="304" y="145" font-size="7" font-family="'JetBrains Mono'" fill="#64748b" text-anchor="middle">START</text>

              <!-- Analog Mode Button & Red LED -->
              <circle cx="250" cy="140" r="6" fill="#1e293b" stroke="#334155" />
              <circle cx="250" cy="128" r="3" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />
              <text x="250" y="156" font-size="7" font-family="'JetBrains Mono'" fill="#64748b" text-anchor="middle">ANALOG</text>

              <!-- Left Analog Stick -->
              <g id="vis-lstick-group" transform="translate(180, 215)">
                <circle cx="0" cy="0" r="34" fill="#0d1222" stroke="#232d47" stroke-width="2" />
                <circle id="vis-lstick-nub" cx="0" cy="0" r="22" fill="#1e293b" stroke="#3b82f6" stroke-width="2" class="transition-transform duration-75 shadow-lg" />
                <text x="0" y="4" font-size="9" font-family="'JetBrains Mono'" fill="#94a3b8" text-anchor="middle">L3</text>
              </g>

              <!-- Right Analog Stick -->
              <g id="vis-rstick-group" transform="translate(320, 215)">
                <circle cx="0" cy="0" r="34" fill="#0d1222" stroke="#232d47" stroke-width="2" />
                <circle id="vis-rstick-nub" cx="0" cy="0" r="22" fill="#1e293b" stroke="#3b82f6" stroke-width="2" class="transition-transform duration-75 shadow-lg" />
                <text x="0" y="4" font-size="9" font-family="'JetBrains Mono'" fill="#94a3b8" text-anchor="middle">R3</text>
              </g>
            </svg>
          </div>

          <!-- Real-Time Stick Coordinates Readout -->
          <div class="w-full grid grid-cols-2 gap-4 mt-2">
            <div class="p-3 rounded-xl bg-[#090d19] border border-white/5 flex items-center justify-between text-xs font-['JetBrains_Mono']">
              <span class="text-slate-400">Left Stick (X, Y)</span>
              <span id="coord-lstick" class="text-blue-400 font-semibold">0.00, 0.00</span>
            </div>
            <div class="p-3 rounded-xl bg-[#090d19] border border-white/5 flex items-center justify-between text-xs font-['JetBrains_Mono']">
              <span class="text-slate-400">Right Stick (X, Y)</span>
              <span id="coord-rstick" class="text-purple-400 font-semibold">0.00, 0.00</span>
            </div>
          </div>
        </div>

        <!-- Configurable Keyboard & Controller Mapping Table -->
        <div class="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Configurable Keybindings
              </h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-['JetBrains_Mono']">
                Click to Rebind
              </span>
            </div>
            <p class="text-xs text-slate-400 mb-4">
              Click any key slot below to assign a custom keyboard key. Custom bindings persist across browser reloads.
            </p>

            <!-- Table of inputs -->
            <div class="overflow-y-auto max-h-[400px] pr-1 space-y-1.5 font-['JetBrains_Mono'] text-xs" id="keybind-list">
              ${Object.entries(keyMap).map(([action, def]) => {
                const isRebinding = activeRebindAction === action;
                return `
                  <div class="flex items-center justify-between p-2 rounded-xl transition-all ${
                    isRebinding
                      ? 'bg-purple-600/20 border border-purple-500 ring-2 ring-purple-500/30'
                      : 'bg-white/[0.02] border border-white/5 hover:border-white/10'
                  }">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-200 text-xs">
                        ${def.psLabel}
                      </span>
                      <span class="text-slate-300">${def.label}</span>
                    </div>
                    <button class="btn-rebind-key px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      isRebinding
                        ? 'bg-purple-500 text-white animate-pulse'
                        : 'bg-[#090d19] hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white'
                    }" data-action="${action}">
                      ${isRebinding ? 'Press any key...' : formatKeyCode(def.code)}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Deadzone: 35%</span>
            <span class="text-emerald-400">Input Bridge Active</span>
          </div>
        </div>
      </div>

      <!-- Technical Architecture & Verified Interface Documentation -->
      <div class="glass-panel rounded-2xl p-6 font-['JetBrains_Mono'] text-xs space-y-3">
        <div class="flex items-center gap-2 text-slate-300 font-semibold border-b border-white/5 pb-2">
          <span class="text-blue-400">${icons.shield}</span>
          <span class="font-['Rajdhani'] text-sm uppercase tracking-wider font-bold">Input Architecture & Verified Capabilities</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 text-[11px] leading-relaxed">
          <div class="space-y-1">
            <span class="text-slate-200 font-semibold block">✓ Verified Input Pipeline:</span>
            <p>
              Play! WebAssembly core receives input events directly dispatched to the <code class="text-purple-300">#outputCanvas</code> target element. Physical controllers use the standard browser Gamepad API polling loop running inside <code class="text-purple-300">requestAnimationFrame</code> (60Hz) to bridge gamepad button presses and analog stick thresholds with sub-millisecond dispatch latency.
            </p>
          </div>
          <div class="space-y-1">
            <span class="text-slate-200 font-semibold block">⚠ Hardware & Browser Limitations:</span>
            <p>
              DualShock 2 pressure-sensitive face buttons (analog buttons) are unsupported by the W3C Gamepad API specification (buttons report normalized 0.0 or 1.0 float values). Rumble/Force Feedback is subject to browser permissions and OS driver capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatKeyCode(code) {
  if (!code) return 'None';
  return code
    .replace('Key', '')
    .replace('Digit', 'Num ')
    .replace('ArrowUp', '↑ Up')
    .replace('ArrowDown', '↓ Down')
    .replace('ArrowLeft', '← Left')
    .replace('ArrowRight', '→ Right')
    .replace('Enter', 'Return');
}

/**
 * Attaches real-time visualizer update listener to GamepadManager
 */
export function initControllerVisualizer() {
  const deviceNameEl = document.getElementById('controller-device-name');
  const coordLStickEl = document.getElementById('coord-lstick');
  const coordRStickEl = document.getElementById('coord-rstick');
  const lStickNub = document.getElementById('vis-lstick-nub');
  const rStickNub = document.getElementById('vis-rstick-nub');
  const badgeEl = document.getElementById('controller-status-badge');

  const highlightElement = (id, active, activeColor = '#3b82f6') => {
    const el = document.getElementById(id);
    if (!el) return;
    if (active) {
      el.setAttribute('fill', activeColor);
      el.style.filter = `drop-shadow(0 0 6px ${activeColor})`;
    } else {
      el.removeAttribute('style');
      if (id.includes('triangle')) el.setAttribute('fill', '#34d399');
      else if (id.includes('circle')) el.setAttribute('fill', '#f87171');
      else if (id.includes('cross')) el.setAttribute('fill', '#60a5fa');
      else if (id.includes('square')) el.setAttribute('fill', '#f472b6');
      else el.setAttribute('fill', '#475569');
    }
  };

  const unsubscribe = gamepadManager.subscribe((data) => {
    if (!data.activeGamepad) {
      if (deviceNameEl) deviceNameEl.textContent = 'No controller detected — Press any button';
      if (badgeEl) {
        badgeEl.textContent = '○ Listening for Gamepad...';
        badgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30';
      }
      return;
    }

    if (deviceNameEl) {
      deviceNameEl.textContent = data.activeGamepad.id.substring(0, 35);
    }
    if (badgeEl) {
      badgeEl.textContent = '● Controller Active';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }

    const live = data.liveState;
    if (!live) return;

    const btns = new Set(live.buttons);

    // Update buttons
    highlightElement('vis-cross', btns.has('cross'), '#3b82f6');
    highlightElement('vis-circle', btns.has('circle'), '#ef4444');
    highlightElement('vis-square', btns.has('square'), '#ec4899');
    highlightElement('vis-triangle', btns.has('triangle'), '#10b981');

    highlightElement('vis-dpadUp', btns.has('dpadUp') || btns.has('leftStickUp'), '#38bdf8');
    highlightElement('vis-dpadDown', btns.has('dpadDown') || btns.has('leftStickDown'), '#38bdf8');
    highlightElement('vis-dpadLeft', btns.has('dpadLeft') || btns.has('leftStickLeft'), '#38bdf8');
    highlightElement('vis-dpadRight', btns.has('dpadRight') || btns.has('leftStickRight'), '#38bdf8');

    highlightElement('vis-l1', btns.has('l1'), '#8b5cf6');
    highlightElement('vis-l2', btns.has('l2'), '#8b5cf6');
    highlightElement('vis-r1', btns.has('r1'), '#8b5cf6');
    highlightElement('vis-r2', btns.has('r2'), '#8b5cf6');

    highlightElement('vis-select', btns.has('select'), '#a855f7');
    highlightElement('vis-start', btns.has('start'), '#a855f7');

    // Update Analog Sticks
    const [lx, ly, rx, ry] = live.axes;
    if (coordLStickEl) coordLStickEl.textContent = `${lx.toFixed(2)}, ${ly.toFixed(2)}`;
    if (coordRStickEl) coordRStickEl.textContent = `${rx.toFixed(2)}, ${ry.toFixed(2)}`;

    if (lStickNub) {
      const tx = Math.max(-14, Math.min(14, lx * 14));
      const ty = Math.max(-14, Math.min(14, ly * 14));
      lStickNub.setAttribute('transform', `translate(${tx}, ${ty})`);
    }
    if (rStickNub) {
      const tx = Math.max(-14, Math.min(14, rx * 14));
      const ty = Math.max(-14, Math.min(14, ry * 14));
      rStickNub.setAttribute('transform', `translate(${tx}, ${ty})`);
    }
  });

  return unsubscribe;
}
