import { afterEach, describe, expect, it } from 'vitest';
import {
  flyingArrows,
  getAimVector,
  getAimWorld,
  getAttackEffect,
  getBowCharge,
  getHitStopTimer,
  getMvKeys,
  getPendingMagicCast,
  getPScene,
  initialRegions,
  initialState,
  logs,
  magicEffects,
  runtime,
  setAttackEffect,
  setBowCharge,
  setHitStopTimer,
  setPendingMagicCast,
  state
} from './state.ts';

describe('runtime state facade', () => {
  const originalHp = state.player.hp;

  afterEach(() => {
    setAttackEffect(null);
    setBowCharge(null);
    setPendingMagicCast(null);
    setHitStopTimer(0);
    runtime.aimVector = { x: 1, y: 0 };
    runtime.aimWorld = null;
    runtime.mvKeys = null;
    runtime.pSceneRef = null;
    state.player.hp = originalHp;
    logs.length = 0;
    flyingArrows.length = 0;
    magicEffects.length = 0;
  });

  it('keeps legacy runtime accessors wired to the shared runtime object', () => {
    const attack = { shape: 'sector', effect: 'slash', angle: 0, duration: 0.2 } as const;
    const bow = { time: 0.3, rushed: false };
    const magic = { spellId: 'fireball', timer: 1, total: 2, cost: 5, spent: 1 };
    const keys = { up: { isDown: false } };
    const scene = { scene: { isActive: () => false } };

    setAttackEffect(attack);
    setBowCharge(bow);
    setPendingMagicCast(magic);
    setHitStopTimer(0.5);
    runtime.aimVector = { x: 0, y: -1 };
    runtime.aimWorld = { x: 8, y: 9 };
    runtime.mvKeys = keys as never;
    runtime.pSceneRef = scene as never;

    expect(getAttackEffect()).toBe(attack);
    expect(runtime.attackEffect).toBe(attack);
    expect(getBowCharge()).toBe(bow);
    expect(getPendingMagicCast()).toBe(magic);
    expect(getHitStopTimer()).toBe(0.5);
    expect(getAimVector()).toEqual({ x: 0, y: -1 });
    expect(getAimWorld()).toEqual({ x: 8, y: 9 });
    expect(getMvKeys()).toBe(keys);
    expect(getPScene()).toBe(scene);
  });

  it('keeps mutable runtime collections exported as shared arrays', () => {
    logs.push('hello');
    flyingArrows.push({ x: 1, y: 2, startX: 1, startY: 2, endX: 3, endY: 4, vx: 3, vy: 4, speed: 5, angle: 0, range: 6, traveled: 0, damageScale: 1, weaponAtk: 7 });
    magicEffects.push({ x: 1, y: 2, radius: 1, duration: 1, time: 0, tickTimer: 0, damagePerSecond: 1, spellId: 'fireball' });

    expect(logs).toEqual(['hello']);
    expect(flyingArrows).toHaveLength(1);
    expect(magicEffects[0].spellId).toBe('fireball');
  });

  it('keeps initial game and region snapshots detached from mutable state', () => {
    expect(initialState).not.toBe(state);
    expect(initialState.player).not.toBe(state.player);
    expect(initialRegions).not.toBeNull();

    state.player.hp = 1;

    expect(initialState.player.hp).toBe(42);
    expect(state.player.hp).toBe(1);
  });
});
