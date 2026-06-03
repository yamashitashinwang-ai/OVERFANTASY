import { beforeEach, describe, expect, it } from 'vitest';
import { logs, state } from '../runtime/state.ts';
import { teleportThroughPortal, triggerMapExitIfNeeded } from './teleport.ts';
import { resetPortalTestState, spawnPoint } from './portal.test-fixtures.ts';
import type { WorldObjectState } from './types.ts';

describe('portal fallback and auto exit', () => {
  beforeEach(resetPortalTestState);

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
