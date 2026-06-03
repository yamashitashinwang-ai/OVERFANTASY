import type { GameState, RegionTable } from '../types.ts';

export interface SaveMeta {
  scene: string;
  hp: string;
  gold: number;
  time: number;
}

export interface SaveRecord {
  id: string;
  schemaVersion: number;
  playMode: string;
  name: string;
  savedAt: string;
  state: GameState;
  regions: RegionTable;
  meta: SaveMeta;
}
