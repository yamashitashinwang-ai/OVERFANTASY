import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { resourceCount, consumeResource } from '../inventory.ts';
import type { GearMod, GearSlot, ResourceBag, WeaponForgeRecipe } from '../types.ts';

const { materialCatalog, weaponForgeCatalog, resourceCatalog } = DATA;

export function materialMod(name: string, targetSlot: GearSlot | string): GearMod | null {
  const material = materialCatalog[name];
  if (!material) return null;
  const mod: GearMod = { material: name, label: name, atk: 0, def: 0, thorns: 0, slowOnHit: 0, slowOnBlock: 0, aoeSlowOnHit: 0, repelMonsters: false, cooldownMult: 1, radius: material.radius || 0, duration: material.duration || 0 };
  if (name === '旧时代之钻') {
    if (targetSlot === 'weapon') mod.cooldownMult = material.cooldownMult || 0.3;
    else if (targetSlot === 'head') mod.repelMonsters = true;
  }
  if (name === '魔狼牙') {
    mod.thorns = material.thorns || 2;
    if (targetSlot === 'weapon') mod.atk = material.atk || 1;
    else mod.def = material.def || 1;
  }
  if (name === '凝胶爆弹') {
    if (targetSlot === 'weapon') {
      mod.aoeSlowOnHit = material.aoeSlow || 0.62;
    } else {
      mod.slowOnBlock = material.slow || 0.8;
    }
  }
  if (material.slow) {
    if (targetSlot === 'weapon' && name !== '凝胶爆弹') mod.slowOnHit = material.slow;
    else if (name !== '凝胶爆弹') mod.slowOnBlock = material.slow;
  }
  if (material.def && targetSlot !== 'weapon') mod.def += material.def;
  if (!mod.atk && !mod.def && !mod.thorns && !mod.slowOnHit && !mod.slowOnBlock && !mod.aoeSlowOnHit && !mod.repelMonsters && mod.cooldownMult === 1) return null;
  return mod;
}

export function weaponForgeRecipe(gearId: string): WeaponForgeRecipe | null {
  for (const entries of Object.values(weaponForgeCatalog)) {
    const recipe = entries.find(item => item.gearId === gearId);
    if (recipe) return recipe;
  }
  return null;
}

export function forgeIngredientCount(name: string): number {
  if (resourceCatalog[name]) return resourceCount(name);
  return state.player.materials[name] || 0;
}

export function hasForgeIngredients(materials: ResourceBag = {}) {
  return Object.entries(materials).every(([name, amount]) => forgeIngredientCount(name) >= amount);
}

export function consumeForgeIngredients(materials: ResourceBag = {}) {
  if (!hasForgeIngredients(materials)) return false;
  for (const [name, amount] of Object.entries(materials)) {
    if (resourceCatalog[name]) {
      consumeResource(name, amount);
    } else {
      state.player.materials[name] -= amount;
      if (state.player.materials[name] <= 0) delete state.player.materials[name];
    }
  }
  return true;
}
