// Save-slot persistence. Pure I/O over localStorage with an in-memory fallback
// for private-mode browsers. The serialisation format is `{ schemaVersion,
// state, regions, meta }` — see ensureStateShape for forward-compat patching.

import DATA from '../data.js';
import { clonePlain } from './math.js';
import { saveSchemaVersion } from './session.js';
import { currentLanguage } from './i18n.js';
import { state } from '../scenes/Game.js';

const { sceneNames, regions: defaultRegions } = DATA;
const saveStorageKey = 'overfantasy.saves.v1';
let memorySaveSlots = [];

export function readSaveSlots() {
  try {
    if (!window.localStorage) return memorySaveSlots;
    const saves = JSON.parse(window.localStorage.getItem(saveStorageKey) || '[]');
    return Array.isArray(saves) ? saves : [];
  } catch {
    return memorySaveSlots;
  }
}

export function writeSaveSlots(saves) {
  memorySaveSlots = saves;
  try {
    if (window.localStorage) window.localStorage.setItem(saveStorageKey, JSON.stringify(saves));
  } catch {
    memorySaveSlots = saves;
  }
}

export function saveMeta(snapshot) {
  const p = snapshot.player || state.player;
  return {
    scene: snapshot.mode === 'dungeon' ? '排列迷宫' : (sceneNames[snapshot.scene] || snapshot.scene || '未知'),
    hp: `${Math.max(0, Math.floor(p.hp))}/${p.maxHp}`,
    gold: p.gold || 0,
    time: Number(snapshot.time || 0)
  };
}

export function formatGameTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  if (currentLanguage() === 'ja') return `${min}分${String(sec).padStart(2, '0')}秒`;
  if (currentLanguage() === 'en') return `${min}m ${String(sec).padStart(2, '0')}s`;
  return `${min}分${String(sec).padStart(2, '0')}秒`;
}

export function formatSaveTime(value) {
  const locale = currentLanguage() === 'ja' ? 'ja-JP'
              : currentLanguage() === 'en' ? 'en-US'
              : 'zh-CN';
  return new Date(value).toLocaleString(locale, { hour12: false });
}

export function makeSaveId() {
  return `save-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Build a save record snapshot of the current state + region relations. The
 * caller still owns slot-id resolution so the "current save slot" can be
 * persisted across saves; pass the existing slot list via `existingId` to
 * overwrite a specific slot.
 */
export function buildSaveRecord(currentSaveId, regions) {
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

/** Commit a fresh record into the slot list (insert or update by id). */
export function commitSaveRecord(record) {
  const saves = readSaveSlots();
  const existing = saves.find(s => s.id === record.id);
  const next = existing
    ? saves.map(s => s.id === record.id ? record : s)
    : [...saves, record];
  writeSaveSlots(next);
  return record;
}

export function deleteSaveSlot(saveId) {
  const saves = readSaveSlots().filter(save => save.id !== saveId);
  writeSaveSlots(saves);
}

export function findLatestSave() {
  return readSaveSlots().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0] || null;
}
