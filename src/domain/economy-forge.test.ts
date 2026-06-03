import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { forgeMaterial, forgeWeapon } from './economy.ts';
import { addResource } from './inventory.ts';
import { putEconomyActionObject, resetEconomyTestState } from './economy.test-fixtures.ts';

describe('economy forge facade', () => {
  beforeEach(resetEconomyTestState);

  it('forges material mods and new weapons through the public facade', () => {
    putEconomyActionObject('forge');
    state.player.materials['魔狼牙'] = 1;

    forgeMaterial('魔狼牙', 'weapon');

    expect(state.player.materials['魔狼牙']).toBeUndefined();
    expect(state.player.gearMods.trainingSword).toEqual([
      expect.objectContaining({ material: '魔狼牙', atk: 1, thorns: 2 })
    ]);

    addResource('木材', 1);
    addResource('反重力石', 2);
    forgeWeapon('ironSword');

    expect(state.player.gearBag).toContain('ironSword');
    expect(state.player.resources['木材']).toBeUndefined();
    expect(state.player.resources['反重力石']).toBeUndefined();
    expect(state.player.wood).toBe(0);
    expect(state.player.stone).toBe(0);
  });
});
