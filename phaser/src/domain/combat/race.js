// Race-specific multipliers and loadout setup. Pure logic.
// Three playable races each tilt the gameplay numbers along different axes:
//   人类 (Human) — balanced; small sword/dagger bonus
//   精灵 (Elf)   — bow + magic favoured, hammer + spear penalised
//   矮人 (Dwarf) — hammer + spear favoured, bow + magic penalised; tougher,
//                  slower, slightly worse stamina regen

import DATA from '../../data.js';
import { state } from '../../scenes/Game.js';
import { clamp } from '../math.js';
import { currentWeapon } from './weapon.js';

const { gearCatalog, regions } = DATA;

export const playableRaces = ['人类', '精灵', '矮人'];

export const raceStartPoints = {
  '人类': { scene: 'field',      x: 11.5, y: 10.5 },
  '精灵': { scene: 'silverleaf', x: 18.5, y: 16.5 },
  '矮人': { scene: 'stonegorge', x: 18.5, y: 18.5 }
};

export function raceStartPoint(race = state.player?.race) {
  return raceStartPoints[race] || raceStartPoints['人类'];
}

export function raceDamageMultiplier(kind, weapon = currentWeapon()) {
  const race = state.player?.race || '人类';
  if (kind === 'magic') {
    if (race === '精灵') return 1.2;
    if (race === '矮人') return 0.8;
    return 1;
  }
  const type = weapon?.type || '';
  const isSword  = type.includes('剑');
  const isDagger = type === '匕首';
  const isBow    = kind === 'bow' || type === '弓';
  const isMagic  = kind === 'magic';
  const isHammer = type === '锤';
  const isSpear  = type.includes('枪');
  if (race === '精灵') {
    if (isBow || isMagic) return 1.2;
    if (isHammer || isSpear) return 0.8;
  }
  if (race === '矮人') {
    if (isHammer || isSpear) return 1.2;
    if (isBow || isMagic) return 0.8;
  }
  if (race === '人类' && (isSword || isDagger)) return 1.05;
  return 1;
}

export function raceMoveSpeedMultiplier() {
  return state.player?.race === '矮人' ? 0.95 : 1;
}

export function raceDefenseMultiplier() {
  return state.player?.race === '矮人' ? 1.1 : 1;
}

export function raceStaminaRegenMultiplier() {
  return state.player?.race === '精灵' ? 1.2 : 1;
}

export function applyRaceFinalAmount(amount, multiplier, min = 1) {
  return Math.max(min, Math.round(amount * multiplier));
}

/** Tilt the starting region relations for elf/dwarf characters (cross-grudge). */
export function applyRaceInitialRegionRelations(race, regionMap = regions) {
  if (race === '精灵' && regionMap.stonegorge) {
    regionMap.stonegorge.trust = clamp(regionMap.stonegorge.trust - 20, 0, 100);
    regionMap.stonegorge.hate  = clamp(regionMap.stonegorge.hate  + 20, 0, 100);
  }
  if (race === '矮人' && regionMap.silverleaf) {
    regionMap.silverleaf.trust = clamp(regionMap.silverleaf.trust - 20, 0, 100);
    regionMap.silverleaf.hate  = clamp(regionMap.silverleaf.hate  + 20, 0, 100);
  }
}

export function applyRaceStartingLoadout(race) {
  const nonWeaponGear = state.player.gearBag.filter(id => gearCatalog[id]?.slot !== 'weapon');
  if (race === '精灵') {
    state.player.gear.weapon = 'shortBow';
    state.player.gearBag = [...new Set(['shortBow', 'trainingSword', ...nonWeaponGear])];
    state.player.arrows = 5;
    return;
  }
  if (race === '矮人') {
    state.player.gear.weapon = 'oakHammer';
    state.player.gearBag = [...new Set(['oakHammer', ...nonWeaponGear])];
    state.player.arrows = 0;
    return;
  }
  state.player.gear.weapon = 'trainingSword';
}

export function hostileRaceDialogue(npc) {
  const race = state.player?.race;
  return (race === '精灵' && npc?.faction === 'dwarf')
      || (race === '矮人' && npc?.faction === 'elf');
}
