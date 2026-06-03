import type { ResourceBag, SceneKey } from './common.ts';
import type { LostPackageContents } from './world.ts';

export interface DeathInventorySnapshot {
  gold: number;
  herbs: number;
  potions: number;
  arrows: number;
  rings: number;
  reversePotions: number;
  resources: ResourceBag;
  materials: ResourceBag;
  gearBag: string[];
}

export interface DeathRecordState {
  id: string;
  scene: SceneKey;
  mode: string;
  x: number;
  y: number;
  sourceName: string;
  sourceKind?: string;
  sourceSpecies?: string;
  sourceFaction?: string;
  sourceRegion?: string;
  reason: string;
  inventoryBefore: DeathInventorySnapshot;
  corruptionBefore: number;
  corruptionAfter: number;
  lostPackageId?: string | null;
  permanentLosses?: LostPackageContents;
  createdAt: number;
}

export interface DeathRespawnState {
  scene: SceneKey;
  x: number;
  y: number;
  message: string;
}
