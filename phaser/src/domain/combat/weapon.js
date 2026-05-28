// Combat — equipment & derived stats. Pure logic over the player's gear bag
// and active modifiers. Read by both the AI / damage layer and by the HUD.
// No engine deps; no DOM; can be unit-tested standalone.

import DATA from '../../data.js';
import { state } from '../../scenes/Game.js';
import { ownedByCurrentPlayer } from '../session.js';

const { gearCatalog } = DATA;

export function currentWeapon() {
  if (state.player.monsterForm) return gearCatalog.demonClaw;
  const base = gearCatalog[state.player.gear.weapon] || gearCatalog.trainingSword;
  const mods = gearModList(state.player.gear.weapon);
  const cooldownMult = mods.reduce((mult, mod) => mult * (mod.cooldownMult || 1), 1);
  return { ...base, cooldown: Math.max(0.08, base.cooldown * cooldownMult) };
}

export function equippedGear() {
  return Object.values(state.player.gear)
    .filter(Boolean)
    .map(id => gearCatalog[id])
    .filter(Boolean);
}

export function gearModList(gearId) {
  return state.player.gearMods[gearId] || [];
}

export function equippedModList() {
  return Object.values(state.player.gear)
    .filter(Boolean)
    .flatMap(id => gearModList(id));
}

export function totalAtk() {
  if (state.player.monsterForm) return gearCatalog.demonClaw.atk;
  const gearAtk = equippedGear().reduce((sum, gear) => sum + (gear.atk || 0), 0);
  const modAtk = equippedModList().reduce((sum, mod) => sum + (mod.atk || 0), 0);
  return gearAtk + modAtk;
}

export function totalDef() {
  const gearDef = equippedGear().reduce((sum, gear) => sum + (gear.def || 0), 0);
  const modDef = equippedModList().reduce((sum, mod) => sum + (mod.def || 0), 0);
  return gearDef + modDef;
}

/** True if any pet is injured (triggers a defensive boost + offensive penalty). */
export function hasPathosEffect() {
  return state.pets.some(pet =>
    ownedByCurrentPlayer(pet) && pet.injured && !pet.lost
  );
}

/**
 * Recompute the player's exposed combat stats (atk/def/weapon). Pathos mode
 * cripples damage but ramps defence — this is where that mode lives.
 */
export function refreshCombatStats() {
  const weapon = currentWeapon();
  const atk = totalAtk();
  const def = totalDef();
  if (hasPathosEffect()) {
    state.player.atk = Math.max(1, Math.ceil(atk * 0.01));
    state.player.def = Math.ceil(def * 1.5);
  } else {
    state.player.atk = atk;
    state.player.def = def;
  }
  state.player.weapon = weapon.name;
}

export function slotName(slot) {
  return {
    weapon: '武器',
    head: '头',
    body: '衣服',
    legs: '裤子',
    feet: '鞋',
    accessory: '饰品'
  }[slot] || slot;
}

export function gearLabel(id) {
  const gear = gearCatalog[id];
  if (!gear) return '';
  const mods = gearModList(id).map(mod => mod.label).join(',');
  const modText = mods ? ` [${mods}]` : '';
  if (gear.slot === 'weapon') {
    return `${gear.name} ${gear.type} 攻${gear.atk} 距${gear.range} 速${gear.cooldown.toFixed(2)} ${gear.note}${modText}`;
  }
  return `${gear.name} ${slotName(gear.slot)} 攻${gear.atk || 0} 防${gear.def || 0} ${gear.note}${modText}`;
}
