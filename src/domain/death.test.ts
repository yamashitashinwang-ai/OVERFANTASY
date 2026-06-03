import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../runtime/state.ts';
import { processPlayerDeath } from './death.ts';
import { claimLostPackage } from './lost-packages.ts';
import { resetDeathTestState } from './death.test-fixtures.ts';

describe('death respawn and lost package recovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetDeathTestState();
  });

  it('respawns at race safe point, applies fatigue, and creates a retrievable lost package', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    processPlayerDeath({ name: '灰史莱姆', kind: 'monster', faction: 'monster', species: 'slime', region: 'ruins', x: 0, y: 0 });
    expect(state.scene).toBe('field');
    expect(state.player.x).toBe(11.5);
    expect(state.player.y).toBe(10.5);
    expect(state.player.deathFatigue).toBe(1);
    expect(state.player.maxHp).toBe(38);
    expect(state.player.maxMp).toBe(17);
    expect(state.player.hp).toBe(19);
    expect(state.player.mp).toBe(6);
    expect(state.player.stamina).toBe(15);
    expect(state.player.corruption).toBe(0);
    expect(state.player.rings).toBe(1);
    expect(state.player.gearBag).toContain('conceptSword');
    expect(state.player.gearBag).toContain('clothTunic');
    expect(state.lostPackages).toHaveLength(1);
    const pkg = state.lostPackages[0];
    expect(pkg.contents.gold).toBe(10);
    expect(pkg.contents.herbs).toBe(3);
    expect(pkg.contents.potions).toBe(2);
    expect(pkg.contents.arrows).toBe(4);
    expect(pkg.contents.resources?.['木材']).toBe(2);
    expect(pkg.contents.materials?.['魔狼牙']).toBe(2);
    expect(state.lastDeath?.inventoryBefore.gold).toBe(10);
    expect(state.lastDeath?.corruptionBefore).toBe(0);

    const pickup = state.pickups.find(item => item.kind === 'lostPackage');
    expect(pickup).toBeTruthy();
    claimLostPackage(pickup);
    expect(state.lostPackages).toHaveLength(0);
    expect(state.player.gold).toBe(10);
    expect(state.player.herbs).toBe(3);
    expect(state.player.resources['木材']).toBe(2);
  });
});
