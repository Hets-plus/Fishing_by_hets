import type { FishingParams } from '@/src/types';

const VERSION = 'v1_';
const BASE_KEY = 'HETS_FISHING_SIM_2026';
const PARAM_ORDER: (keyof FishingParams)[] = [
  'leadWeight',
  'floatBuoyancy',
  'hookWeight',
  'baitWeight',
  'waterDensity',
  'waterDepth',
  'lineLength',
  'subLineLength',
  'hookSpacing',
  'subLineThickness',
  'waterFlow',
  'hasSubLine',
];

/** Derive encryption key from base string */
function generateKey(): Uint8Array {
  const encoder = new TextEncoder();
  const baseBytes = encoder.encode(BASE_KEY);
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    let byte = baseBytes[i % baseBytes.length];
    byte ^= i * 7;
    if (i > 0) byte ^= key[i - 1];
    key[i] = byte & 0xff;
  }
  return key;
}

/** CRC16 checksum */
function calculateChecksum(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xa001;
      } else {
        crc >>>= 1;
      }
    }
  }
  return crc & 0xffff;
}

/** Shuffle bytes using Fisher-Yates with fixed seed */
function shuffleBytes(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data);
  let seed = 0x12345678;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Reverse shuffle to restore original order */
function unshuffleBytes(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data);
  let seed = 0x12345678;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };
  const swaps: [number, number][] = [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    swaps.push([i, j]);
  }
  for (let k = swaps.length - 1; k >= 0; k--) {
    const [i, j] = swaps[k];
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Multi-round XOR encryption */
function xorEncrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  const len = data.length;
  const klen = key.length;
  // Round 1: forward XOR
  for (let i = 0; i < len; i++) {
    result[i] = data[i] ^ key[i % klen];
  }
  // Round 2: backward XOR
  for (let i = 0; i < len; i++) {
    result[i] ^= key[(len - i) % klen];
  }
  // Round 3: cross XOR
  for (let i = 0; i < len; i++) {
    result[i] ^= key[(i * 7) % klen];
  }
  return result;
}

/** XOR decryption (same operation, applied in reverse round order) */
function xorDecrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  const len = data.length;
  const klen = key.length;
  for (let i = 0; i < len; i++) {
    result[i] = data[i];
  }
  // Reverse round 3
  for (let i = 0; i < len; i++) {
    result[i] ^= key[(i * 7) % klen];
  }
  // Reverse round 2
  for (let i = 0; i < len; i++) {
    result[i] ^= key[(len - i) % klen];
  }
  // Reverse round 1
  for (let i = 0; i < len; i++) {
    result[i] ^= key[i % klen];
  }
  return result;
}

/** Encode FishingParams to URL-safe encrypted string */
export function encodeParams(params: FishingParams): string {
  // Serialize to fixed-order array of 2-byte fixed-point numbers (precision 0.01)
  const numericParams = PARAM_ORDER.filter(k => k !== 'hasSubLine');
  const byteCount = numericParams.length * 2 + 1; // +1 for boolean
  const raw = new Uint8Array(byteCount);
  const view = new DataView(raw.buffer);

  let offset = 0;
  for (const key of numericParams) {
    const val = params[key] as number;
    // Store as int16 (signed, x100 for 2 decimal places)
    const fixed = Math.round(val * 100);
    view.setInt16(offset, fixed, true);
    offset += 2;
  }
  // Boolean as byte
  raw[offset] = params.hasSubLine ? 1 : 0;

  // Encrypt
  const key = generateKey();
  const encrypted = xorEncrypt(raw, key);

  // Shuffle
  const shuffled = shuffleBytes(encrypted);

  // Add checksum (2 bytes, appended)
  const checksum = calculateChecksum(shuffled);
  const withChecksum = new Uint8Array(shuffled.length + 2);
  withChecksum.set(shuffled);
  withChecksum[shuffled.length] = checksum & 0xff;
  withChecksum[shuffled.length + 1] = (checksum >>> 8) & 0xff;

  // Base64url encode
  let binary = '';
  for (let i = 0; i < withChecksum.length; i++) {
    binary += String.fromCharCode(withChecksum[i]);
  }
  const base64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return VERSION + base64;
}

/** Decode encrypted string back to FishingParams */
export function decodeParams(encoded: string): FishingParams | null {
  try {
    if (!encoded.startsWith(VERSION)) return null;
    const base64 = encoded.slice(VERSION.length)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64 + '=='.slice((base64.length % 4 || 4) - 2);
    const binary = atob(padded);
    const withChecksum = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      withChecksum[i] = binary.charCodeAt(i);
    }

    // Verify checksum
    const dataLen = withChecksum.length - 2;
    const shuffled = withChecksum.slice(0, dataLen);
    const storedCrc = withChecksum[dataLen] | (withChecksum[dataLen + 1] << 8);
    const computedCrc = calculateChecksum(shuffled);
    if (storedCrc !== computedCrc) return null;

    // Unshuffle
    const encrypted = unshuffleBytes(shuffled);

    // Decrypt
    const key = generateKey();
    const raw = xorDecrypt(encrypted, key);

    // Deserialize
    const view = new DataView(raw.buffer);
    const numericParams = PARAM_ORDER.filter(k => k !== 'hasSubLine');
    const result: Partial<FishingParams> = {};
    let offset = 0;

    for (const key of numericParams) {
      const fixed = view.getInt16(offset, true);
      (result as Record<string, number>)[key] = fixed / 100;
      offset += 2;
    }
    result.hasSubLine = raw[offset] === 1;

    return result as FishingParams;
  } catch {
    return null;
  }
}
