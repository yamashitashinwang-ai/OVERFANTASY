import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../../runtime/state.ts';
import { defeatEntity, rollDrop } from './damage.ts';
import { monster, setupCombatDamageTestState } from './damage.test-fixtures.ts';

describe('combat loot and defeat facade', () => {
  beforeEach(() => {
    setupCombatDamageTestState();
  });

  it('rolls deterministic pickups through the facade drop helper', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const dropped = rollDrop({ kind: 'material', name: '测试材料', chance: 1, color: '#fff', value: 2 }, 10, 10);

    expect(dropped).toBe(true);
    expect(state.pickups).toEqual([
      expect.objectContaining({ kind: 'material', name: '测试材料', value: 2 })
    ]);
  });

  it('marks defeated monsters dead and pays the player through the facade', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const foe = monster({ id: 'monster-defeated', species: 'unknownTestSpecies' });
    const goldBefore = state.player.gold;

    defeatEntity(foe);

    expect(foe.alive).toBe(false);
    expect(state.player.gold).toBe(goldBefore + 2);
  });
});
