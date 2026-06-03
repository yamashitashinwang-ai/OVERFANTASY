import DATA from '../data.ts';
import { initialRegions, initialState, runtime, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { makeMap } from './world.ts';
import { spawnWorld } from './world-spawn.ts';

export function resetDeathTestState() {
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
