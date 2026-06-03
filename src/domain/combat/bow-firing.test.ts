import '../../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it } from 'vitest';
import { bus, Events } from '../../runtime/events.ts';
import { flyingArrows, initialState, runtime, state } from '../../runtime/state.ts';
import { clonePlain, replaceObject } from '../math.ts';
import { fireArrow } from './bow/firing.ts';

function resetBowFiringTest() {
  replaceObject(state, clonePlain(initialState));
  flyingArrows.length = 0;
  state.player.gear.weapon = 'shortBow';
  state.player.arrows = 3;
  state.player.stamina = 20;
  state.player.attackCooldown = 0;
  state.player.x = 10;
  state.player.y = 10;
  runtime.aimVector = { x: 1, y: 0 };
  runtime.aimWorld = { x: 12, y: 10 };
  runtime.aimDirection = 'e';
  runtime.facingDirection = 'e';
}

describe('bow firing', () => {
  beforeEach(resetBowFiringTest);

  it('publishes player stat updates without importing UI rendering', () => {
    let statEvents = 0;
    const handler = () => { statEvents += 1; };
    bus.on(Events.PLAYER_STATS, handler);

    try {
      fireArrow(1);
    } finally {
      bus.off(Events.PLAYER_STATS, handler);
    }

    expect(statEvents).toBe(1);
    expect(state.player.arrows).toBe(2);
    expect(state.player.stamina).toBeCloseTo(16.8);
    expect(state.player.attackCooldown).toBeCloseTo(0.72);
    expect(flyingArrows).toHaveLength(1);
  });
});
