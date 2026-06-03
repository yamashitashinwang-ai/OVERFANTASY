import { beforeEach, describe, expect, it } from 'vitest';
import { monster, pet, setupAiTestState } from './ai.test-fixtures.ts';
import { state } from '../runtime/state.ts';
import { updatePets } from './ai.ts';

describe('ai pet combat facade', () => {
  beforeEach(() => {
    setupAiTestState();
  });

  it('lets pets strike an engaged monster without going through player attack logic', () => {
    const ally = pet({ id: 'pet-ally', atk: 4 });
    const foe = monster({ id: 'monster-target', hp: 12, x: 10.4, playerAggro: 6 });
    state.pets = [ally];
    state.entities = [foe];

    updatePets(0.1);

    expect(foe.hp).toBe(8);
    expect(foe.petAggro?.['pet-ally']).toBe(7);
    expect(ally.cooldownTimer).toBe(ally.cooldown);
    expect(state.player.attackCooldown).toBe(0);
  });
});
