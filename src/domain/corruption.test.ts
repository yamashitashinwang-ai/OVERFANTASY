import { beforeEach, describe, expect, it, vi } from 'vitest';
import DATA from '../data.ts';
import { state, initialState, initialRegions, runtime } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import {
  acceptMonsterFate,
  addCorruptionFromMonsterDeath,
  addCorruptionFromMonsterHit,
  chooseSuppressCorruption,
  purifyAtShrine,
  shrineLoadKey,
  updateCorruption,
  useReversePotion
} from './corruption.ts';
import type { ActorState, WorldObjectState } from './types.ts';

function resetForCorruptionTest() {
  replaceObject(state, clonePlain(initialState));
  replaceObject(DATA.regions, clonePlain(initialRegions));
  runtime.pSceneRef = null;
  state.scene = 'field';
  state.player.hp = state.player.maxHp;
  state.player.corruption = 0;
  state.player.corruptionHitCooldown = 0;
  state.player.corruptionChoicePending = false;
  state.player.corruptionRampageWarningTimer = 0;
  state.player.corruptionRampageTimer = 0;
  state.player.monsterForm = false;
  state.player.originalRace = null;
  state.shrineLoads = {};
  state.shrineLoadDecayClock = 0;
  vi.spyOn(Math, 'random').mockReturnValue(0);
}

describe('corruption system', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetForCorruptionTest();
  });

  it('adds ordinary monster hit corruption and throttles rapid hits', () => {
    const wolf: ActorState = { name: '狼', kind: 'monster', faction: 'monster', species: 'wolf', region: 'forest', x: 0, y: 0 };
    expect(addCorruptionFromMonsterHit(wolf)).toBe(1);
    expect(state.player.corruption).toBe(1);
    expect(addCorruptionFromMonsterHit(wolf)).toBe(0);
    expect(state.player.corruption).toBe(1);
  });

  it('adds stronger corruption for demon-castle attacks and deaths bypass cooldown', () => {
    const knight: ActorState = { name: '魔王城骑士', kind: 'monster', faction: 'monster', species: 'demonKnight', region: 'demon', x: 0, y: 0 };
    expect(addCorruptionFromMonsterHit(knight)).toBe(4);
    expect(state.player.corruption).toBe(4);
    expect(addCorruptionFromMonsterDeath(knight)).toBe(60);
    expect(state.player.corruption).toBe(64);
  });

  it('purifies only up to shrine capacity and decays load every three minutes', () => {
    const shrine: WorldObjectState = {
      id: 'white-shrine',
      kind: 'shrine',
      name: '白石祠',
      x: 15,
      y: 12,
      w: 2,
      h: 2,
      color: '#ccd2dc',
      action: 'cleanse'
    };
    state.player.corruption = 70;
    expect(purifyAtShrine(shrine)).toBe(true);
    expect(state.player.corruption).toBe(20);
    expect(state.shrineLoads[shrineLoadKey(shrine)]).toBe(50);
    expect(purifyAtShrine(shrine)).toBe(false);
    updateCorruption(180);
    expect(state.shrineLoads[shrineLoadKey(shrine)]).toBe(49);
  });

  it('opens the threshold choice and suppression enters warning then rampage', () => {
    state.player.corruption = 99;
    addCorruptionFromMonsterDeath({ name: '狼', kind: 'monster', faction: 'monster', species: 'wolf', region: 'forest', x: 0, y: 0 });
    expect(state.player.corruption).toBe(100);
    expect(state.player.corruptionChoicePending).toBe(true);
    chooseSuppressCorruption();
    expect(state.player.corruptionChoicePending).toBe(false);
    expect(state.player.corruptionRampageWarningTimer).toBeGreaterThan(9);
    updateCorruption(10);
    expect(state.player.corruptionRampageTimer).toBeGreaterThan(59);
  });

  it('accepting fate preserves original race and reverse potion restores it', () => {
    state.player.race = '精灵';
    state.player.corruption = 100;
    state.player.corruptionChoicePending = true;
    const trustBefore = DATA.regions.silverleaf.trust;
    acceptMonsterFate();
    expect(state.player.monsterForm).toBe(true);
    expect(state.player.race).toBe('精灵');
    expect(state.player.originalRace).toBe('精灵');
    expect(DATA.regions.silverleaf.trust).toBeLessThan(trustBefore);
    state.player.reversePotions = 1;
    expect(useReversePotion()).toBe(true);
    expect(state.player.monsterForm).toBe(false);
    expect(state.player.race).toBe('精灵');
    expect(state.player.corruption).toBe(10);
    expect(state.player.originalRace).toBeNull();
  });
});
