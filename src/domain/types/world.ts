import type { OwnedRecord, ResourceBag, SceneKey, Vector2 } from './common.ts';

export interface LostPackageContents {
  gold?: number;
  herbs?: number;
  potions?: number;
  arrows?: number;
  materials?: ResourceBag;
  resources?: ResourceBag;
  gearBag?: string[];
}

export interface WorldObjectState extends OwnedRecord, Vector2 {
  id: string;
  kind: string;
  name: string;
  w: number;
  h: number;
  color: string;
  action?: string;
  sourceScene?: SceneKey;
  portalId?: string;
  exitZoneId?: string;
  signForPortalId?: string;
  targetMapId?: SceneKey;
  targetScene?: SceneKey;
  targetSpawnId?: string;
  visualOnly?: boolean;
  environment?: boolean;
  collisionProfile?: string;
  [key: string]: unknown;
}

export interface PickupState extends OwnedRecord, Vector2 {
  id: string;
  kind: string;
  name: string;
  color: string;
  value: number;
  reservedFor?: string | null;
  sourceId?: string | null;
  taken?: boolean;
  takenBy?: string | null;
  scene?: SceneKey;
  contents?: LostPackageContents;
}

export interface LostPackageState extends OwnedRecord, Vector2 {
  id: string;
  scene: SceneKey;
  name: string;
  color: string;
  contents: LostPackageContents;
  taken?: boolean;
  createdAt: number;
  deathScene?: SceneKey;
  deathX?: number;
  deathY?: number;
}
