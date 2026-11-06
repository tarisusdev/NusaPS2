/**
 * File Utilities for NusaPS2
 * Supports ISO, BIN, CHD, CSO, ELF file validation and storage quota checking
 */

export const SUPPORTED_EXTENSIONS = ['iso', 'bin', 'chd', 'cso', 'elf', 'isz', 'mdf'];

export function isSupportedGameFile(fileOrName) {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  if (!name) return false;
  const ext = name.split('.').pop().toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Inspect file header asynchronously to detect binary signature
 */
export async function inspectFileHeader(file) {
  try {
    const slice = file.slice(0, 64);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // ELF magic: 0x7F 0x45 0x4C 0x46 (0x7F 'E' 'L' 'F')
    if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
      const is64 = bytes[4] === 2;
      const isMips = bytes[18] === 8 || bytes[18] === 0x08; // EM_MIPS
      return {
        type: 'ELF',
        desc: isMips ? 'PlayStation 2 MIPS Executable' : 'ELF Executable',
        valid: true,
      };
    }

    // CHD magic: 'M' 'C' 'o' 'm' 'p' 'r' 'H' 'D'
    const chdHeader = String.fromCharCode(...bytes.slice(0, 8));
    if (chdHeader === 'MComprHD') {
      return {
        type: 'CHD',
        desc: 'Compressed Hunks of Data (CHD Disc Archive)',
        valid: true,
      };
    }

    // ISO-9660 magic appears at offset 32768 (Sector 16), let's check if file is big enough
    if (file.size > 32768 + 6) {
      const pvdSlice = file.slice(32768, 32768 + 6);
      const pvdBuf = await pvdSlice.arrayBuffer();
      const pvdBytes = new Uint8Array(pvdBuf);
      const id = String.fromCharCode(...pvdBytes.slice(1, 6));
      if (id === 'CD001') {
        return {
          type: 'ISO',
          desc: 'PlayStation 2 ISO-9660 Disc Image',
          valid: true,
        };
      }
    }

    const ext = file.name.split('.').pop().toUpperCase();
    return {
      type: ext || 'UNKNOWN',
      desc: `PlayStation 2 Disc Image (.${ext})`,
      valid: true,
    };
  } catch (err) {
    console.warn('File header inspection failed:', err);
    return {
      type: 'GENERIC',
      desc: 'PlayStation 2 File',
      valid: true,
    };
  }
}

/**
 * Check browser IndexedDB storage quota and remaining disk space
 */
export async function getStorageQuotaInfo() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percent = quota > 0 ? ((usage / quota) * 100).toFixed(1) : 0;
      return {
        supported: true,
        usage,
        quota,
        percent,
        persisted: await (navigator.storage.persisted ? navigator.storage.persisted() : false),
      };
    } catch (err) {
      console.warn('Storage estimate failed:', err);
    }
  }
  return {
    supported: false,
    usage: 0,
    quota: 0,
    percent: 0,
    persisted: false,
  };
}

/**
 * Request persistent storage from browser to prevent eviction
 */
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (e) {
      console.warn('Storage persist request error:', e);
    }
  }
  return false;
}
