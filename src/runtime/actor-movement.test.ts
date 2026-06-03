import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clonePlain, replaceObject } from '../domain/math.ts';
import type { ActorState } from '../domain/types.ts';
import { initialState, state } from './state.ts';
import { fallbackMoveActor, moveActor, registerActorMover, resetActorMover } from './actor-movement.ts';

function actor(overrides: Partial<ActorState> = {}): ActorState {
  return { id: 'actor:mover', x: 5, y: 5, alive: true, ...overrides } as ActorState;
}

describe('runtime actor movement service', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    resetActorMover();
  });

  afterEach(() => {
    resetActorMover();
  });

  it('moves actors with the fallback tile-space implementation when no display mover is registered', () => {
    const target = actor();

    moveActor(target, 1, 0, 2, 0.5);

    expect(target.x).toBe(6);
    expect(target.y).toBe(5);
  });

  it('clamps fallback movement to current dungeon bounds', () => {
    replaceObject(state, { ...clonePlain(initialState), mode: 'dungeon', dungeon: { w: 8, h: 7 } as never });
    const target = actor({ x: 7.4, y: 6.4 });

    fallbackMoveActor(target, 1, 1, 4, 1);

    expect(target.x).toBe(7.5);
    expect(target.y).toBe(6.5);
  });

  it('delegates to the registered display mover until reset', () => {
    const calls: unknown[] = [];
    const target = actor();
    registerActorMover((moved, dx, dy, speed, dt) => {
      calls.push({ moved, dx, dy, speed, dt });
    });

    moveActor(target, 0, -1, 3, 0.25);

    expect(calls).toEqual([{ moved: target, dx: 0, dy: -1, speed: 3, dt: 0.25 }]);

    resetActorMover();
    moveActor(target, 0, 1, 2, 0.5);

    expect(target.y).toBe(6);
  });
});
