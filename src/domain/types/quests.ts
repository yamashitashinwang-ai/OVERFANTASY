import type { OwnedRecord, SceneKey } from './common.ts';

export interface QuestState extends OwnedRecord {
  id?: string;
  instanceId?: string;
  name: string;
  type: string;
  giver?: string;
  targetNpc?: string;
  targetName?: string;
  species?: string;
  scene?: SceneKey;
  x?: number;
  y?: number;
  radius?: number;
  count?: number;
  progress?: number;
  goalDone?: boolean;
  delivered?: boolean;
  settled?: boolean;
  autoSettleAt?: number | null;
  autoSettleDelay?: number;
  reward?: Record<string, number | [number, number]>;
  [key: string]: unknown;
}

export interface QuestStateBag {
  major: QuestState | null;
  small: QuestState[];
}

export interface NpcMemoryState {
  ownerId: string;
  affection: number;
  devotion: number;
}
