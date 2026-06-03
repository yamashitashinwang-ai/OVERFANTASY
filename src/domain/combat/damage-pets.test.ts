import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../../runtime/state.ts';
import { damagePet, petById, petDiesIrreversibly } from './damage.ts';
import { monster, pet, setupCombatDamageTestState } from './damage.test-fixtures.ts';

describe('combat pet damage facade', () => {
  beforeEach(() => {
    setupCombatDamageTestState();
  });

  it('downs pets, records source aggro, and hides injured pets from petById', () => {
    const ally = pet({ id: 'pet-ally', hp: 3 });
    const source = monster({ id: 'monster-source' });
    state.pets = [ally];

    damagePet(ally, 5, source);

    expect(ally).toEqual(expect.objectContaining({
      alive: false,
      injured: true,
      carried: false,
      rescueTimer: 900,
      hp: 0
    }));
    expect(source.petAggro?.['pet-ally']).toBe(5);
    expect(petById('pet-ally')).toBeNull();
  });

  it('creates a pet remain when an injured pet dies irreversibly', () => {
    const ally = pet({ id: 'pet-ghost', injured: true, alive: false, rescueTimer: 1 });

    petDiesIrreversibly(ally);

    expect(ally).toEqual(expect.objectContaining({
      dead: true,
      lost: true,
      injured: false,
      alive: false,
      rescueTimer: 0
    }));
    expect(state.petRemains).toEqual([
      expect.objectContaining({
        id: 'remain-pet-ghost',
        kind: 'corpse',
        petName: '护主犬'
      })
    ]);
  });
});
