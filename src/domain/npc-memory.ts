// NPC-memory compatibility facade. Subject typing, key derivation, ownership
// migration, memory access, adjustment, and pet ownership helpers live under
// `domain/npc-memory/` by responsibility.

export type { NpcMemory, NpcMemorySubject } from './npc-memory/types.ts';
export { npcMemoryKey } from './npc-memory/key.ts';
export { ensureNpcMemoryOwnership } from './npc-memory/ownership.ts';
export { npcMemoryFor } from './npc-memory/access.ts';
export { adjustNpcMemory } from './npc-memory/adjust.ts';
export { petsForCurrentPlayer } from './npc-memory/pets.ts';
