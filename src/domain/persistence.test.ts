import { beforeEach, describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import { buildSaveRecord, writeSaveSlots } from './persistence.ts';
import { resetPersistenceTestState, saveRecord } from './persistence.test-fixtures.ts';

describe('persistence save record building', () => {
  beforeEach(resetPersistenceTestState);

  it('builds save records with cloned state, region data, and metadata', () => {
    const record = buildSaveRecord('save-new', DATA.regions);

    expect(record).toEqual(expect.objectContaining({
      id: 'save-new',
      playMode: 'single',
      name: '存档 1',
      meta: expect.objectContaining({
        scene: '晨风原野',
        hp: '12/42',
        gold: 99,
        time: 125
      })
    }));
    expect(record.state).not.toBe(state);
    expect(record.regions).not.toBe(DATA.regions);
  });

  it('keeps an existing slot name when rebuilding a save record', () => {
    writeSaveSlots([saveRecord({ id: 'save-existing', name: '自定义名字' })]);

    const record = buildSaveRecord('save-existing', DATA.regions);

    expect(record.name).toBe('自定义名字');
  });
});
