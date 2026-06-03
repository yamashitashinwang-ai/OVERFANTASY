import { beforeEach, describe, expect, it } from 'vitest';
import { state } from '../runtime/state.ts';
import { adoptPetFromMaterial, recallPets } from './inventory.ts';
import { resetInventoryTestState } from './inventory.test-fixtures.ts';

describe('inventory pet facade', () => {
  beforeEach(resetInventoryTestState);

  it('adopts and recalls pets from pet materials through the public facade', () => {
    state.player.materials['幼狼狗'] = 1;
    state.scene = 'forest';

    adoptPetFromMaterial('幼狼狗');

    expect(state.player.materials['幼狼狗']).toBeUndefined();
    expect(state.pets).toHaveLength(1);
    expect(state.pets[0]).toEqual(expect.objectContaining({
      petId: 'wolfPup',
      name: '幼狼狗',
      scene: 'forest',
      alive: true
    }));

    state.scene = 'field';
    state.pets[0].x = 100;
    state.pets[0].y = 100;
    recallPets();

    expect(state.pets[0].scene).toBe('field');
    expect(state.pets[0].alive).toBe(true);
    expect(Math.hypot(state.pets[0].x - state.player.x, state.pets[0].y - state.player.y)).toBeLessThan(2.1);
  });
});
