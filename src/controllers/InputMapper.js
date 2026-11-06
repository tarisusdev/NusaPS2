/**
 * Input Mapper for NusaPS2
 * Maps PS2 buttons and Gamepad API inputs to keyboard events for the Play! emulator
 */

export const DEFAULT_KEY_MAP = {
  // Action Buttons
  cross: { code: 'KeyZ', key: 'z', label: 'Cross (✕)', psLabel: '✕' },
  circle: { code: 'KeyX', key: 'x', label: 'Circle (○)', psLabel: '○' },
  square: { code: 'KeyA', key: 'a', label: 'Square (□)', psLabel: '□' },
  triangle: { code: 'KeyS', key: 's', label: 'Triangle (△)', psLabel: '△' },

  // D-Pad
  dpadUp: { code: 'ArrowUp', key: 'ArrowUp', label: 'D-Pad Up', psLabel: '↑' },
  dpadDown: { code: 'ArrowDown', key: 'ArrowDown', label: 'D-Pad Down', psLabel: '↓' },
  dpadLeft: { code: 'ArrowLeft', key: 'ArrowLeft', label: 'D-Pad Left', psLabel: '←' },
  dpadRight: { code: 'ArrowRight', key: 'ArrowRight', label: 'D-Pad Right', psLabel: '→' },

  // Shoulder & Triggers
  l1: { code: 'Digit1', key: '1', label: 'L1', psLabel: 'L1' },
  l2: { code: 'Digit2', key: '2', label: 'L2', psLabel: 'L2' },
  l3: { code: 'Digit3', key: '3', label: 'L3 (Thumb Click)', psLabel: 'L3' },
  r1: { code: 'Digit8', key: '8', label: 'R1', psLabel: 'R1' },
  r2: { code: 'Digit9', key: '9', label: 'R2', psLabel: 'R2' },
  r3: { code: 'Digit0', key: '0', label: 'R3 (Thumb Click)', psLabel: 'R3' },

  // System
  start: { code: 'Enter', key: 'Enter', label: 'Start', psLabel: 'START' },
  select: { code: 'Backspace', key: 'Backspace', label: 'Select', psLabel: 'SELECT' },

  // Left Stick Simulation
  leftStickUp: { code: 'KeyT', key: 't', label: 'Left Stick Up', psLabel: 'LS ↑' },
  leftStickDown: { code: 'KeyG', key: 'g', label: 'Left Stick Down', psLabel: 'LS ↓' },
  leftStickLeft: { code: 'KeyF', key: 'f', label: 'Left Stick Left', psLabel: 'LS ←' },
  leftStickRight: { code: 'KeyH', key: 'h', label: 'Left Stick Right', psLabel: 'LS →' },

  // Right Stick Simulation
  rightStickUp: { code: 'KeyI', key: 'i', label: 'Right Stick Up', psLabel: 'RS ↑' },
  rightStickDown: { code: 'KeyK', key: 'k', label: 'Right Stick Down', psLabel: 'RS ↓' },
  rightStickLeft: { code: 'KeyJ', key: 'j', label: 'Right Stick Left', psLabel: 'RS ←' },
  rightStickRight: { code: 'KeyL', key: 'l', label: 'Right Stick Right', psLabel: 'RS →' },
};

// Standard Gamepad button index to PS2 button name
export const GAMEPAD_BUTTON_MAP = {
  0: 'cross',       // A / Cross
  1: 'circle',      // B / Circle
  2: 'square',      // X / Square
  3: 'triangle',    // Y / Triangle
  4: 'l1',          // LB / L1
  5: 'r1',          // RB / R1
  6: 'l2',          // LT / L2
  7: 'r2',          // RT / R2
  8: 'select',      // Back / Share / Select
  9: 'start',       // Start / Options
  10: 'l3',         // Left Thumb click
  11: 'r3',         // Right Thumb click
  12: 'dpadUp',     // D-Pad Up
  13: 'dpadDown',   // D-Pad Down
  14: 'dpadLeft',   // D-Pad Left
  15: 'dpadRight',  // D-Pad Right
};

const KEYMAP_STORAGE_KEY = 'nusaps2_custom_keymap';

export function getKeyMap() {
  try {
    const saved = localStorage.getItem(KEYMAP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults in case of missing keys
      const merged = { ...DEFAULT_KEY_MAP };
      for (const [action, def] of Object.entries(parsed)) {
        if (merged[action]) {
          merged[action] = { ...merged[action], ...def };
        }
      }
      return merged;
    }
  } catch (e) {
    console.warn('[InputMapper] Failed to load keymap from storage:', e);
  }
  return { ...DEFAULT_KEY_MAP };
}

export function updateKeyBinding(action, code, key) {
  const currentMap = getKeyMap();
  if (currentMap[action]) {
    currentMap[action].code = code;
    currentMap[action].key = key;
    try {
      localStorage.setItem(KEYMAP_STORAGE_KEY, JSON.stringify(currentMap));
    } catch (e) {
      console.warn('[InputMapper] Failed to save keymap:', e);
    }
  }
  return currentMap;
}

export function resetKeyMap() {
  try {
    localStorage.removeItem(KEYMAP_STORAGE_KEY);
  } catch {}
  return { ...DEFAULT_KEY_MAP };
}
