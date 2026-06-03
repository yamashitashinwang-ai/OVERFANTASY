import createDebug from 'debug';
import { readBrowserStorageItem, removeBrowserStorageItem, writeBrowserStorageItem } from '../browser-storage.ts';
import { ROOT } from './namespaces.ts';

// Enable a debug pattern at runtime instead of editing localStorage manually.
export function setLogPattern(pattern?: string | null) {
  const changed = pattern
    ? writeBrowserStorageItem('debug', pattern)
    : removeBrowserStorageItem('debug');
  if (!changed) return;
  createDebug.enable(pattern || '');
}

// Useful default for support flows: keep events, warnings, and errors, but drop traces.
export function enableDefaultPattern() {
  if (readBrowserStorageItem('debug')) return;
  setLogPattern(`${ROOT}:*:event,${ROOT}:*:warn,${ROOT}:*:error`);
}
