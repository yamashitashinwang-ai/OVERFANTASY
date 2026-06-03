import type { NpcMemoryState } from '../types.ts';

export interface NpcMemorySubject {
  relationId?: string;
  name?: string;
}

export type NpcMemory = NpcMemoryState;
