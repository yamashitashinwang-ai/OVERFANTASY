import { getBrowserStorage, writeBrowserStorageItem } from '../../runtime/browser-storage.ts';
import type { SaveRecord } from './types.ts';

export const saveStorageKey = 'overfantasy.saves.v1';
let memorySaveSlots: SaveRecord[] = [];

export function readSaveSlots(): SaveRecord[] {
  try {
    const storage = getBrowserStorage();
    if (!storage) return memorySaveSlots;
    const saves = JSON.parse(storage.getItem(saveStorageKey) || '[]') as unknown;
    return Array.isArray(saves) ? saves as SaveRecord[] : [];
  } catch {
    return memorySaveSlots;
  }
}

export function writeSaveSlots(saves: SaveRecord[]) {
  memorySaveSlots = saves;
  writeBrowserStorageItem(saveStorageKey, JSON.stringify(saves));
}
