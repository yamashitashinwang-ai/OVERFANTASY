import { beforeEach, describe, expect, it } from 'vitest';
import { monster, setupAiTestState } from './ai.test-fixtures.ts';
import { state } from '../runtime/state.ts';
import { updateEntities } from './ai.ts';

describe('ai entity combat facade', () => {
  beforeEach(() => {
    setupAiTestState();
  });

  it('keeps entity AI able to damage the player after the split', () => {
    const foe = monster({ id: 'monster-melee', atk: 5, x: 10.4, y: 10, cooldown: 0 });
    state.entities = [foe];
    const beforeHp = state.player.hp;

    updateEntities(0.1);

    expect(state.player.hp).toBeLessThan(beforeHp);
    expect(foe.cooldown).toBeGreaterThan(0);
  });
});
