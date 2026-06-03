import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { teleportThroughPortal } from './teleport.ts';
import { mapExitById, resetPortalTestState, roadSignById, spawnPoint } from './portal.test-fixtures.ts';

describe('portal teleport target spawns', () => {
  beforeEach(resetPortalTestState);

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
});
