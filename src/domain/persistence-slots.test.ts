import { beforeEach, describe, expect, it, vi } from 'vitest';
import { commitSaveRecord, deleteSaveSlot, findLatestSave, readSaveSlots, saveStorageKey, writeSaveSlots } from './persistence.ts';
import { resetPersistenceTestState, saveRecord } from './persistence.test-fixtures.ts';

describe('persistence save slots', () => {
  beforeEach(resetPersistenceTestState);

  it('writes and reads save slots through localStorage', () => {
    const record = saveRecord();

    writeSaveSlots([record]);

    expect(JSON.parse(window.localStorage.getItem(saveStorageKey) || '[]')).toHaveLength(1);
    expect(readSaveSlots()).toEqual([expect.objectContaining({ id: 'save-a', name: '存档 A' })]);
  });

  it('commits, replaces, deletes, and finds latest save slots', () => {
    vi.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
    const older = saveRecord({ id: 'older', savedAt: '2026-06-01T00:00:00.000Z' });
    const newer = saveRecord({ id: 'newer', name: '新存档', savedAt: '2026-06-02T00:00:00.000Z' });

    commitSaveRecord(older);
    commitSaveRecord(newer);
    commitSaveRecord({ ...older, name: '旧存档更新' });

    expect(readSaveSlots()).toEqual([
      expect.objectContaining({ id: 'older', name: '旧存档更新' }),
      expect.objectContaining({ id: 'newer', name: '新存档' })
    ]);
    expect(findLatestSave()?.id).toBe('newer');

    deleteSaveSlot('older');

    expect(readSaveSlots()).toEqual([
      expect.objectContaining({ id: 'newer' })
    ]);
    vi.useRealTimers();
  });
});
