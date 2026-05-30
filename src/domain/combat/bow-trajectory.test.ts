import { beforeEach, describe, expect, it } from 'vitest';
import DATA from '../../data.ts';
import { initialRegions, initialState, runtime, state } from '../../runtime/state.ts';
import { clonePlain, replaceObject } from '../math.ts';
import { handOffsetForFacing } from '../facing.ts';
import { bowProjectileOrigin } from './bow-trajectory.ts';

function resetBowTrajectoryTest() {
  replaceObject(state, clonePlain(initialState));
  replaceObject(DATA.regions, clonePlain(initialRegions));
  state.player.x = 10;
  state.player.y = 10;
  runtime.aimVector = { x: 1, y: 0 };
  runtime.aimWorld = { x: 12, y: 10 };
  runtime.aimDirection = 'e';
  runtime.facingDirection = 'e';
}

describe('bow projectile trajectory origin', () => {
  beforeEach(resetBowTrajectoryTest);

  it('uses the same hand anchor as the bow charge guide', () => {
    const offset = handOffsetForFacing('e');

    expect(bowProjectileOrigin(0)).toEqual({
      x: state.player.x + offset.x / 32,
      y: state.player.y + offset.y / 32
    });
  });
});
