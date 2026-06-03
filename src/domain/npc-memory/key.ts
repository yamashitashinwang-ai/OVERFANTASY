import type { NpcMemorySubject } from './types.ts';

export function npcMemoryKey(npcOrName: string | NpcMemorySubject | null | undefined): string {
  return typeof npcOrName === 'string' ? npcOrName : (npcOrName?.relationId || npcOrName?.name || '');
}
