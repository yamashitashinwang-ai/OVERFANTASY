import { afterEach, describe, expect, it } from 'vitest';
import { bus, Events } from '../runtime/events.ts';
import { display as D } from './runtime.ts';
import { setPendingMagicCast } from '../runtime/state.ts';
import type { ActorState } from '../domain/types.ts';
import {
  clearPlayerMagicCastVisual,
  currentPlayerMagicCastVisual,
  currentPlayerPoseOverride,
  npcVisualAdjust,
  playerVisualAdjust,
  initAnimationFeedback,
  triggerPlayerMagicCharge,
  triggerPlayerMagicRelease
} from './animations.ts';

describe('player magic cast visual state', () => {
  afterEach(() => {
    setPendingMagicCast(null);
    clearPlayerMagicCastVisual();
  });

  it('plays player interact feedback from runtime interaction events', () => {
    bus.emit(Events.PLAYER_INTERACTED);

    expect(currentPlayerPoseOverride()).toBe('interact');
  });

  it('plays player attack feedback from runtime attack-started events', () => {
    bus.emit(Events.PLAYER_ATTACK_STARTED, { attackName: 'attack_bow' });

    expect(currentPlayerPoseOverride()).toBe('attack');
    expect(playerVisualAdjust('s')).toEqual(expect.objectContaining({ tint: 0xcfe7ff }));
  });

  it('plays NPC interact feedback from runtime entity interaction events', () => {
    const actor = { id: 'npc:event-test', kind: 'npc' } as ActorState;

    bus.emit(Events.ENTITY_INTERACTED, { actor });

    expect(npcVisualAdjust(actor)).toEqual(expect.objectContaining({ tint: 0xf3d778 }));
  });

  it('plays entity hit tweens from runtime entity hit events', () => {
    const shutdownHandlers: Array<() => void> = [];
    const circle = {
      setFillStyle: () => circle,
      setDisplayOrigin: () => circle,
      setStrokeStyle: () => circle,
      width: 12,
      height: 12,
      x: 64,
      y: 64,
      scene: {},
      _hitTweenActive: false
    };
    const sprite = {
      setTint: () => sprite,
      clearTint: () => sprite,
      scale: 1,
      x: 64,
      y: 64
    };
    const scene = {
      events: { once: (_event: string, handler: () => void) => { shutdownHandlers.push(handler); } },
      tweens: { add: (): { stop: () => void } => ({ stop: () => undefined }) },
      time: { delayedCall: (_ms: number, callback: () => void) => { callback(); } }
    };
    const actor = { id: 'monster:event-hit', kind: 'monster', color: '#336699', x: 2, y: 2 } as ActorState;
    D.pScene = scene as never;
    D.entityDisplayMap.set(actor.id, { entity: actor, circle: circle as never, sprite: sprite as never });

    try {
      initAnimationFeedback(scene as never);
      bus.emit(Events.ENTITY_HIT, { entity: actor, critical: true });

      expect(circle._hitTweenActive).toBe(true);
      expect(sprite.scale).toBe(1.08);
    } finally {
      for (const handler of shutdownHandlers) handler();
      D.entityDisplayMap.delete(actor.id);
      D.pScene = null;
    }
  });

  it('keeps the charge visual bound to pending magic until release', () => {
    triggerPlayerMagicCharge('fireball', 1, '#ff8a4c');
    setPendingMagicCast({ spellId: 'fireball', timer: 0.02, total: 0.55 });

    const visual = currentPlayerMagicCastVisual();

    expect(visual).toEqual(expect.objectContaining({
      stage: 'charge',
      spellId: 'fireball',
      color: 0xff8a4c
    }));
    expect(visual?.progress).toBeGreaterThan(0.9);
  });

  it('starts charge visuals from magic cast begin events', () => {
    bus.emit(Events.MAGIC_CAST_BEGIN, { spellId: 'fireball', durationMs: 1, color: '#ff8a4c' });
    setPendingMagicCast({ spellId: 'fireball', timer: 0.02, total: 0.55 });

    expect(currentPlayerMagicCastVisual()).toEqual(expect.objectContaining({
      stage: 'charge',
      spellId: 'fireball',
      color: 0xff8a4c
    }));
  });

  it('switches to release and clears visuals from magic cast events', () => {
    bus.emit(Events.MAGIC_CAST_BEGIN, { spellId: 'fireball', durationMs: 500, color: '#ff8a4c' });
    setPendingMagicCast({ spellId: 'fireball', timer: 0.2, total: 0.55 });
    setPendingMagicCast(null);

    bus.emit(Events.MAGIC_CAST_RESOLVE, { spellId: 'fireball', color: '#ff8a4c' });

    expect(currentPlayerMagicCastVisual()).toEqual(expect.objectContaining({
      stage: 'release',
      spellId: 'fireball',
      color: 0xff8a4c
    }));

    bus.emit(Events.MAGIC_CAST_INTERRUPTED, { reason: 'dodge', spellId: 'fireball' });

    expect(currentPlayerMagicCastVisual()).toBeNull();
  });

  it('does not keep a complete charge animation alive after a canceled pending cast', () => {
    triggerPlayerMagicCharge('fireball', 500, '#ff8a4c');
    setPendingMagicCast(null);

    expect(currentPlayerMagicCastVisual()).toBeNull();
  });

  it('uses the release visual only after pending magic resolves', () => {
    triggerPlayerMagicRelease('fireball', '#ff8a4c');

    expect(currentPlayerMagicCastVisual()).toEqual(expect.objectContaining({
      stage: 'release',
      spellId: 'fireball',
      color: 0xff8a4c
    }));
  });
});
