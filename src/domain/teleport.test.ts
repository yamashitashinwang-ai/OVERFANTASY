import { describe, expect, it } from 'vitest';
import DATA from '../data.ts';
import { resolveSceneSpawn, sceneSpawnPoints } from './portal.ts';
import * as teleport from './teleport.ts';
import { TELEPORT_COOLDOWN_SECONDS } from './teleport/constants.ts';
import { triggerMapExitIfNeeded } from './teleport/map-exit.ts';
import { teleportThroughPortal } from './teleport/portal.ts';
import { portalTargetFor } from './teleport/target.ts';
import type { WorldObjectState } from './types.ts';

function portalObject(overrides: Partial<WorldObjectState> = {}): WorldObjectState {
  return {
    id: 'portal-test',
    ownerId: 'world',
    kind: 'mapExit',
    name: 'Test Portal',
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    color: '#ffffff',
    ...overrides
  };
}

describe('teleport domain facade and target resolution', () => {
  it('re-exports split teleport modules through the legacy entry point', () => {
    expect(teleport.TELEPORT_COOLDOWN_SECONDS).toBe(TELEPORT_COOLDOWN_SECONDS);
    expect(teleport.portalTargetFor).toBe(portalTargetFor);
    expect(teleport.teleportThroughPortal).toBe(teleportThroughPortal);
    expect(teleport.triggerMapExitIfNeeded).toBe(triggerMapExitIfNeeded);
  });

  it('keeps teleport cooldown configured as a positive finite duration', () => {
    expect(Number.isFinite(TELEPORT_COOLDOWN_SECONDS)).toBe(true);
    expect(TELEPORT_COOLDOWN_SECONDS).toBeGreaterThan(0);
  });

  it('keeps portal spawn tables labeled and mechanically resolvable', () => {
    for (const [scene, spawns] of Object.entries(sceneSpawnPoints)) {
      expect(DATA.sceneNames[scene]).toBeDefined();
      expect(spawns.start).toBeDefined();

      for (const [spawnId, point] of Object.entries(spawns)) {
        expect(spawnId.trim()).not.toBe('');
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
        expect(point.x).toBeGreaterThan(0);
        expect(point.y).toBeGreaterThan(0);
        expect(resolveSceneSpawn(scene, spawnId)).toEqual({
          scene,
          requestedSpawnId: spawnId,
          spawnId,
          x: point.x,
          y: point.y,
          usedFallback: false
        });
      }
    }
  });

  it('resolves explicit target fields before portal action fallback', () => {
    expect(portalTargetFor(portalObject({
      action: 'portal:forest:south_entry_from_village',
      targetMapId: 'ruins',
      targetScene: 'field',
      targetSpawnId: 'west_entry_from_field'
    }))).toEqual({ targetScene: 'ruins', targetSpawnId: 'west_entry_from_field' });

    expect(portalTargetFor(portalObject({
      action: 'portal:forest:south_entry_from_village'
    }))).toEqual({ targetScene: 'forest', targetSpawnId: 'south_entry_from_village' });

    expect(portalTargetFor(portalObject({ action: 'portal:forest' }))).toEqual({
      targetScene: undefined,
      targetSpawnId: undefined
    });
  });
});
