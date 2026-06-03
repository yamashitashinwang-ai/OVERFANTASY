import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { slotName, gearModList, refreshCombatStats } from '../combat/weapon.ts';
import { consumeAnyResource } from '../inventory.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log, toast } from '../../runtime/services.ts';
import { isNearAction } from '../npc/spatial.ts';
import type { GearSlot } from '../types.ts';
import { consumeForgeIngredients, materialMod, weaponForgeRecipe } from './formulae.ts';

const { gearCatalog } = DATA;

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
