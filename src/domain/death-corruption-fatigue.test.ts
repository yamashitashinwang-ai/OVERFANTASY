import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../runtime/state.ts';
import { processPlayerDeath, relieveDeathFatigue } from './death.ts';
import { resetDeathTestState } from './death.test-fixtures.ts';
import type { ActorState } from './types.ts';

describe('death corruption and fatigue relief', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetDeathTestState();
  });

  it('adds death corruption for strong magical sources and defers respawn at threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    state.scene = 'ruins';
    state.player.corruption = 50;
    const gargoyle: ActorState = { name: '石像鬼', kind: 'monster', faction: 'monster', species: 'gargoyle', region: 'mountain', x: 1, y: 1 };
    processPlayerDeath(gargoyle);
    expect(state.player.corruption).toBe(100);
    expect(state.player.corruptionChoicePending).toBe(true);
    expect(state.pendingDeathRespawn?.scene).toBe('field');
    expect(state.player.hp).toBe(1);
    expect(state.player.deathFatigue).toBe(1);
  });

  it('removes at most one death fatigue layer per five minutes', () => {
    state.player.deathFatigue = 2;
    state.player.deathFatigueReliefCooldown = 0;
    expect(relieveDeathFatigue('rest')).toBe(true);
    expect(state.player.deathFatigue).toBe(1);
    expect(relieveDeathFatigue('rest')).toBe(false);
    expect(state.player.deathFatigue).toBe(1);
  });
});
