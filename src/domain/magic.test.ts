import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupMagicTestState, resetMagicTestState } from './magic.test-fixtures.ts';
import { bus, Events } from '../runtime/events.ts';
import { getPendingMagicCast, magicEffects, state } from '../runtime/state.ts';
import { playerDefend, playerDodge } from './combat/actions.ts';
import { damagePlayer } from './combat/damage.ts';
import { beginMagicCast, updateMpRegen, updatePendingMagicCast } from './magic.ts';

describe('magic cast MP drain and interruption', () => {
  beforeEach(() => {
    resetMagicTestState();
  });

  afterEach(() => {
    cleanupMagicTestState();
  });

  it('spends charged magic MP over the chant instead of upfront', () => {
    beginMagicCast('fireball');
    const cast = getPendingMagicCast();

    expect(cast).toEqual(expect.objectContaining({ spellId: 'fireball', cost: 5, spent: 0 }));
    expect(state.player.mp).toBe(5);

    updatePendingMagicCast((cast?.total || 1) / 2);

    expect(state.player.mp).toBeCloseTo(2.5, 5);
    expect(getPendingMagicCast()?.spent).toBeCloseTo(2.5, 5);
  });

  it('does not regenerate MP while charging and keeps release cooldown after success', () => {
    beginMagicCast('fireball');
    const total = getPendingMagicCast()?.total || 1;

    updatePendingMagicCast(total / 2);
    const midMp = state.player.mp;
    updateMpRegen(10);

    expect(state.player.mp).toBeCloseTo(midMp, 5);

    updatePendingMagicCast(total / 2);

    expect(getPendingMagicCast()).toBeNull();
    expect(state.player.mp).toBeCloseTo(0, 5);
    expect(state.player.mpRegenLock).toBeGreaterThan(0);
    expect(magicEffects.length).toBe(1);
  });

  it('publishes magic cast begin and resolve events for visual listeners', () => {
    const events: Array<{ type: string; payload: unknown }> = [];
    const onBegin = (payload: unknown) => { events.push({ type: 'begin', payload }); };
    const onResolve = (payload: unknown) => { events.push({ type: 'resolve', payload }); };
    bus.on(Events.MAGIC_CAST_BEGIN, onBegin);
    bus.on(Events.MAGIC_CAST_RESOLVE, onResolve);

    try {
      beginMagicCast('fireball');
      const beginPayload = events[0]?.payload as { durationMs?: number };
      expect(events[0]).toEqual({
        type: 'begin',
        payload: expect.objectContaining({ spellId: 'fireball', color: expect.any(String) })
      });
      expect(beginPayload.durationMs).toBeGreaterThan(0);

      updatePendingMagicCast(getPendingMagicCast()?.total || 1);
    } finally {
      bus.off(Events.MAGIC_CAST_BEGIN, onBegin);
      bus.off(Events.MAGIC_CAST_RESOLVE, onResolve);
    }

    expect(events[1]).toEqual({
      type: 'resolve',
      payload: expect.objectContaining({ spellId: 'fireball', color: expect.any(String) })
    });
  });

  it('publishes magic effect spawn events while keeping gameplay effect state in domain', () => {
    const events: unknown[] = [];
    const handler = (payload: unknown) => { events.push(payload); };
    bus.on(Events.MAGIC_EFFECT_SPAWNED, handler);

    try {
      beginMagicCast('fireball');
      updatePendingMagicCast(getPendingMagicCast()?.total || 1);
    } finally {
      bus.off(Events.MAGIC_EFFECT_SPAWNED, handler);
    }

    expect(events).toEqual([expect.objectContaining({
      spellId: 'fireball',
      x: expect.any(Number),
      y: expect.any(Number),
      radius: expect.any(Number),
      color: expect.any(String),
      duration: expect.any(Number)
    })]);
    expect(magicEffects.length).toBe(1);
  });

  it('interrupts without release when MP runs out mid-charge and keeps spent MP lost', () => {
    state.player.mp = 2;
    beginMagicCast('fireball');
    const total = getPendingMagicCast()?.total || 1;

    updatePendingMagicCast(total * 0.6);

    expect(getPendingMagicCast()).toBeNull();
    expect(state.player.mp).toBe(0);
    expect(magicEffects.length).toBe(0);
  });

  it('keeps unspent MP when an active charge is interrupted', () => {
    beginMagicCast('fireball');
    const total = getPendingMagicCast()?.total || 1;

    updatePendingMagicCast(total * 0.4);
    playerDodge();

    expect(getPendingMagicCast()).toBeNull();
    expect(state.player.mp).toBeCloseTo(3, 5);
    expect(magicEffects.length).toBe(0);
  });

  it('publishes a magic interruption event for display cleanup without domain-display coupling', () => {
    const events: unknown[] = [];
    const handler = (payload: unknown) => { events.push(payload); };
    bus.on(Events.MAGIC_CAST_INTERRUPTED, handler);

    try {
      beginMagicCast('fireball');
      playerDodge();
    } finally {
      bus.off(Events.MAGIC_CAST_INTERRUPTED, handler);
    }

    expect(events).toEqual([{ reason: 'dodge', spellId: 'fireball' }]);
  });

  it('interrupts charged magic on successful block and on damage', () => {
    beginMagicCast('fireball');
    playerDefend();

    expect(getPendingMagicCast()).toBeNull();

    state.player.stamina = 30;
    state.player.mp = 5;
    state.player.invuln = 0;
    beginMagicCast('fireball');
    damagePlayer(2, null);

    expect(getPendingMagicCast()).toBeNull();
    expect(magicEffects.length).toBe(0);
  });
});
