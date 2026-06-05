import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { ensureStateShape } from './game-flow.ts';
import {
  awardProficiency,
  awardWeaponDefeatProficiency,
  awardWeaponHitProficiency,
  classTendencyLabel,
  firstClassCandidates,
  firstClassLabel,
  ensureProficiencyState,
  forgeSuccessBonusChance,
  gatheringExtraResourceChance,
  proficiencyDamageMultiplier,
  proficiencyExpToNextLevel,
  selectFirstClass,
  selectSubclass,
  subclassCandidates,
  subclassIdFor,
  subclassLabel,
  survivalRecoveryMultiplier,
  tryAwardSurvivalProficiency
} from './proficiency.ts';
import type { ActorState, ProficiencyId } from './types.ts';

function target(id = 'training-target'): ActorState {
  return {
    id,
    kind: 'monster',
    name: '训练目标',
    faction: 'monster',
    x: 10,
    y: 10,
    hp: 20,
    maxHp: 20,
    alive: true
  };
}

function setProficiencyLevel(id: ProficiencyId, level: number) {
  const proficiency = ensureProficiencyState();
  proficiency.records[id].level = level;
  proficiency.records[id].exp = 0;
  proficiency.records[id].totalExp = Math.max(proficiency.records[id].totalExp, level * 10000);
}

describe('proficiency domain', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    ensureProficiencyState();
  });

  it('normalizes default records and keeps old job display compatible', () => {
    const proficiency = ensureProficiencyState();

    expect(Object.keys(proficiency.records)).toEqual([
      'sword', 'dagger', 'spear', 'hammer', 'bow', 'magic', 'forging', 'gathering', 'survival'
    ]);
    expect(classTendencyLabel()).toBe('剑士');
    expect(state.player.job).toBe('剑士');
  });

  it('levels from 0 to 30 using the configured 1.1 scaling', () => {
    expect(proficiencyExpToNextLevel(0)).toBe(150);
    expect(proficiencyExpToNextLevel(1)).toBe(165);

    awardProficiency('sword', 150);

    const record = state.player.proficiency.records.sword;
    expect(record.level).toBe(1);
    expect(record.exp).toBe(0);
  });

  it('keeps the first actually reached tendency when progress ties', () => {
    awardProficiency('bow', 10);
    expect(classTendencyLabel()).toBe('游侠');

    awardProficiency('sword', 10);
    expect(classTendencyLabel()).toBe('游侠');

    awardProficiency('sword', 1);
    expect(classTendencyLabel()).toBe('剑士');
  });

  it('prevents repeated hit and defeat proficiency from the same entity', () => {
    const enemy = target();

    awardWeaponHitProficiency('sword', enemy);
    awardWeaponHitProficiency('sword', enemy);
    awardWeaponDefeatProficiency('sword', enemy);
    awardWeaponDefeatProficiency('sword', enemy);

    expect(state.player.proficiency.records.sword.totalExp).toBe(4);
  });

  it('applies race double-growth chance only to the matching proficiencies', () => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    state.player.race = '精灵';

    awardProficiency('bow', 1);
    awardProficiency('sword', 1);

    expect(state.player.proficiency.records.bow.totalExp).toBe(2);
    expect(state.player.proficiency.records.sword.totalExp).toBe(1);
  });

  it('reports light bonuses from current levels', () => {
    awardProficiency('magic', 150);
    awardProficiency('forging', 150);
    awardProficiency('gathering', 150);
    awardProficiency('survival', 150);

    expect(proficiencyDamageMultiplier('magic')).toBeCloseTo(1.005, 5);
    expect(forgeSuccessBonusChance()).toBeCloseTo(0.002, 5);
    expect(gatheringExtraResourceChance()).toBeCloseTo(0.002, 5);
    expect(survivalRecoveryMultiplier()).toBeCloseTo(1.002, 5);
  });

  it('adds old-save defaults without throwing', () => {
    delete (state.player as Partial<typeof state.player>).proficiency;
    state.player.job = '旧职业';

    ensureStateShape();

    expect(state.player.proficiency.records.magic.level).toBe(0);
    expect(state.player.job).toBe('剑士');
    expect(state.player.proficiency.career.firstClassConfirmed).toBe(false);
    expect(firstClassLabel()).toBe('未选择');
  });

  it('limits survival proficiency rewards by time', () => {
    state.time = 10;

    expect(tryAwardSurvivalProficiency()).toBeTruthy();
    expect(tryAwardSurvivalProficiency()).toBeNull();

    state.time = 100;
    expect(tryAwardSurvivalProficiency()).toBeTruthy();
    expect(state.player.proficiency.records.survival.totalExp).toBe(2);
  });

  it('unlocks first class candidates at level 5 without auto-selecting one', () => {
    setProficiencyLevel('sword', 5);
    setProficiencyLevel('magic', 5);
    ensureProficiencyState();

    const candidates = firstClassCandidates().filter(candidate => candidate.eligible);

    expect(candidates.map(candidate => candidate.label)).toEqual(expect.arrayContaining(['剑士', '术士']));
    expect(firstClassLabel()).toBe('未选择');
    expect(state.player.proficiency.career.firstClassConfirmed).toBe(false);
  });

  it('keeps a manually selected first class fixed', () => {
    setProficiencyLevel('sword', 5);
    setProficiencyLevel('magic', 30);

    expect(selectFirstClass('sword')).toBe(true);
    expect(selectFirstClass('magic')).toBe(false);
    ensureProficiencyState();

    expect(firstClassLabel()).toBe('剑士');
    expect(state.player.proficiency.career.firstClass).toBe('sword');
  });

  it('shows only eight subclass candidates tied to the selected first class', () => {
    setProficiencyLevel('sword', 30);
    setProficiencyLevel('magic', 5);
    selectFirstClass('sword');

    const candidates = subclassCandidates();

    expect(candidates).toHaveLength(8);
    expect(candidates.every(candidate => candidate.proficiencies.includes('sword'))).toBe(true);
    expect(candidates.find(candidate => candidate.label === '魔剑士')?.eligible).toBe(true);
  });

  it('unlocks the same unordered subclass from either level route', () => {
    const magicSwordsman = subclassIdFor('sword', 'magic');

    setProficiencyLevel('sword', 30);
    setProficiencyLevel('magic', 5);
    selectFirstClass('sword');
    expect(selectSubclass(magicSwordsman)).toBe(true);
    expect(subclassLabel()).toBe('魔剑士');

    replaceObject(state, clonePlain(initialState));
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    ensureProficiencyState();
    setProficiencyLevel('sword', 5);
    setProficiencyLevel('magic', 30);
    selectFirstClass('magic');

    const candidate = subclassCandidates().find(item => item.id === magicSwordsman);
    expect(candidate?.label).toBe('魔剑士');
    expect(candidate?.eligible).toBe(true);
    expect(selectSubclass(magicSwordsman)).toBe(true);
    expect(subclassLabel()).toBe('魔剑士');
  });
});
