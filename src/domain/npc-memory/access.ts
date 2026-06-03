import { state } from '../../runtime/state.ts';
import { currentPlayerId } from '../session.ts';
import type { NpcMemory, NpcMemorySubject } from './types.ts';
import { npcMemoryKey } from './key.ts';
import { ensureNpcMemoryOwnership } from './ownership.ts';

export function npcMemoryFor(npcOrName: string | NpcMemorySubject | null | undefined, playerId = currentPlayerId()): NpcMemory | null {
  ensureNpcMemoryOwnership();
  const key = npcMemoryKey(npcOrName);
  return key ? state.npcMemoryByPlayer[playerId]?.[key] || null : null;
}
