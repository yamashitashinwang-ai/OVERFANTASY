import { beforeEach, describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { state, initialState, initialRegions, runtime, logs } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { teleportThroughPortal, triggerMapExitIfNeeded } from './teleport.ts';
import { resolveSceneSpawn } from './portal.ts';
import type { SceneKey, WorldObjectState } from './types.ts';
import { makeMap } from './world.ts';
import { spawnWorld } from './world-spawn.ts';

function resetPortalTest() {
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

function mapExitById(portalId: string): WorldObjectState {
  const portal = state.objects.find(obj => obj.kind === 'mapExit' && obj.portalId === portalId);
  expect(portal).toBeTruthy();
  return portal as WorldObjectState;
}

function roadSignById(portalId: string): WorldObjectState {
  const sign = state.objects.find(obj => obj.kind === 'roadSign' && obj.signForPortalId === portalId);
  expect(sign).toBeTruthy();
  return sign as WorldObjectState;
}

function spawnPoint(scene: SceneKey, spawnId: string) {
  const point = resolveSceneSpawn(scene, spawnId);
  expect(point).toBeTruthy();
  return point!;
}

describe('portal teleport', () => {
  beforeEach(resetPortalTest);

  it('uses target map spawn points instead of the source-map player position', () => {
    const sign = roadSignById('north_exit_to_forest');
    expect(sign.action).toBeUndefined();

    const portal = mapExitById('north_exit_to_forest');
    expect(portal.sourceScene).toBe('field');
    expect(portal.targetMapId).toBe('forest');
    expect(portal.targetSpawnId).toBe('south_entry_from_village');
    expect(portal.action).toBe('portal:forest:south_entry_from_village');

    const oldX = 91.25;
    const oldY = 61.75;
    state.player.x = oldX;
    state.player.y = oldY;
    teleportThroughPortal(portal);

    const target = spawnPoint('forest', 'south_entry_from_village');
    expect(state.scene).toBe('forest');
    expect(state.player.x).toBeCloseTo(target.x);
    expect(state.player.y).toBeCloseTo(target.y);
    expect(state.player.x).not.toBe(oldX);
    expect(state.player.y).not.toBe(oldY);
    expect(state.player.portalCooldown).toBeGreaterThan(0);
  });

  it('keeps field-to-forest and forest-to-field as separate links and blocks immediate bounce-back', () => {
    teleportThroughPortal(mapExitById('north_exit_to_forest'));
    const forestEntry = spawnPoint('forest', 'south_entry_from_village');
    expect(state.scene).toBe('forest');
    expect(state.player.x).toBeCloseTo(forestEntry.x);
    expect(state.player.y).toBeCloseTo(forestEntry.y);

    const reverse = mapExitById('south_exit_to_village');
    expect(reverse.sourceScene).toBe('forest');
    expect(reverse.targetMapId).toBe('field');
    expect(reverse.targetSpawnId).toBe('north_entry_from_forest');

    teleportThroughPortal(reverse);
    expect(state.scene).toBe('forest');
    expect(state.player.x).toBeCloseTo(forestEntry.x);
    expect(state.player.y).toBeCloseTo(forestEntry.y);

    state.player.portalCooldown = 0;
    teleportThroughPortal(reverse);
    const villageEntry = spawnPoint('field', 'north_entry_from_forest');
    expect(state.scene).toBe('field');
    expect(state.player.x).toBeCloseTo(villageEntry.x);
    expect(state.player.y).toBeCloseTo(villageEntry.y);
  });

  it('falls back to the target map start point when a target spawn is missing', () => {
    state.player.x = 88.25;
    state.player.y = 60.75;
    const brokenPortal: WorldObjectState = {
      id: 'broken-portal',
      ownerId: 'test',
      kind: 'portal',
      name: '破损路标',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      color: '#ffffff',
      action: 'portal:forest:missing_spawn',
      sourceScene: 'field',
      portalId: 'broken_portal',
      targetMapId: 'forest',
      targetSpawnId: 'missing_spawn'
    };

    teleportThroughPortal(brokenPortal);

    const fallback = spawnPoint('forest', 'start');
    expect(state.scene).toBe('forest');
    expect(state.player.x).toBeCloseTo(fallback.x);
    expect(state.player.y).toBeCloseTo(fallback.y);
    expect(logs.some(line => line.includes('目标入口 forest:missing_spawn 不存在'))).toBe(true);
  });

  it('automatically triggers only inside the map exit zone', () => {
    state.player.x = 76.5;
    state.player.y = 24.5;
    expect(triggerMapExitIfNeeded()).toBe(false);
    expect(state.scene).toBe('field');

    state.player.x = 76.5;
    state.player.y = 1.25;
    expect(triggerMapExitIfNeeded()).toBe(true);

    const target = spawnPoint('forest', 'south_entry_from_village');
    expect(state.scene).toBe('forest');
    expect(state.player.x).toBeCloseTo(target.x);
    expect(state.player.y).toBeCloseTo(target.y);
  });
});
