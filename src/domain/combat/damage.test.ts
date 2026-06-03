import { beforeEach, describe, expect, it } from 'vitest';
import { bus, Events } from '../../runtime/events.ts';
import { state } from '../../runtime/state.ts';
import { damagePlayer, markHitReaction } from './damage.ts';
import { monster, setupCombatDamageTestState } from './damage.test-fixtures.ts';

describe('combat player damage facade', () => {
  beforeEach(() => {
    setupCombatDamageTestState();
  });

  it('publishes entity hit events through the public facade', () => {
    const target = monster();
    const hitEvents: unknown[] = [];
    const handler = (event: unknown) => { hitEvents.push(event); };
    bus.on(Events.ENTITY_HIT, handler);

    try {
      markHitReaction(target, true);
    } finally {
      bus.off(Events.ENTITY_HIT, handler);
    }

    expect(hitEvents).toEqual([
      expect.objectContaining({ entity: target, critical: true })
    ]);
  });

  it('applies player damage and emits the hurt event through the public facade', () => {
    const source = monster();
    const hurtEvents: unknown[] = [];
    bus.on(Events.PLAYER_HURT, event => hurtEvents.push(event));

    const beforeHp = state.player.hp;

    damagePlayer(5, source);

    const dealt = beforeHp - state.player.hp;
    expect(dealt).toBeGreaterThan(0);
    expect(state.player.lastHitBy).toBe(source);
    expect(state.player.invuln).toBeGreaterThan(0);
    expect(hurtEvents).toEqual([
      expect.objectContaining({ amount: dealt, blocked: false, source })
    ]);
  });
});
