/**
 * Emulator Loader for NusaPS2
 * Loads and initializes the real Play! WebAssembly PlayStation 2 core.
 * Handles Cross-Origin Isolation (COOP/COEP / SharedArrayBuffer) and
 * configures the WebAssembly binary with an OffscreenCanvas rendering context.
 */

/**
 * DiscImageDevice bridges the Emscripten virtual block device
 * to the browser's File.slice() streaming API.
 * This allows playing multi-gigabyte PS2 ISOs without running out of RAM.
 */
export class DiscImageDevice {
  constructor(module) {
    this.module = module;
    this.doneFlag = false;
    this.file = null;
  }

  read(dstPtr, offset, size) {
    if (!this.file) {
      console.error('[DiscImageDevice] Read requested with no file set.');
      this.doneFlag = true;
      return;
    }
    this.doneFlag = false;
    this.file
      .slice(offset, offset + size)
      .arrayBuffer()
      .then((buffer) => {
        if (this.module && this.module.HEAPU8) {
          this.module.HEAPU8.set(new Uint8Array(buffer), dstPtr);
        }
        this.doneFlag = true;
      })
      .catch((err) => {
        console.error('[DiscImageDevice] Read error:', err);
        this.doneFlag = true;
      });
  }

  getFileSize() {
    if (!this.file) {
      console.warn('[DiscImageDevice] getFileSize called with no file set.');
      return 0;
    }
    return this.file.size;
  }

  isDone() {
    return this.doneFlag;
  }

  setFile(file) {
    this.file = file;
    this.doneFlag = true;
  }
}

/**
 * Validates the browser execution environment for WebAssembly thread execution,
 * Cross-Origin Isolation headers (COOP/COEP), SharedArrayBuffer, and OffscreenCanvas.
 */
export function checkBrowserEnvironment() {
  const isIsolated = typeof window !== 'undefined' && Boolean(window.crossOriginIsolated);
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

  let hasWebGL2 = false;
  try {
    if (hasOffscreenCanvas) {
      const testOffscreen = new OffscreenCanvas(64, 64);
      hasWebGL2 = Boolean(testOffscreen.getContext('webgl2'));
    } else if (typeof document !== 'undefined') {
      const testCanvas = document.createElement('canvas');
      hasWebGL2 = Boolean(testCanvas.getContext('webgl2'));
    }
  } catch (e) {
    hasWebGL2 = false;
  }

  // Determine isolation mechanism (native HTTP headers vs service worker helper)
  let isolationMode = 'unisolated';
  if (isIsolated) {
    isolationMode = 'native';
  } else if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
    isolationMode = 'serviceworker';
  }

  return {
    isIsolated,
    hasSharedArrayBuffer,
    hasOffscreenCanvas,
    hasWebGL2,
    isolationMode,
    ready: isIsolated && hasSharedArrayBuffer && hasWebGL2,
    message: isIsolated
      ? 'Cross-Origin Isolation verified. WebAssembly multithreading is active.'
      : 'Cross-Origin Isolation pending. Ensure COOP: same-origin and COEP: require-corp headers are set or coi-serviceworker is active.',
  };
}

/**
 * Sets up an OffscreenCanvas context target for WebGL2 execution.
 * If given an HTMLCanvasElement, it safely transfers control to an OffscreenCanvas
 * and configures DOM selector interceptors so Emscripten binds to the Offscreen context.
 *
 * @param {HTMLCanvasElement|OffscreenCanvas} canvasTarget
 * @param {Object} options
 * @returns {OffscreenCanvas}
 */
export function setupOffscreenCanvas(canvasTarget, options = {}) {
  const { onLog } = options;

  // 1. If already an OffscreenCanvas, return it directly
  if (typeof OffscreenCanvas !== 'undefined' && canvasTarget instanceof OffscreenCanvas) {
    onLog?.('[NusaPS2] Direct OffscreenCanvas context supplied.');
    return canvasTarget;
  }

  // 2. If it's an HTMLCanvasElement, check if it was previously transferred
  if (typeof HTMLCanvasElement !== 'undefined' && canvasTarget instanceof HTMLCanvasElement) {
    // If this canvas element already had its control transferred, reuse the existing instance
    if (canvasTarget.__nusaOffscreenCanvas) {
      onLog?.('[NusaPS2] Reusing previously transferred OffscreenCanvas context.');
      return canvasTarget.__nusaOffscreenCanvas;
    }

    if (typeof OffscreenCanvas !== 'undefined' && typeof canvasTarget.transferControlToOffscreen === 'function') {
      try {
        const offscreen = canvasTarget.transferControlToOffscreen();
        canvasTarget.__nusaOffscreenCanvas = offscreen;

        // Synchronize initial dimensions
        offscreen.width = canvasTarget.width || 640;
        offscreen.height = canvasTarget.height || 448;

        // Provide delegation fallback so any external calls to canvas.getContext return the offscreen context
        const origGetContext = canvasTarget.getContext;
        canvasTarget.getContext = function (contextType, contextAttributes) {
          try {
            return offscreen.getContext(contextType, contextAttributes);
          } catch (e) {
            return origGetContext ? origGetContext.call(canvasTarget, contextType, contextAttributes) : null;
          }
        };

        // Ensure Emscripten's document.querySelector('#outputCanvas') hooks return the offscreen canvas
        if (typeof document !== 'undefined') {
          const originalQuerySelector = document.querySelector.bind(document);
          const targetId = canvasTarget.id || 'outputCanvas';
          const selectorId = `#${targetId}`;

          document.querySelector = function (selector) {
            if (selector === selectorId || selector === '#outputCanvas') {
              return offscreen;
            }
            return originalQuerySelector(selector);
          };
        }

        onLog?.('[NusaPS2] Successfully transferred canvas control to OffscreenCanvas context.');
        return offscreen;
      } catch (err) {
        console.warn('[NusaPS2] Canvas transferControlToOffscreen fallback:', err);
        onLog?.(`[NusaPS2] transferControlToOffscreen skipped (${err.message}), using canvas fallback.`);
        return canvasTarget;
      }
    }

    return canvasTarget;
  }

  // 3. Fallback: instantiate a new OffscreenCanvas if supported
  if (typeof OffscreenCanvas !== 'undefined') {
    onLog?.('[NusaPS2] Creating new standalone OffscreenCanvas (640x448).');
    return new OffscreenCanvas(640, 448);
  }

  return canvasTarget;
}

/**
 * Loads and boots the Play! PS2 WebAssembly core instance.
 *
 * @param {Object} params
 * @param {HTMLCanvasElement|OffscreenCanvas} params.canvasElement Canvas element or OffscreenCanvas
 * @param {boolean} [params.useOffscreen=true] Whether to use OffscreenCanvas context
 * @param {Function} [params.onLog] Optional log callback
 * @param {Function} [params.onError] Optional error callback
 * @returns {Promise<Object>} The initialized Play! Emscripten core module
 */
export async function initializePlayCore({ canvasElement, useOffscreen = true, onLog, onError }) {
  // Verify environment and Cross-Origin Isolation headers
  const env = checkBrowserEnvironment();
  if (!env.hasSharedArrayBuffer) {
    const errorMsg =
      'WebAssembly threads require SharedArrayBuffer. Please ensure Cross-Origin Isolation headers ' +
      '(Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp) are active, ' +
      'or reload to activate the coi-serviceworker.';
    onError?.(errorMsg);
    throw new Error(errorMsg);
  }

  if (!canvasElement) {
    throw new Error('Canvas element or OffscreenCanvas target is required to initialize WebGL display.');
  }

  onLog?.('[NusaPS2] Verifying Cross-Origin Isolation & SharedArrayBuffer...');
  onLog?.(`[NusaPS2] Isolation status: ${env.isIsolated ? 'ACTIVE' : 'SERVICE-WORKER'}`);

  // Resolve OffscreenCanvas context
  let renderCanvas = canvasElement;
  if (useOffscreen && env.hasOffscreenCanvas) {
    onLog?.('[NusaPS2] Initializing OffscreenCanvas rendering context...');
    renderCanvas = setupOffscreenCanvas(canvasElement, { onLog });
  }

  onLog?.('[NusaPS2] Loading Play.js WebAssembly loader...');

  const config = {
    canvas: renderCanvas,
    locateFile: (path, prefix) => {
      if (path.endsWith('.wasm')) return '/emulator/Play.wasm';
      if (path.endsWith('.js')) return '/emulator/Play.js';
      return (prefix || '/emulator/') + path;
    },
    mainScriptUrlOrBlob:
      typeof window !== 'undefined'
        ? new URL('/emulator/Play.js', window.location.href).href
        : '/emulator/Play.js',
    print: (text) => {
      onLog?.(`[Core] ${text}`);
      console.log('[Play! Core]', text);
    },
    printErr: (text) => {
      console.warn('[Play! Core Err]', text);
      if (text.includes('Assertion') || text.includes('abort')) {
        onError?.(text);
      }
    },
  };

  try {
    const scriptPath = '/emulator/Play.js';
    const playModule = await import(/* @vite-ignore */ scriptPath);
    const playFactory = playModule.default || playModule;

    if (typeof playFactory !== 'function') {
      throw new Error('Play! factory function not found in Play.js export.');
    }

    onLog?.('[NusaPS2] Compiling and instantiating Play.wasm module...');
    const core = await playFactory(config);

    // Save references to canvas and offscreen canvas on the core instance
    core.canvas = renderCanvas;
    core.offscreenCanvas = renderCanvas;

    // Prepare virtual workspace directory in MEMFS
    try {
      core.FS.mkdir('/work');
    } catch {}
    try {
      core.FS.mkdir('/work/Memorycards');
    } catch {}

    // Attach streaming disc image device for ISO/BIN chunks
    core.discImageDevice = new DiscImageDevice(core);

    // Initialize virtual machine (Emotion Engine + Graphics Synthesizer)
    onLog?.('[NusaPS2] Initializing Emotion Engine & Graphics Synthesizer VM...');
    if (typeof core.ccall === 'function') {
      core.ccall('initVm', '', [], []);
    } else if (typeof core._initVm === 'function') {
      core._initVm();
    }

    onLog?.('[NusaPS2] Play! WebAssembly VM initialized successfully with OffscreenCanvas context.');
    return core;
  } catch (err) {
    console.error('[NusaPS2] Core initialization error:', err);
    onError?.(err.message || String(err));
    throw err;
  }
}
