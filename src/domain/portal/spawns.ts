import type { SceneKey, Vector2 } from '../types.ts';
import type { SceneSpawnResolution } from './types.ts';

export const sceneSpawnPoints: Record<SceneKey, Record<string, Vector2>> = {
  field: {
    start: { x: 11.5, y: 10.5 },
    west_entry_from_peakless: { x: 4.5, y: 26.5 },
    north_entry_from_forest: { x: 74.5, y: 25.5 },
    east_entry_from_ruins: { x: 83.5, y: 55.5 }
  },
  forest: {
    start: { x: 8.5, y: 35.5 },
    south_entry_from_village: { x: 8.5, y: 35.5 },
    north_entry_from_silverleaf: { x: 47.5, y: 7.5 },
    southwest_entry_from_ruins: { x: 22.5, y: 48.5 }
  },
  silverleaf: {
    start: { x: 48.5, y: 62.5 },
    south_entry_from_forest: { x: 48.5, y: 62.5 }
  },
  peakless: {
    start: { x: 88.5, y: 35.5 },
    east_entry_from_field: { x: 88.5, y: 35.5 },
    west_entry_from_stonegorge: { x: 6.5, y: 35.5 }
  },
  stonegorge: {
    start: { x: 88.5, y: 35.5 },
    east_entry_from_peakless: { x: 88.5, y: 35.5 },
    north_entry_from_hatepit: { x: 47.5, y: 6.5 }
  },
  hatepit: {
    start: { x: 48.5, y: 62.5 },
    south_entry_from_stonegorge: { x: 48.5, y: 62.5 }
  },
  ruins: {
    start: { x: 12.5, y: 34.5 },
    west_entry_from_field: { x: 12.5, y: 34.5 },
    southwest_entry_from_forest: { x: 22.5, y: 48.5 },
    east_entry_from_demon: { x: 82.5, y: 35.5 },
    dungeon_exit: { x: 50.5, y: 36.5 }
  },
  demon: {
    start: { x: 10.5, y: 35.5 },
    west_entry_from_ruins: { x: 10.5, y: 35.5 }
  }
};

export function resolveSceneSpawn(scene: SceneKey, spawnId: string): SceneSpawnResolution | null {
  const sceneSpawns = sceneSpawnPoints[scene];
  if (!sceneSpawns) return null;
  const point = sceneSpawns[spawnId];
  if (point) {
    return { scene, requestedSpawnId: spawnId, spawnId, x: point.x, y: point.y, usedFallback: false };
  }
  const fallback = sceneSpawns.start;
  if (!fallback) return null;
  return { scene, requestedSpawnId: spawnId, spawnId: 'start', x: fallback.x, y: fallback.y, usedFallback: true };
}
