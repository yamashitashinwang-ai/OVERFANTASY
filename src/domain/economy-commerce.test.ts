import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { buyArrows, buyPotion, sellMaterial } from './economy.ts';
import { putEconomyActionObject, resetEconomyTestState } from './economy.test-fixtures.ts';

describe('economy commerce facade', () => {
  beforeEach(resetEconomyTestState);

  it('handles shop purchases and material selling through the public facade', () => {
    putEconomyActionObject('shop');
    state.player.gold = 20;
    state.player.materials['魔狼牙'] = 3;
    state.player.materials['幼狼狗'] = 1;

    buyPotion();
    buyArrows(5);

    expect(state.player.gold).toBe(7);
    expect(state.player.potions).toBe(1);
    expect(state.player.arrows).toBe(5);

    expect(sellMaterial('魔狼牙', 3)).toBe(27);
    expect(state.player.gold).toBe(34);
    expect(state.player.materials['魔狼牙']).toBeUndefined();

    expect(sellMaterial('幼狼狗', 1)).toBe(0);
    expect(state.player.gold).toBe(34);
    expect(state.player.materials['幼狼狗']).toBe(1);
  });
});
