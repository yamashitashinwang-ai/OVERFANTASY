type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function getBrowserStorage(): BrowserStorage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    return null;
  }
  return null;
}

export function readBrowserStorageItem(key: string): string | null {
  try {
    return getBrowserStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeBrowserStorageItem(key: string, value: string): boolean {
  try {
    const storage = getBrowserStorage();
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeBrowserStorageItem(key: string): boolean {
  try {
    const storage = getBrowserStorage();
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
