import '../test-support/phaser.test-fixtures.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flyingArrows, initialState, magicEffects, runtime, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { playerAttack } from './combat/actions.ts';
import { resolveArrowHit } from './combat/bow.ts';
import { beginMagicCast, updatePendingMagicCast } from './magic.ts';
import { forgeWeapon } from './economy.ts';
import { addResource } from './inventory.ts';
import { pickupItems } from './player.ts';
import { relieveDeathFatigue } from './death.ts';
import { putEconomyActionObject } from './economy.test-fixtures.ts';
import { ensureProficiencyState } from './proficiency.ts';
import type { ActorState, ArrowProjectile } from './types.ts';

function resetProficiencyIntegrationState() {
  replaceObject(state, clonePlain(initialState));
  state.entities = [];
  state.pickups = [];
  state.objects = [];
  magicEffects.length = 0;
  flyingArrows.length = 0;
  runtime.aimWorld = null;
  runtime.aimVector = { x: 1, y: 0 };
  state.player.x = 10;
  state.player.y = 10;
  state.player.stamina = 30;
  state.player.attackCooldown = 0;
  state.player.invuln = 0;
  state.player.gear.weapon = 'trainingSword';
  state.player.gearBag = ['trainingSword', 'clothTunic', 'linenPants'];
  state.player.gearMods = {};
  ensureProficiencyState();
}

function monster(overrides: Partial<ActorState> = {}): ActorState {
  return {
    id: 'prof-monster',
    kind: 'monster',
    name: '熟练度测试魔物',
    faction: 'monster',
    species: 'wolf',
    region: 'forest',
    x: 10.7,
    y: 10,
    r: 8,
    hp: 50,
    maxHp: 50,
    alive: true,
    ...overrides
  };
}

describe('proficiency integration points', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    resetProficiencyIntegrationState();
  });

  it('awards sword proficiency only when melee attacks hit', () => {
    state.entities = [monster()];

    playerAttack();

    expect(state.entities[0].hp).toBeLessThan(50);
    expect(state.player.proficiency.records.sword.totalExp).toBe(1);
  });

  it('does not award melee proficiency on whiff', () => {
    state.entities = [monster({ x: 20, y: 20 })];

    playerAttack();

    expect(state.player.proficiency.records.sword.totalExp).toBe(0);
  });

  it('awards bow hit and defeat proficiency from projectile damage', () => {
    const target = monster({ id: 'bow-target', hp: 1, maxHp: 1 });
    const arrow: ArrowProjectile = {
      x: 10,
      y: 10,
      startX: 10,
      startY: 10,
      endX: 15,
      endY: 10,
      vx: 10,
      vy: 0,
      speed: 10,
      angle: 0,
      range: 5,
      traveled: 0,
      damageScale: 1,
      weaponAtk: 9
    };
    state.entities = [target];

    resolveArrowHit(arrow, target);

    expect(target.alive).toBe(false);
    expect(state.player.proficiency.records.bow.totalExp).toBe(4);
  });

  it('awards magic proficiency only for effective magic resolution', () => {
    state.player.magicKnown = ['fireball'];
    state.player.mp = 50;
    runtime.aimWorld = { x: 11, y: 10 };
    state.entities = [monster({ id: 'magic-target', x: 11, y: 10, hp: 30, maxHp: 30 })];

    beginMagicCast('fireball');
    updatePendingMagicCast(10);

    expect(magicEffects.length).toBe(1);
    expect(state.player.proficiency.records.magic.totalExp).toBe(1);

    state.entities = [];
    state.player.mp = 50;
    beginMagicCast('fireball');
    updatePendingMagicCast(10);

    expect(state.player.proficiency.records.magic.totalExp).toBe(1);
  });

  it('awards forging, gathering, and survival proficiency from completed actions', () => {
    putEconomyActionObject('forge');
    addResource('木材', 1);
    addResource('反重力石', 2);

    forgeWeapon('ironSword');

    expect(state.player.proficiency.records.forging.totalExp).toBe(1);

    state.pickups = [{
      id: 'wood-pickup',
      kind: 'resource',
      name: '木材',
      color: '#ffffff',
      value: 1,
      x: state.player.x,
      y: state.player.y,
      ownerId: 'world',
      reservedFor: null,
      takenBy: null
    }];

    pickupItems();

    expect(state.player.proficiency.records.gathering.totalExp).toBe(1);

    state.player.deathFatigue = 1;
    state.player.deathFatigueReliefCooldown = 0;
    state.time = 1000;

    expect(relieveDeathFatigue('rest')).toBe(true);
    expect(state.player.proficiency.records.survival.totalExp).toBe(1);
  });
});
