<div align="center">

# 🎮 NusaPS2 — Web-Based PlayStation 2 Emulator

**The High-Performance In-Browser PlayStation 2 Emulator & Console Dashboard**  
*Built with WebAssembly (WASM), WebGL 2.0, Vite & Vanilla JavaScript*

[![Live Demo](https://img.shields.io/badge/Demo-Live_Online-8b5cf6?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-2l6dtqf3lp2mvtklhwu3nu-452188101421.asia-northeast1.run.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)
[![WebAssembly](https://img.shields.io/badge/Core-WebAssembly_64--bit-654ff0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)
[![WebGL 2.0](https://img.shields.io/badge/Graphics-WebGL_2.0_HW_Acc-06b6d4?style=for-the-badge&logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-10b981?style=for-the-badge&logo=github&logoColor=white)](CONTRIBUTING.md)

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-technical-architecture">Architecture</a> •
  <a href="#-supported-formats">Formats</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-legal--compliance">Legal</a>
</p>

---

</div>

## 🌟 Overview

**NusaPS2** is a production-oriented, browser-native PlayStation 2 emulation frontend that runs real PlayStation 2 binaries directly inside desktop web browsers. Powered by the WebAssembly build of the open-source **[Play!](https://purei.org/)** emulator, NusaPS2 bridges classic sixth-generation console gaming to modern web standards—no native executable downloads, browser plugins, or proprietary BIOS installations required.

### ⚡ Why NusaPS2 Stands Out

| Feature | Traditional Web Emulators | NusaPS2 |
| :--- | :--- | :--- |
| **Large ISO Files (1–4.7 GB)** | ❌ Tab crashes (RAM OOM) | ✅ **Streaming Block Device** (`File.slice()`) reads on-demand |
| **BIOS Requirement** | ❌ Requires proprietary SCPH dumps | ✅ **Built-in HLE BIOS** (Runs homebrew & games out of the box) |
| **Graphics Pipeline** | ⚠️ Software/Canvas 2D fallback | ✅ **Direct WebGL2 Hardware Acceleration** with OffscreenCanvas |
| **Controller Support** | ⚠️ Limited keyboard-only | ✅ **W3C Gamepad API** (DualSense, DS4, Xbox, Switch) + Live SVG Visualizer |
| **Save Data** | ⚠️ Volatile local storage | ✅ **Dual 8MB MagicGate Memory Cards** (`.bin` / `.ps2`) + Snapshots |
| **Data Privacy** | ❌ Uploads files to remote server | ✅ **100% Client-Side Private** in browser IndexedDB |

---

## ✨ Features

- **🚀 Real WebAssembly Execution**: Boots real PS2 MIPS ELF binaries and CD/DVD disc images directly inside Web Workers using `SharedArrayBuffer` multithreading.
- **💿 Zero-Memory Disc Streaming (`DiscImageDevice`)**: Plays multi-gigabyte ISO and CHD games directly from the user's hard drive or IndexedDB without buffering entire gigabytes into RAM.
- **🎨 Console-Grade UI/UX**: Dark PlayStation 5-inspired design with sleek glassmorphism, responsive 16:9 / 4:3 aspect ratios, and customizable CRT scanline shaders.
- **🎮 Complete Controller Integration**:
  - Auto-detection for DualShock 4, DualSense, Xbox Wireless, and Nintendo Switch Pro gamepads.
  - Fully configurable keyboard mapping with in-browser rebinding.
  - Real-time 60Hz DualShock 2 visualizer testing button presses, triggers, and analog stick coordinate deflection.
- **💾 Dual Virtual Memory Cards**:
  - Slot 1 (`/work/Memorycards/Memorycard1.bin`) and Slot 2 (`/work/Memorycards/Memorycard2.bin`).
  - Seamless export and import supporting standard `.bin` and `.ps2` memory card formats.
  - Unlimited local snapshot backups with game metadata tagging.
- **🔍 Comprehensive Diagnostics**: One-click system environment auditor checking WASM SIMD/Threads, WebGL2 GPU driver vendor, COOP/COEP headers, and Gamepad API telemetry.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- Modern desktop browser (Google Chrome, Microsoft Edge, Brave, or Firefox)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/wawansaid/nusaps2.git

# 2. Enter project directory
cd nusaps2

# 3. Install dependencies
npm install

# 4. Start local development server (with COOP/COEP Cross-Origin Isolation headers)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📂 Supported Formats

| Format | Extension | Type | Status |
| :--- | :--- | :--- | :--- |
| **ISO-9660** | `.iso` | Standard PS2 DVD/CD disc images | ✅ Supported (Streaming) |
| **MIPS ELF** | `.elf` | PlayStation 2 Homebrew / Executables | ✅ Supported (MEMFS Staging) |
| **Compressed Hunks** | `.chd` | MAME / Play! Compressed disc archive | ✅ Supported |
| **Raw Disc Tracks** | `.bin`, `.mdf` | Binary disc dumps | ✅ Supported |
| **Compressed ISO** | `.cso`, `.isz` | Compressed disc images | ✅ Supported |

> **Included Out-of-the-Box**: Includes **wLaunchELF v4.43a**, the open-source PS2 homebrew file manager, bootable in 1-click on the dashboard.

---

## 🛠️ Technical Architecture

```
[ User Disc (.ISO / .ELF) ]
           │
           ▼
[ Browser File System / IndexedDB ]
           │
     File.slice() (Streaming on demand)
           │
           ▼
[ DiscImageDevice Virtual Block Bridge ] ──► [ Emscripten MEMFS ]
           │                                          │
           ▼                                          ▼
[ Play! Emotion Engine (EE) ]  ◄────►  [ Graphics Synthesizer (GS) ]
    WebAssembly Threads                      WebGL 2.0 Canvas
    SharedArrayBuffer (COOP/COEP)            OffscreenCanvas Worker
           │                                          │
           ▼                                          ▼
[ SPU2 WebAudio Synthesizer ]          [ W3C Gamepad API (60Hz Loop) ]
```

### 1. Cross-Origin Isolation (COOP / COEP)
WebAssembly multithreading requires `SharedArrayBuffer`, which modern browsers restrict behind strict Cross-Origin Isolation security policies:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
NusaPS2 configures these headers in `vite.config.ts` and loads `coi-serviceworker.js` to enable execution across embedded iframe environments.

### 2. Streaming Block Device Driver
Instead of reading 4.5 GB ISOs into memory:
```javascript
export class DiscImageDevice {
  read(dstPtr, offset, size) {
    this.doneFlag = false;
    this.file.slice(offset, offset + size).arrayBuffer().then((buffer) => {
      this.module.HEAPU8.set(new Uint8Array(buffer), dstPtr);
      this.doneFlag = true;
    });
  }
}
```

---

## 🗺️ Roadmap

- [x] Real Play! WebAssembly core integration with OffscreenCanvas
- [x] Streaming disc device for multi-gigabyte ISOs
- [x] DualShock 2 SVG interactive visualizer & Gamepad API bridge
- [x] Dual 8MB MagicGate Memory Card export/import (`.bin` / `.ps2`)
- [x] Configurable keyboard rebinding with persistent storage
- [x] Comprehensive diagnostics page with one-click report export
- [ ] WebRTC P2P Multiplayer / Netplay protocol
- [ ] Custom post-processing CRT & scanline shader pipeline
- [ ] Direct Google Drive / Dropbox cloud save syncing

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for full development guidelines.

---

## 📜 Legal & Compliance

- **No Proprietary BIOS Included**: NusaPS2 does not bundle or distribute Sony PlayStation 2 BIOS ROMs. Emulation is powered by the built-in High-Level Emulation (HLE) of the open-source Play! core.
- **User-Supplied Backups**: NusaPS2 is intended strictly for homebrew development and playing legally owned game backups created from physical optical media.
- **Trademarks**: "PlayStation", "PS2", "DualShock", and "MagicGate" are registered trademarks of Sony Interactive Entertainment Inc. NusaPS2 is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Sony.

---

<div align="center">

Made with passion for retro computing and WebAssembly by [Wawan Said](https://github.com/wawansaid) & Contributors.

⭐ **If you find this project exciting, consider giving it a Star on GitHub!** ⭐

</div>
