import { describe, expect, it } from 'vitest';
import { bus, Events } from '../../runtime/events.ts';
import { publishPlayerAttackStarted } from './visual-events.ts';

describe('combat visual events', () => {
  it('publishes player attack started payloads without importing display code', () => {
    const events: unknown[] = [];
    const handler = (payload: unknown) => { events.push(payload); };
    bus.on(Events.PLAYER_ATTACK_STARTED, handler);

    try {
      publishPlayerAttackStarted('attack_spear');
    } finally {
      bus.off(Events.PLAYER_ATTACK_STARTED, handler);
    }

    expect(events).toEqual([{ attackName: 'attack_spear' }]);
  });
});
