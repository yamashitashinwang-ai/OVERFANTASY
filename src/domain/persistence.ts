// Save-slot persistence compatibility facade. Types, storage, metadata/time
// formatting, and save-record operations live under `domain/persistence/`.

export type { SaveMeta, SaveRecord } from './persistence/types.ts';
export { saveStorageKey, readSaveSlots, writeSaveSlots } from './persistence/storage.ts';
export { saveMeta, formatGameTime, formatSaveTime } from './persistence/metadata.ts';
export { makeSaveId, buildSaveRecord, commitSaveRecord, deleteSaveSlot, findLatestSave } from './persistence/records.ts';
