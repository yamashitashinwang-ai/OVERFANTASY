import '../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it } from 'vitest';
import { initialState, runtime, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { updatePlayer } from './player.ts';
import type { MovementKeys, MovementKeyLike } from './types.ts';

type TestKey = MovementKeyLike & { _justDown: boolean };

function key(isDown = false): TestKey {
  return { isDown, _justDown: false };
}

function movementKeys({ right = false, run = false } = {}): MovementKeys {
  return {
    up: key(false),
    down: key(false),
    left: key(false),
    right: key(right),
    upAlt: key(false),
    downAlt: key(false),
    leftAlt: key(false),
    rightAlt: key(false),
    run: key(run),
    dodge: key(false)
  };
}

describe('player sprint exhaustion lock', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    runtime.mvKeys = null;
  });

  it('exits run and locks sprint when held sprint drains stamina to zero', () => {
    state.player.stamina = 1.01;
    runtime.mvKeys = movementKeys({ right: true, run: true });

    updatePlayer(1);

    expect(state.player.stamina).toBe(0);
    expect(state.player.running).toBe(false);
    expect(state.player.runExhausted).toBe(true);
  });

  it('locks sprint when held sprint reaches the one stamina exhaustion threshold', () => {
    state.player.stamina = 1;
    runtime.mvKeys = movementKeys({ right: true, run: true });

    updatePlayer(0.016);

    expect(state.player.stamina).toBe(1);
    expect(state.player.running).toBe(false);
    expect(state.player.runExhausted).toBe(true);
  });

  it('keeps walking while exhausted and stamina is below the recovery threshold', () => {
    state.player.stamina = 2;
    state.player.runExhausted = true;
    runtime.mvKeys = movementKeys({ right: true, run: true });

    updatePlayer(1);

    expect(state.player.running).toBe(false);
    expect(state.player.runExhausted).toBe(true);
    expect(state.player.stamina).toBeGreaterThan(2);
    expect(state.player.stamina).toBeLessThan(5);
  });

  it('clears exhaustion at five stamina and allows run on the following update', () => {
    state.player.stamina = 4.9;
    state.player.runExhausted = true;
    runtime.mvKeys = movementKeys({ right: true, run: true });

    updatePlayer(0.1);

    expect(state.player.stamina).toBeGreaterThanOrEqual(5);
    expect(state.player.running).toBe(false);
    expect(state.player.runExhausted).toBe(false);

    updatePlayer(0.01);

    expect(state.player.running).toBe(true);
    expect(state.player.runExhausted).toBe(false);
  });

  it('does not let releasing and re-holding sprint bypass exhaustion below five stamina', () => {
    state.player.stamina = 2;
    state.player.runExhausted = true;
    runtime.mvKeys = movementKeys({ right: true, run: false });

    updatePlayer(0.2);
    runtime.mvKeys = movementKeys({ right: true, run: true });
    updatePlayer(0.2);

    expect(state.player.stamina).toBeLessThan(5);
    expect(state.player.running).toBe(false);
    expect(state.player.runExhausted).toBe(true);
  });
});
