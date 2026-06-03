import { state } from '../../runtime/state.ts';
import { currentPlayerId } from '../session.ts';

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
