import { beforeEach, describe, expect, it } from 'vitest';
import DATA from '../../data.ts';
import { initialRegions, initialState, runtime, state } from '../../runtime/state.ts';
import { clonePlain, replaceObject } from '../math.ts';
import type { ActorState, GearCatalogItem } from '../types.ts';
import { attackSpecForWeapon, attackTargetScore, nearestAttackShapeTarget } from './targeting.ts';

function resetTargetingTest() {
  replaceObject(state, clonePlain(initialState));
  replaceObject(DATA.regions, clonePlain(initialRegions));
  state.player.x = 10;
  state.player.y = 10;
  state.player.r = 11;
  state.entities = [];
  runtime.aimVector = { x: 1, y: 0 };
  runtime.aimWorld = { x: 12, y: 10 };
  runtime.aimDirection = 'e';
  runtime.facingDirection = 'e';
}

function monster(id: string, x: number, y: number, r = 11): ActorState {
  return {
    id,
    ownerId: 'test',
    kind: 'monster',
    faction: 'monster',
    species: 'wolf',
    name: id,
    x,
    y,
    r,
    hp: 10,
    alive: true
  };
}

function weapon(type: string, range: number, name = type): GearCatalogItem {
  return { slot: 'weapon', name, type, range, atk: 1, cooldown: 1, stamina: 1 };
}

describe('melee attack composite hit zones', () => {
  beforeEach(resetTargetingTest);

  it('uses a front close-compensation sector without hitting enemies behind the player', () => {
    const spec = attackSpecForWeapon(weapon('剑', 1.45, '练习剑'), 0);
    expect(spec.zones?.map(zone => zone.role)).toEqual(['close', 'main']);

    const frontClose = monster('front-close', state.player.x + 0.48, state.player.y);
    const behindClose = monster('behind-close', state.player.x - 0.48, state.player.y);

    expect(attackTargetScore(frontClose, spec)).toBeLessThan(Infinity);
    expect(attackTargetScore(behindClose, spec)).toBe(Infinity);
  });

  it('uses a hand-referenced spear rectangle widened by 50% plus only a narrow front compensation zone', () => {
    const spec = attackSpecForWeapon(weapon('长枪', 2), 0);
    const frontLine = monster('front-line', state.player.x + 2.25, state.player.y + 0.05);
    const widenedEdgeLine = monster('widened-edge-line', state.player.x + 2.25, state.player.y + 0.37);
    const outsideLine = monster('outside-line', state.player.x + 2.25, state.player.y + 0.9);
    const behindClose = monster('behind-close', state.player.x - 0.35, state.player.y);

    expect(attackTargetScore(frontLine, spec)).toBeLessThan(Infinity);
    expect(attackTargetScore(widenedEdgeLine, spec)).toBeLessThan(Infinity);
    expect(attackTargetScore(outsideLine, spec)).toBe(Infinity);
    expect(attackTargetScore(behindClose, spec)).toBe(Infinity);
  });

  it('uses a hammer impact circle in front while rejecting rear targets', () => {
    const spec = attackSpecForWeapon(weapon('锤', 1.3), 0);
    const frontImpact = monster('front-impact', state.player.x + 1.6, state.player.y);
    const rearImpact = monster('rear-impact', state.player.x - 0.4, state.player.y);

    expect(attackTargetScore(frontImpact, spec)).toBeLessThan(Infinity);
    expect(attackTargetScore(rearImpact, spec)).toBe(Infinity);
  });

  it('selects the front target over a closer target behind the player', () => {
    const spec = attackSpecForWeapon(weapon('匕首', 1.05), 0);
    const front = monster('front', state.player.x + 0.55, state.player.y);
    const rear = monster('rear', state.player.x - 0.25, state.player.y);
    state.entities = [rear, front];

    expect(nearestAttackShapeTarget(spec)?.id).toBe('front');
  });

  it('does not create melee hit zones for bows', () => {
    const spec = attackSpecForWeapon(weapon('弓', 10.5, '短木弓'), 0);
    expect(spec.zones).toEqual([]);
    expect(attackTargetScore(monster('front', state.player.x + 0.5, state.player.y), spec)).toBe(Infinity);
  });
});
