import type { SceneKey, Vector2 } from '../types.ts';

export interface SceneSpawnResolution extends Vector2 {
  scene: SceneKey;
  requestedSpawnId: string;
  spawnId: string;
  usedFallback: boolean;
}

export interface PortalTarget {
  targetScene: SceneKey;
  targetSpawnId: string;
}
