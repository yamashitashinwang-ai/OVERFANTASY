import { beforeEach, describe, expect, it, vi } from 'vitest';
import DATA from '../data.ts';
import { state, initialState, initialRegions, runtime } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { makeMap } from './world.ts';
import { spawnWorld } from './world-spawn.ts';
import { processPlayerDeath, relieveDeathFatigue } from './death.ts';
import { claimLostPackage } from './lost-packages.ts';
import type { ActorState } from './types.ts';

function resetDeathTest() {
  replaceObject(state, clonePlain(initialState));
  replaceObject(DATA.regions, clonePlain(initialRegions));
  runtime.pSceneRef = null;
  state.scene = 'field';
  state.mode = 'world';
  state.player.race = '人类';
  state.player.baseMaxHp = 42;
  state.player.baseMaxMp = 18;
  state.player.maxHp = 42;
  state.player.maxMp = 18;
  state.player.hp = 1;
  state.player.mp = 0;
  state.player.stamina = 0;
  state.player.gold = 10;
  state.player.herbs = 3;
  state.player.potions = 2;
  state.player.arrows = 4;
  state.player.rings = 1;
  state.player.resources = { '木材': 2 };
  state.player.materials = { '魔狼牙': 2 };
  state.player.gear = {
    weapon: 'trainingSword',
    head: null,
    body: 'clothTunic',
    legs: 'linenPants',
    feet: null,
    accessory: null
  };
  state.player.gearBag = ['trainingSword', 'clothTunic', 'linenPants', 'leatherCap', 'conceptSword'];
  state.player.deathFatigue = 0;
  state.player.deathFatigueReliefCooldown = 0;
  state.player.corruption = 0;
  state.player.corruptionChoicePending = false;
  state.lostPackages = [];
  state.lastDeath = null;
  state.pendingDeathRespawn = null;
  makeMap('field');
  spawnWorld('field');
}

describe('death system', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetDeathTest();
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
