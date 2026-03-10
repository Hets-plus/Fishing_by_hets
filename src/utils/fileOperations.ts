import type { FishingParams } from '@/src/types';
import { encodeParams, decodeParams } from './paramEncoder';

export interface ShareData {
  version: string;
  appName: string;
  timestamp: string;
  description?: string;
  encrypted: boolean;
  data: string;
  params: FishingParams;
}

/** Create file data structure */
export function createFileData(
  params: FishingParams,
  description?: string
): ShareData {
  return {
    version: '1.0',
    appName: '智能钓鱼调漂模拟器',
    timestamp: new Date().toISOString(),
    description,
    encrypted: true,
    data: encodeParams(params),
    params, // Keep plaintext as backup
  };
}

/** Validate file format */
export function validateFileFormat(data: unknown): data is ShareData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === 'string' &&
    typeof obj.appName === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.encrypted === 'boolean' &&
    typeof obj.data === 'string' &&
    typeof obj.params === 'object'
  );
}

/** Export params to .fishing file */
export function exportToFile(
  params: FishingParams,
  description?: string
): void {
  const fileData = createFileData(params, description);
  const json = JSON.stringify(fileData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `fishing-config-${Date.now()}.fishing`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Import params from .fishing file */
export async function importFromFile(file: File): Promise<FishingParams> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.fishing')) {
      reject(new Error('Invalid file type. Please select a .fishing file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!validateFileFormat(data)) {
          reject(new Error('Invalid file format.'));
          return;
        }

        // Try to decode encrypted data first
        if (data.encrypted && data.data) {
          const decoded = decodeParams(data.data);
          if (decoded) {
            resolve(decoded);
            return;
          }
        }

        // Fallback to plaintext params
        if (data.params) {
          resolve(data.params);
          return;
        }

        reject(new Error('Failed to decode parameters.'));
      } catch (err) {
        reject(new Error('Failed to parse file: ' + (err as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsText(file);
  });
}
