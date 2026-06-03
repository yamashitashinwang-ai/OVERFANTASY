import DATA from '../data.ts';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { saveMeta, writeSaveSlots } from './persistence.ts';
import type { SaveRecord } from './persistence.ts';

export function resetPersistenceTestState(): void {
  replaceObject(state, clonePlain(initialState));
  state.scene = 'field';
  state.mode = 'world';
  state.time = 125;
  state.player.hp = 12.8;
  state.player.maxHp = 42;
  state.player.gold = 99;
  state.settings.language = 'zh';
  window.localStorage.clear();
  writeSaveSlots([]);
}

export function saveRecord(overrides: Partial<SaveRecord> = {}): SaveRecord {
  return {
    id: 'save-a',
    schemaVersion: 2,
    playMode: 'single',
    name: '存档 A',
    savedAt: '2026-06-01T00:00:00.000Z',
    state: clonePlain(state),
    regions: clonePlain(DATA.regions),
    meta: saveMeta(state),
    ...overrides
  };
}
