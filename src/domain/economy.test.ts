import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { addResource } from './inventory.ts';
import {
  consumeForgeIngredients,
  hasForgeIngredients,
  materialMod,
  weaponForgeRecipe
} from './economy.ts';
import { resetEconomyTestState } from './economy.test-fixtures.ts';

describe('economy formulae facade', () => {
  beforeEach(resetEconomyTestState);

  it('builds material mods and consumes mixed forge ingredients through the public facade', () => {
    state.player.materials['魔狼牙'] = 2;
    addResource('木材', 2);
    addResource('反重力石', 1);

    expect(materialMod('魔狼牙', 'weapon')).toEqual(expect.objectContaining({
      material: '魔狼牙',
      atk: 1,
      thorns: 2
    }));
    expect(materialMod('旧时代之钻', 'head')).toEqual(expect.objectContaining({ repelMonsters: true }));
    expect(weaponForgeRecipe('ironSword')).toEqual(expect.objectContaining({ gearId: 'ironSword' }));

    expect(hasForgeIngredients({ '木材': 1, '魔狼牙': 1 })).toBe(true);
    expect(consumeForgeIngredients({ '木材': 1, '魔狼牙': 1 })).toBe(true);

    expect(state.player.resources['木材']).toBe(1);
    expect(state.player.materials['魔狼牙']).toBe(1);
    expect(state.player.wood).toBe(1);
  });
});
