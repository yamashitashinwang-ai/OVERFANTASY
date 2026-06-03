import { state } from '../../runtime/state.ts';
import { clonePlain } from '../math.ts';
import { saveSchemaVersion } from '../session.ts';
import type { RegionTable } from '../types.ts';
import { saveMeta } from './metadata.ts';
import { readSaveSlots, writeSaveSlots } from './storage.ts';
import type { SaveRecord } from './types.ts';

export function makeSaveId(): string {
  return `save-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function buildSaveRecord(currentSaveId: string, regions: RegionTable): SaveRecord {
  const saves = readSaveSlots();
  const existing = saves.find(save => save.id === currentSaveId);
  const snapshot = clonePlain(state);
  return {
    id: currentSaveId,
    schemaVersion: saveSchemaVersion,
    playMode: state.session?.playMode || 'single',
    name: existing?.name || `存档 ${saves.length + 1}`,
    savedAt: new Date().toISOString(),
    state: snapshot,
    regions: clonePlain(regions),
    meta: saveMeta(snapshot)
  };
}

export function commitSaveRecord(record: SaveRecord): SaveRecord {
  const saves = readSaveSlots();
  const existing = saves.find(save => save.id === record.id);
  const next = existing
    ? saves.map(save => save.id === record.id ? record : save)
    : [...saves, record];
  writeSaveSlots(next);
  return record;
}

export function deleteSaveSlot(saveId: string) {
  const saves = readSaveSlots().filter(save => save.id !== saveId);
  writeSaveSlots(saves);
}

export function findLatestSave(): SaveRecord | null {
  return readSaveSlots().sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())[0] || null;
}
