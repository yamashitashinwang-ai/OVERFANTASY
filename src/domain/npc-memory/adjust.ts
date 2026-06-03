import { state } from '../../runtime/state.ts';
import { clamp } from '../math.ts';
import { currentPlayerId } from '../session.ts';
import type { NpcMemorySubject } from './types.ts';
import { npcMemoryKey } from './key.ts';
import { ensureNpcMemoryOwnership } from './ownership.ts';

export function adjustNpcMemory(npcName: string | NpcMemorySubject, affection: number, devotion: number) {
  ensureNpcMemoryOwnership();
  const key = npcMemoryKey(npcName);
  const store = state.npcMemoryByPlayer[currentPlayerId()];
  const memory = store[key] || { ownerId: currentPlayerId(), affection: 0, devotion: 0 };
  memory.affection = clamp((memory.affection || 0) + affection, -100, 100);
  memory.devotion = clamp((memory.devotion || 0) + devotion, 0, 100);
  memory.ownerId = currentPlayerId();
  store[key] = memory;
  state.npcMemory = store;
  const npc = state.entities.find(e => e.alive && npcMemoryKey(e) === key);
  if (npc) {
    npc.affection = clamp((npc.affection || 0) + affection, -100, 100);
    npc.devotion = clamp((npc.devotion || 0) + devotion, 0, 100);
  }
}
