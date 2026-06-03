import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { adjustNpcMemory, npcMemoryFor, npcMemoryKey } from './npc-memory.ts';
import { npcMemorySubject, resetNpcMemoryTestState } from './npc-memory.test-fixtures.ts';

describe('npc memory facade', () => {
  beforeEach(resetNpcMemoryTestState);

  it('uses relationId as the memory key and clamps memory plus live entity values', () => {
    const subject = npcMemorySubject({ affection: 90, devotion: 95 });
    state.entities = [subject];

    expect(npcMemoryKey(subject)).toBe('villager:test');

    adjustNpcMemory(subject, 25, 20);

    expect(npcMemoryFor(subject)).toEqual({ ownerId: 'player:local', affection: 25, devotion: 20 });
    expect(subject.affection).toBe(100);
    expect(subject.devotion).toBe(100);

    adjustNpcMemory(subject, -200, -200);

    expect(npcMemoryFor(subject)).toEqual({ ownerId: 'player:local', affection: -100, devotion: 0 });
    expect(subject.affection).toBe(-100);
    expect(subject.devotion).toBe(0);
  });
});
