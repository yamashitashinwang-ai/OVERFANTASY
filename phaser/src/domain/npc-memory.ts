// NPC memory — per-player keyed bag of relationship state. Hoisted out of
// GameScene because NPC interaction code consumes these helpers heavily.

import { state } from '../runtime/state.ts';
import { currentPlayerId, ownedByCurrentPlayer } from './session.ts';
import { clamp } from './math.ts';

interface NpcMemorySubject {
  relationId?: string;
  name?: string;
}

interface NpcMemory {
  ownerId: string;
  affection: number;
  devotion: number;
}

export function ensureNpcMemoryOwnership() {
  if (!state.npcMemory || typeof state.npcMemory !== 'object') state.npcMemory = {};
  if (!state.npcMemoryByPlayer || typeof state.npcMemoryByPlayer !== 'object') state.npcMemoryByPlayer = {};
  const playerId = currentPlayerId();
  if (!state.npcMemoryByPlayer[playerId]) state.npcMemoryByPlayer[playerId] = {};
  for (const [npcName, memory] of Object.entries(state.npcMemory)) {
    if (!state.npcMemoryByPlayer[playerId][npcName]) state.npcMemoryByPlayer[playerId][npcName] = memory;
  }
  state.npcMemory = state.npcMemoryByPlayer[playerId];
}

export function npcMemoryKey(npcOrName: string | NpcMemorySubject | null | undefined): string {
  return typeof npcOrName === 'string' ? npcOrName : (npcOrName?.relationId || npcOrName?.name || '');
}

export function npcMemoryFor(npcOrName: string | NpcMemorySubject | null | undefined, playerId = currentPlayerId()): NpcMemory | null {
  ensureNpcMemoryOwnership();
  const key = npcMemoryKey(npcOrName);
  return key ? state.npcMemoryByPlayer[playerId]?.[key] || null : null;
}

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

export function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}
