# Contributing to NusaPS2

Thank you for your interest in contributing to **NusaPS2**! We welcome bug fixes, documentation improvements, new emulator features, and performance enhancements.

## Code of Conduct

Please be respectful and considerate of all contributors. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Development Workflow

1. **Fork the repo** and clone your fork locally:

   ```bash
   git clone https://github.com/tarisusdev/NusaPS2.git
   cd NusaPS2
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the local development server**:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in Google Chrome, Microsoft Edge, Brave, or Firefox.

4. **Verify types and build**:
   ```bash
   npm run lint
   npm run build
   ```

## Contribution Guidelines

- **Vanilla JavaScript & Modern Standards**: NusaPS2 intentionally avoids heavy frontend frameworks (no React/Vue/Angular in runtime UI). Keep modules modular, clean, and fast.
- **Cross-Origin Isolation**: Remember that WebAssembly multithreading requires COOP and COEP headers. Ensure tests run with isolation active.
- **Emulator Integrity**: Never mock or fake emulation APIs. Ensure all changes to `EmulatorAdapter.js` or `EmulatorLoader.js` interface with real Play! core methods.
- **No Copyrighted Files**: Do NOT commit copyrighted BIOS dumps, proprietary firmware, or commercial game ROMs. Homebrew samples only.

## Submitting Pull Requests

1. Create a descriptive branch: `git checkout -b fix/gamepad-axis-deadzone` or `feat/scanline-preset`.
2. Commit with conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`.
3. Open a Pull Request on GitHub against `main`. Provide a clear description and screenshots/recordings if applicable.
