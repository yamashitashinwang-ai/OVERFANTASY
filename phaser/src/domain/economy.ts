// Economy — shop transactions and forge (ring/material/weapon crafting).

import { state } from '../runtime/state.ts';
import DATA from '../data.ts';
import {
  gearLabel, slotName, gearModList, refreshCombatStats
} from './combat/weapon.ts';
import {
  addMaterial, addResource, addGearToBag,
  consumeResource, consumeAnyResource, resourceCount, resourceGroup
} from './inventory.ts';
import { autoSave } from '../runtime/autosave.ts';
import { log, toast } from '../runtime/services.ts';
import { isNearAction } from './npc.ts';
import type { GearMod, GearSlot, ResourceBag, WeaponForgeRecipe } from './types.ts';

const {
  gearCatalog, materialCatalog,
  weaponForgeCatalog, resourceCatalog
} = DATA;

// ─── Forge formulae (pure data lookups) ───────────────────────────────────

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

export function sellMaterial(name: string, amount = 1): number {
  const material = materialCatalog[name];
  const owned = state.player.materials[name] || 0;
  if (!material || owned <= 0) return 0;
  if (material.unsellable || material.sell == null) {
    toast(`${name}不能出售。`);
    return 0;
  }
  const count = Math.min(amount, owned);
  state.player.materials[name] -= count;
  if (state.player.materials[name] <= 0) delete state.player.materials[name];
  const gold = material.sell * count;
  state.player.gold += gold;
  return gold;
}

export function buyPotion() {
  if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
  if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
  if (state.player.gold < 8) return toast("钱不够。");
  state.player.gold -= 8;
  state.player.potions += 1;
  log("买到一瓶小回复药。");
}

export function buyArrows(amount = 1) {
  const count = Math.max(1, Number(amount) || 1);
  const price = count;
  if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
  if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
  if (state.player.gold < price) return toast("钱不够。");
  state.player.gold -= price;
  state.player.arrows = (state.player.arrows || 0) + count;
  log(`买到${count}支箭。`);
}

export function forgeRing() {
  if (!isNearAction("forge")) return toast("需要靠近锻造台才能锻造戒指。");
  if (state.player.wood < 1 || state.player.stone < 1) return toast("锻造需要木材和反重力石。");
  consumeAnyResource("wood", "木材", 1);
  consumeAnyResource("stone", "反重力石", 1);
  if (Math.random() < 0.62) {
    state.player.rings += 1;
    log("锻造成功，得到一枚粗制戒指。 ");
  } else {
    log("锻造失败。不同种族的锻造概率以后会接入这里。 ");
  }
  autoSave();
}

export function forgeMaterial(name: string, targetSlot: GearSlot) {
  if (!isNearAction("forge")) {
    toast("需要靠近锻造台才能把素材锻到装备上。");
    return;
  }
  if ((state.player.materials[name] || 0) <= 0) return;
  const targetGearId = state.player.gear[targetSlot];
  const gear = gearCatalog[targetGearId];
  if (!gear) {
    toast(`没有可锻造的${slotName(targetSlot)}装备。`);
    return;
  }
  const mod = materialMod(name, targetSlot);
  if (!mod) {
    toast(`${name}暂时不能锻到${slotName(targetSlot)}上。`);
    return;
  }
  const mods = gearModList(targetGearId);
  if (mods.length >= 3) {
    toast(`${gear.name}已经有三个锻造词条了。`);
    return;
  }
  if (mods.some(existing => existing.material === name)) {
    toast(`${gear.name}上已经锻过${name}了。`);
    return;
  }
  state.player.materials[name] -= 1;
  if (state.player.materials[name] <= 0) delete state.player.materials[name];
  if (!state.player.gearMods[targetGearId]) state.player.gearMods[targetGearId] = [];
  state.player.gearMods[targetGearId].push(mod);
  refreshCombatStats();
  log(`把${name}锻到了${gear.name}上。`);
  autoSave();
}

export function forgeWeapon(gearId: string) {
  if (!isNearAction("forge")) return toast("需要靠近锻造台才能锻造武器。");
  const recipe = weaponForgeRecipe(gearId);
  const gear = gearCatalog[gearId];
  if (!recipe || !gear) return toast("没有找到这个武器的锻造方法。");
  if (state.player.gearBag.includes(gearId)) return toast(`已经拥有${gear.name}。`);
  if (!consumeForgeIngredients(recipe.materials)) return toast("材料不足。");
  state.player.gearBag.push(gearId);
  log(`锻造成功：${gear.name}。已放入装备栏。`);
  autoSave();
}
