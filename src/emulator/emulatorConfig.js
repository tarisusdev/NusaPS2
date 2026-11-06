/**
 * Emulator Configuration and Status Definitions for NusaPS2
 */

export const EMULATOR_STATUS = {
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  LOADING_GAME: 'LOADING_GAME',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
};

export const DEFAULT_EMULATOR_CONFIG = {
  coreName: 'Play! (PlayStation 2 WebAssembly Core)',
  coreVersion: 'v0.58-WASM',
  scriptUrl: '/emulator/Play.js',
  wasmUrl: '/emulator/Play.wasm',
  aspectRatio: '4:3', // '4:3', '16:9', 'fill'
  resolutionScale: 1, // 1x Native (640x480), 2x (1280x960), 3x (1920x1440)
  forceBilinear: true,
  audioEnabled: true,
  volume: 1.0,
  enableScanlines: false,
};
