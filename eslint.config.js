export default [
  // Ignore build artifacts, vendor files, and third-party WebAssembly core
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/emulator/**',
      'public/coi-serviceworker.js',
      'src/assets/**',
      'docs/**',
      'coverage/**',
      '*.min.js',
    ],
  },

  // Application source configuration (browser-first Vanilla JS / TS)
  {
    files: ['src/**/*.js', 'src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        Uint8Array: 'readonly',
        ArrayBuffer: 'readonly',
        SharedArrayBuffer: 'readonly',
        OffscreenCanvas: 'readonly',
        HTMLCanvasElement: 'readonly',
        KeyboardEvent: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        indexedDB: 'readonly',
        IDBDatabase: 'readonly',
        IDBTransaction: 'readonly',
        IDBRequest: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'no-undef': 'error',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['warn', 'smart'],
    },
  },

  // Configuration files (Vite, server, etc.)
  {
    files: ['*.config.js', '*.config.ts', 'server.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
];
