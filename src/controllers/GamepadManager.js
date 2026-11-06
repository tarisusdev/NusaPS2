/**
 * Gamepad Manager for NusaPS2
 * Interfaces with the browser Gamepad API and bridges physical controllers
 * to the Play! WebAssembly emulator canvas via keyboard event injection.
 */
import { GAMEPAD_BUTTON_MAP, getKeyMap } from './InputMapper.js';

class GamepadManager {
  constructor() {
    this.connectedGamepads = new Map();
    this.activeGamepadIndex = 0;
    this.isRunning = false;
    this.animationFrameId = null;
    this.targetElement = null;

    // Track button states to only dispatch events on state change
    this.buttonStates = new Map();
    this.axisStates = {
      leftStickUp: false,
      leftStickDown: false,
      leftStickLeft: false,
      leftStickRight: false,
      rightStickUp: false,
      rightStickDown: false,
      rightStickLeft: false,
      rightStickRight: false,
    };

    // Subscriptions for visualizer UI
    this.listeners = new Set();

    this.deadzone = 0.35;
    this.init();
  }

  init() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log(`[Gamepad] Connected: ${e.gamepad.id} (index: ${e.gamepad.index})`);
      this.connectedGamepads.set(e.gamepad.index, e.gamepad);
      if (this.connectedGamepads.size === 1) {
        this.activeGamepadIndex = e.gamepad.index;
      }
      this.notifyListeners();
      if (!this.isRunning) {
        this.startPolling();
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(`[Gamepad] Disconnected: ${e.gamepad.id}`);
      this.connectedGamepads.delete(e.gamepad.index);
      if (this.activeGamepadIndex === e.gamepad.index) {
        const next = this.connectedGamepads.keys().next();
        this.activeGamepadIndex = next.done ? null : next.value;
      }
      this.notifyListeners();
      if (this.connectedGamepads.size === 0) {
        this.stopPolling();
      }
    });

    // Check if gamepads are already connected on load
    const initialGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of initialGamepads) {
      if (gp) {
        this.connectedGamepads.set(gp.index, gp);
      }
    }
    if (this.connectedGamepads.size > 0) {
      this.startPolling();
    }
  }

  setTargetElement(el) {
    this.targetElement = el;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data = {}) {
    const activeGamepad = this.getActiveGamepad();
    const payload = {
      gamepads: Array.from(this.connectedGamepads.values()),
      activeGamepad,
      activeGamepadIndex: this.activeGamepadIndex,
      ...data,
    };
    for (const cb of this.listeners) {
      cb(payload);
    }
  }

  getActiveGamepad() {
    if (this.activeGamepadIndex === null || !navigator.getGamepads) return null;
    const gamepads = navigator.getGamepads();
    return gamepads[this.activeGamepadIndex] || null;
  }

  setActiveGamepadIndex(index) {
    if (this.connectedGamepads.has(index)) {
      this.activeGamepadIndex = index;
      this.notifyListeners();
    }
  }

  startPolling() {
    if (this.isRunning) return;
    this.isRunning = true;

    const poll = () => {
      this.pollGamepadState();
      this.animationFrameId = requestAnimationFrame(poll);
    };

    this.animationFrameId = requestAnimationFrame(poll);
  }

  stopPolling() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pollGamepadState() {
    const gp = this.getActiveGamepad();
    if (!gp) return;

    // Send visual state to listeners
    const buttonsActive = [];
    const axesValues = gp.axes ? Array.from(gp.axes) : [0, 0, 0, 0];

    // Check Buttons
    const keyMap = getKeyMap();
    if (gp.buttons) {
      for (let i = 0; i < gp.buttons.length; i++) {
        const btn = gp.buttons[i];
        const isPressed = btn.pressed || btn.value > 0.5;
        const psButton = GAMEPAD_BUTTON_MAP[i];

        if (isPressed) {
          buttonsActive.push(psButton || `btn_${i}`);
        }

        const prevPressed = this.buttonStates.get(i) || false;
        if (isPressed !== prevPressed) {
          this.buttonStates.set(i, isPressed);
          if (psButton && keyMap[psButton]) {
            this.dispatchEmulatorKey(keyMap[psButton], isPressed);
          }
        }
      }
    }

    // Check Left Analog Stick (Axes 0 = X, 1 = Y)
    const [lx, ly, rx, ry] = [
      axesValues[0] || 0,
      axesValues[1] || 0,
      axesValues[2] || 0,
      axesValues[3] || 0,
    ];

    this.handleAxisDirection(ly < -this.deadzone, 'leftStickUp', keyMap);
    this.handleAxisDirection(ly > this.deadzone, 'leftStickDown', keyMap);
    this.handleAxisDirection(lx < -this.deadzone, 'leftStickLeft', keyMap);
    this.handleAxisDirection(lx > this.deadzone, 'leftStickRight', keyMap);

    // Right Analog Stick (Axes 2 = X, 3 = Y)
    this.handleAxisDirection(ry < -this.deadzone, 'rightStickUp', keyMap);
    this.handleAxisDirection(ry > this.deadzone, 'rightStickDown', keyMap);
    this.handleAxisDirection(rx < -this.deadzone, 'rightStickLeft', keyMap);
    this.handleAxisDirection(rx > this.deadzone, 'rightStickRight', keyMap);

    // Notify visualizer subscribers with live gamepad state
    this.notifyListeners({
      liveState: {
        id: gp.id,
        buttons: buttonsActive,
        axes: axesValues,
      },
    });
  }

  handleAxisDirection(isActive, keyName, keyMap = null) {
    if (this.axisStates[keyName] !== isActive) {
      this.axisStates[keyName] = isActive;
      const map = keyMap || getKeyMap();
      const keyDef = map[keyName];
      if (keyDef) {
        this.dispatchEmulatorKey(keyDef, isActive);
      }
    }
  }

  dispatchEmulatorKey(keyDef, isPressed) {
    const target = this.targetElement || document.getElementById('outputCanvas') || document;
    const eventType = isPressed ? 'keydown' : 'keyup';

    const evt = new KeyboardEvent(eventType, {
      key: keyDef.key,
      code: keyDef.code,
      bubbles: true,
      cancelable: true,
    });

    target.dispatchEvent(evt);
  }
}

export const gamepadManager = new GamepadManager();
