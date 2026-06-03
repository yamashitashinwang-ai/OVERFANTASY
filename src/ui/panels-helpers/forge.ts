import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { escapeHtml } from '../../domain/math.ts';
import type { GearSlot, ResourceBag } from '../../domain/types.ts';
import { gearModList, slotName } from '../../domain/combat/weapon.ts';
import { forgeIngredientCount, materialMod } from '../../domain/economy.ts';
import { modSummary } from './shared.ts';

const { gearCatalog, materialCatalog, weaponForgeCatalog } = DATA;

export function forgeEffectText(name: string): string {
  const slots: GearSlot[] = ["weapon", "head", "body", "legs", "feet", "accessory"];
  const lines = slots
    .map(slot => {
      const mod = materialMod(name, slot);
      return mod ? `${slotName(slot)}：${modSummary(mod)}` : "";
    })
    .filter(Boolean);
  return lines.length ? lines.join("<br>") : "暂时没有可用锻造效果。";
}

export function materialOptionList() {
  return Object.entries(state.player.materials)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count, desc: materialCatalog[name]?.desc || "生物掉落的战利品。" }));
}

export function selectedForgeMaterial() {
  const options = materialOptionList();
  if (!options.length) {
    uiState.forgeSelectedMaterial = null;
    return null;
  }
  if (!uiState.forgeSelectedMaterial || !options.some(item => item.name === uiState.forgeSelectedMaterial)) uiState.forgeSelectedMaterial = options[0].name;
  return options.find(item => item.name === uiState.forgeSelectedMaterial) || options[0];
}

export function forgeSlotButton(materialName: string, slot: GearSlot): string {
  const gearId = state.player.gear[slot];
  const gear = gearId ? gearCatalog[gearId] : null;
  const mod = materialMod(materialName, slot);
  const mods = gearId ? gearModList(gearId) : [];
  const disabled = !gear || !mod;
  const note = !gear ? "未装备" : !mod ? "无效果" : mods.length >= 3 ? "词条已满" : modSummary(mod);
  return `<button type="button" data-forge-action="forgeMaterial" data-material="${escapeHtml(materialName)}" data-slot="${slot}" ${disabled ? "disabled" : ""}>${slotName(slot)}：${gear ? escapeHtml(gear.name) : "无"}｜${escapeHtml(note)}</button>`;
}

export function armorForgeTarget() {
  return state.player.gear.body || state.player.gear.head || state.player.gear.legs || state.player.gear.feet || state.player.gear.accessory;
}

export function weaponForgeEntries(category = uiState.forgeWeaponCategory) {
  return (weaponForgeCatalog[category] || [])
    .map(recipe => ({ ...recipe, gear: gearCatalog[recipe.gearId] }))
    .filter(entry => entry.gear);
}

export function weaponForgeCategories() {
  return Object.keys(weaponForgeCatalog).filter(category => weaponForgeEntries(category).length > 0);
}

export function selectedWeaponForgeEntry() {
  const categories = weaponForgeCategories();
  if (!categories.includes(uiState.forgeWeaponCategory)) uiState.forgeWeaponCategory = categories[0] || "剑";
  const entries = weaponForgeEntries(uiState.forgeWeaponCategory);
  if (!entries.length) {
    uiState.forgeSelectedWeapon = null;
    return null;
  }
  if (!uiState.forgeSelectedWeapon || !entries.some(entry => entry.gearId === uiState.forgeSelectedWeapon)) uiState.forgeSelectedWeapon = entries[0].gearId;
  return entries.find(entry => entry.gearId === uiState.forgeSelectedWeapon) || entries[0];
}

export function forgeRequirementHtml(materials: ResourceBag = {}) {
  return Object.entries(materials)
    .map(([name, amount]) => {
      const owned = forgeIngredientCount(name);
      const enough = owned >= amount;
      return `<div class="trade-row"><span>${escapeHtml(name)}</span><span>${owned} / ${amount}</span><span>${enough ? "足够" : "不足"}</span></div>`;
    })
    .join("");
}
