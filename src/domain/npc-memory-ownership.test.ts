import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { ensureNpcMemoryOwnership, npcMemoryFor } from './npc-memory.ts';
import { resetNpcMemoryTestState } from './npc-memory.test-fixtures.ts';

describe('npc memory ownership facade', () => {
  beforeEach(resetNpcMemoryTestState);

  it('migrates legacy npcMemory into the current player store', () => {
    state.npcMemory = {
      莉娜: { ownerId: 'player:local', affection: 12, devotion: 3 }
    };
    state.npcMemoryByPlayer = {};

    ensureNpcMemoryOwnership();

    expect(state.npcMemoryByPlayer['player:local'].莉娜).toEqual({ ownerId: 'player:local', affection: 12, devotion: 3 });
    expect(state.npcMemory).toBe(state.npcMemoryByPlayer['player:local']);
    expect(npcMemoryFor('莉娜')).toEqual({ ownerId: 'player:local', affection: 12, devotion: 3 });
  });
});
