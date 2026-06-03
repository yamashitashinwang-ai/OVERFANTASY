import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../runtime/state.ts';
import { processPlayerDeath } from './death.ts';
import { claimLostPackage } from './lost-packages.ts';
import { resetDeathTestState } from './death.test-fixtures.ts';

describe('death inventory loss', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetDeathTestState();
  });

  it('can permanently lose ordinary items but never equipped or unique gear', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    processPlayerDeath(null);
    expect(state.lostPackages).toHaveLength(0);
    expect(state.player.gold).toBe(0);
    expect(state.player.herbs).toBe(0);
    expect(state.player.materials['魔狼牙']).toBeUndefined();
    expect(state.lastDeath?.permanentLosses?.gold).toBe(10);
    expect(state.lastDeath?.permanentLosses?.materials?.['魔狼牙']).toBe(2);
    expect(state.player.gearBag).toContain('trainingSword');
    expect(state.player.gearBag).toContain('clothTunic');
    expect(state.player.gearBag).toContain('linenPants');
    expect(state.player.gearBag).toContain('conceptSword');
  });

  it('can drop unequipped ordinary gear into the package without permanent loss', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    state.player.gold = 0;
    state.player.herbs = 0;
    state.player.potions = 0;
    state.player.arrows = 0;
    state.player.resources = {};
    state.player.materials = {};
    processPlayerDeath(null);
    expect(state.lostPackages).toHaveLength(1);
    expect(state.lostPackages[0].contents.gearBag).toContain('leatherCap');
    expect(state.player.gearBag).not.toContain('leatherCap');
    const pickup = state.pickups.find(item => item.kind === 'lostPackage');
    claimLostPackage(pickup);
    expect(state.player.gearBag).toContain('leatherCap');
  });
});
