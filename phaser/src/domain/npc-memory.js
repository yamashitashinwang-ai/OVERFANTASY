// NPC memory — per-player keyed bag of relationship state. Hoisted out of
// scenes/Game.js because NPC interaction code consumes these helpers heavily.

import { state } from '../runtime/state.js';
import { currentPlayerId, ownedByCurrentPlayer } from './session.js';

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

export function npcMemoryKey(npcOrName) {
  return typeof npcOrName === 'string' ? npcOrName : (npcOrName?.relationId || npcOrName?.name || '');
}

export function npcMemoryFor(npcOrName, playerId = currentPlayerId()) {
  ensureNpcMemoryOwnership();
  const key = npcMemoryKey(npcOrName);
  return key ? state.npcMemoryByPlayer[playerId]?.[key] || null : null;
}

export function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}
