import type { FishingParams } from '@/src/types';
import { encodeParams, decodeParams } from './paramEncoder';

/** Generate share URL with encrypted params */
export function generateShareUrl(params: FishingParams): string {
  const encoded = encodeParams(params);
  const baseUrl = getCurrentUrl();
  return `${baseUrl}#/share?p=${encoded}`;
}

/** Parse share URL and extract params */
export function parseShareUrl(url: string): FishingParams | null {
  try {
    // Extract hash part
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) return null;

    const hash = url.slice(hashIndex + 1);

    // Check if it's a share URL
    if (!hash.startsWith('/share?p=')) return null;

    // Extract encoded params
    const encoded = hash.slice('/share?p='.length);
    return decodeParams(encoded);
  } catch {
    return null;
  }
}

/** Parse params from current window location */
export function parseCurrentUrl(): FishingParams | null {
  const hash = window.location.hash;
  if (!hash || !hash.includes('/share?p=')) return null;

  const encoded = hash.split('/share?p=')[1];
  if (!encoded) return null;

  return decodeParams(encoded);
}

/** Get current page URL (without hash) */
export function getCurrentUrl(): string {
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}`;
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback to legacy method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/** Share via Web Share API (mobile-friendly) */
export async function shareViaWebShare(
  url: string,
  title: string = '智能钓鱼调漂模拟器配置'
): Promise<boolean> {
  try {
    if (!navigator.share) return false;

    await navigator.share({
      title,
      text: '查看我的钓鱼调漂配置',
      url,
    });
    return true;
  } catch {
    return false;
  }
}
