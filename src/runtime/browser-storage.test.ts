import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getBrowserStorage,
  readBrowserStorageItem,
  removeBrowserStorageItem,
  writeBrowserStorageItem
} from './browser-storage.ts';

const originalWindow = globalThis.window;
const originalLocalStorage = globalThis.localStorage;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: originalLocalStorage
  });
  window.localStorage.clear();
});

describe('browser storage helper', () => {
  it('reads, writes, and removes localStorage items when storage is available', () => {
    expect(getBrowserStorage()).toBe(window.localStorage);

    expect(writeBrowserStorageItem('overfantasy:test', 'value')).toBe(true);
    expect(readBrowserStorageItem('overfantasy:test')).toBe('value');

    expect(removeBrowserStorageItem('overfantasy:test')).toBe(true);
    expect(readBrowserStorageItem('overfantasy:test')).toBeNull();
  });

  it('falls back to global localStorage when window is unavailable', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined
    });

    expect(writeBrowserStorageItem('overfantasy:test', 'global')).toBe(true);
    expect(readBrowserStorageItem('overfantasy:test')).toBe('global');
  });

  it('returns safe defaults when storage is unavailable or throws', () => {
    const throwingStorage = {
      getItem: vi.fn(() => { throw new Error('blocked'); }),
      setItem: vi.fn(() => { throw new Error('blocked'); }),
      removeItem: vi.fn(() => { throw new Error('blocked'); })
    };
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: throwingStorage }
    });

    expect(readBrowserStorageItem('overfantasy:test')).toBeNull();
    expect(writeBrowserStorageItem('overfantasy:test', 'value')).toBe(false);
    expect(removeBrowserStorageItem('overfantasy:test')).toBe(false);
  });
});
