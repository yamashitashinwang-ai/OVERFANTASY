import { expect } from 'vitest';
import DATA from '../data.ts';
import { initialRegions, initialState, logs, runtime, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { resolveSceneSpawn } from './portal.ts';
import type { SceneKey, WorldObjectState } from './types.ts';
import { makeMap } from './world.ts';
import { spawnWorld } from './world-spawn.ts';

export function resetPortalTestState(): void {
  replaceObject(state, clonePlain(initialState));
  replaceObject(DATA.regions, clonePlain(initialRegions));
  runtime.pSceneRef = null;
  logs.length = 0;
  state.mode = 'world';
  state.scene = 'field';
  state.player.portalCooldown = 0;
  makeMap('field');
  spawnWorld('field');
}

export function mapExitById(portalId: string): WorldObjectState {
  const portal = state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === portalId);
  expect(portal).toBeTruthy();
  return portal as WorldObjectState;
}

export function roadSignById(portalId: string): WorldObjectState {
  const sign = state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === portalId);
  expect(sign).toBeTruthy();
  return sign as WorldObjectState;
}

export function spawnPoint(scene: SceneKey, spawnId: string) {
  const point = resolveSceneSpawn(scene, spawnId);
  expect(point).toBeTruthy();
  return point!;
}
