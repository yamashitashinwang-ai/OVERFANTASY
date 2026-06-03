import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { petsForCurrentPlayer } from './npc-memory.ts';
import { npcMemoryPet, resetNpcMemoryTestState } from './npc-memory.test-fixtures.ts';

describe('npc memory pet facade', () => {
  beforeEach(resetNpcMemoryTestState);

  it('filters pets to records owned by the current player', () => {
    const localPet = npcMemoryPet('player:local');
    const otherPet = npcMemoryPet('player:other');
    state.pets = [localPet, otherPet];

    expect(petsForCurrentPlayer()).toEqual([localPet]);
  });
});
