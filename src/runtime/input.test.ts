import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeScene, keyboardEvent } from './input.test-fixtures.ts';
import { bindMovementKeys, clearMovementKeyState, dodgePressed, isRunning, normalizeWithAim, playerAimAngle, readMovementVector } from './input.ts';
import { runtime, state } from './state.ts';

describe('movement key tracking', () => {
  beforeEach(() => {
    clearMovementKeyState();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    clearMovementKeyState();
  });

  it('keeps a held movement key readable while the game scene is paused by UI', () => {
    const { scene } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'KeyW', 'w');

    expect(readMovementVector(keys)).toEqual({ dx: 0, dy: -1 });
  });

  it('uses keyup captured during UI focus instead of stale Phaser key state', () => {
    const { scene, addedKeys } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'KeyW', 'w');
    addedKeys[0].isDown = true;
    keyboardEvent('keyup', 'KeyW', 'w');

    expect(readMovementVector(keys)).toEqual({ dx: 0, dy: 0 });
  });

  it('resumes diagonal movement from keys still held after UI closes', () => {
    const { scene } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'KeyW', 'w');
    keyboardEvent('keydown', 'KeyD', 'd');

    expect(readMovementVector(keys)).toEqual({ dx: 1, dy: -1 });
  });

  it('tracks movement keys first pressed while UI has focus', () => {
    const { scene } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'ArrowUp', 'ArrowUp');

    expect(readMovementVector(keys)).toEqual({ dx: 0, dy: -1 });
  });

  it('tracks held sprint separately from Phaser key state', () => {
    const { scene } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'ShiftLeft', 'Shift');

    expect(isRunning(keys)).toBe(true);
  });

  it('clears held movement on window blur to prevent stuck movement', () => {
    const { scene } = fakeScene();
    const keys = bindMovementKeys(scene as never);

    keyboardEvent('keydown', 'KeyW', 'w');
    window.dispatchEvent(new Event('blur'));

    expect(readMovementVector(keys)).toEqual({ dx: 0, dy: 0 });
  });

  it('uses Phaser JustDown semantics for dodge presses', () => {
    const { scene, addedKeys } = fakeScene();
    const keys = bindMovementKeys(scene as never);
    addedKeys[9]._justDown = true;

    expect(dodgePressed(keys)).toBe(true);
    expect(dodgePressed(keys)).toBe(false);
  });
});


describe('aim input helpers', () => {
  afterEach(() => {
    runtime.aimWorld = null;
    runtime.aimVector = { x: 1, y: 0 };
    state.player.x = 11.5;
    state.player.y = 10.5;
  });

  it('refreshes the aim vector from the latest world pointer before returning the angle', () => {
    state.player.x = 2;
    state.player.y = 3;
    runtime.aimWorld = { x: 2, y: 7 };
    runtime.aimVector = { x: 1, y: 0 };

    expect(playerAimAngle()).toBeCloseTo(Math.PI / 2);
    expect(runtime.aimVector).toEqual({ x: 0, y: 1 });
  });

  it('normalizes movement with the last aim vector as fallback', () => {
    runtime.aimVector = { x: 0, y: -1 };

    expect(normalizeWithAim(0, 0)).toEqual({ x: 0, y: -1 });
  });
});
