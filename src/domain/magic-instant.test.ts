import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupMagicTestState, dynamicMagicCatalog, resetMagicTestState } from './magic.test-fixtures.ts';
import { getPendingMagicCast, magicEffects, state } from '../runtime/state.ts';
import { beginMagicCast } from './magic.ts';

describe('instant magic casting', () => {
  beforeEach(() => {
    resetMagicTestState();
  });

  afterEach(() => {
    cleanupMagicTestState();
  });

  it('keeps zero-chant magic as instant full-cost release', () => {
    dynamicMagicCatalog.instantTest = {
      name: '瞬发测试',
      aliases: ['instant-test'],
      cost: 3,
      kind: 'heal',
      heal: 1,
      radius: 1,
      color: '#ffffff',
      chant: 0,
      effectDuration: 0.1
    };
    state.player.magicKnown = ['instantTest'];
    state.player.mp = 3;

    beginMagicCast('instantTest');

    expect(getPendingMagicCast()).toBeNull();
    expect(state.player.mp).toBe(0);
    expect(magicEffects.length).toBe(1);
  });
});
