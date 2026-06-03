import { beforeEach, describe, expect, it } from 'vitest';
import { pet, setupAiTestState } from './ai.test-fixtures.ts';
import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import type { PetRemainState } from './types.ts';
import { strongestPetAggro, updatePetRemains } from './ai.ts';

describe('ai aggro and remains facade', () => {
  beforeEach(() => {
    setupAiTestState();
  });

  it('resolves the strongest living pet aggro target through the public facade', () => {
    state.pets = [
      pet({ id: 'pet-low' }),
      pet({ id: 'pet-high', name: '高仇恨宠物' }),
      pet({ id: 'pet-lost', lost: true })
    ];

    const result = strongestPetAggro({
      petAggro: {
        'pet-low': 5,
        'pet-high': 9,
        'pet-lost': 99,
        missing: 100
      }
    });

    expect(result.pet?.id).toBe('pet-high');
    expect(result.value).toBe(9);
  });

  it('decays expired pet graves and removes them at the configured limit', () => {
    const remain: PetRemainState = {
      id: 'grave-a',
      kind: 'grave',
      petName: '护主犬',
      scene: 'field',
      x: 10,
      y: 10,
      age: 0,
      decay: DATA.graveMaxDecay - 1,
      decayClock: DATA.graveDecayInterval
    };
    state.petRemains = [remain];

    updatePetRemains(0);

    expect(state.petRemains).toHaveLength(0);
  });
});
