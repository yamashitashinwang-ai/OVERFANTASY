// HTML panel helpers. Pure functions that build innerHTML strings consumed by
// ui/{backpack,shop,forge,magic,quest,menus}.js renderers. Hoisted out of
// GameScene so the scene stays focused on lifecycle.

import DATA from '../data.ts';
import { state } from '../runtime/state.ts';
import { runtime } from '../runtime/state.ts';
import { uiState } from '../runtime/ui-state.ts';
import { escapeHtml } from '../domain/math.ts';
import { t } from '../domain/i18n.ts';
import { sellMaterial } from '../domain/economy.ts';
import type { GearCatalogItem, GearMod, GearSlot, QuestState, ResourceBag } from '../domain/types.ts';
import { gearLabel, slotName, gearModList, equippedModList } from '../domain/combat/weapon.ts';
import { materialMod, forgeIngredientCount } from '../domain/economy.ts';
import {
  majorQuestStatus, smallQuestStatus, questRewardText
} from '../domain/quest.ts';

const {
  gearCatalog, materialCatalog, resourceCatalog,
  weaponForgeCatalog, magicCatalog
} = DATA;

interface BackpackItem {
  id: string;
  name: string;
  count?: string | number;
  desc: string;
  action?: string;
  gear?: GearCatalogItem;
}

export function panelHeader(title: string, actionName: string): string {
  return `<div class="backpack-head"><strong>${escapeHtml(title)}</strong><span class="backpack-paused">${t("panel.paused")}</span><button type="button" class="backpack-close" data-${actionName}-action="close">${t("panel.closeEsc")}</button></div>`;
}

export function modSummary(mod: GearMod): string {
  const parts: string[] = [];
  if (mod.atk) parts.push(`攻击+${mod.atk}`);
  if (mod.def) parts.push(`防御+${mod.def}`);
  if (mod.thorns) parts.push(`反伤+${mod.thorns}`);
  if (mod.slowOnHit) parts.push(`命中减速${Math.round(mod.slowOnHit * 100)}%`);
  if (mod.slowOnBlock) parts.push(`受击减速${Math.round(mod.slowOnBlock * 100)}%`);
  if (mod.aoeSlowOnHit) parts.push(`范围减速${Math.round(mod.aoeSlowOnHit * 100)}%`);
  if (mod.repelMonsters) parts.push("普通魔物不敢靠近");
  if (mod.cooldownMult !== 1) parts.push(`攻击间隔-${Math.round((1 - mod.cooldownMult) * 100)}%`);
  return parts.join("、");
}

export function backpackItems(category: string): BackpackItem[] {
  const p = state.player;
  if (category === "consumables") {
    return [
      p.herbs > 0 && { id: "herb", name: "药草", count: p.herbs, desc: "简单处理伤口，回复少量 HP。", action: "use" },
      p.potions > 0 && { id: "potion", name: "回复药", count: p.potions, desc: "饮用后回复较多 HP。", action: "use" },
      (p.arrows || 0) > 0 && { id: "arrow", name: "箭", count: p.arrows, desc: "弓使用的消耗性战斗道具。装备弓后按住鼠标左键可蓄力射击。" }
    ].filter(Boolean);
  }
  if (category === "materials") {
    return Object.entries(p.resources || {})
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ id: `resource:${name}`, name, count, desc: resourceCatalog[name]?.desc || "建筑或锻造用素材。" }));
  }
  if (category === "loot") {
    return Object.entries(p.materials)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ id: name, name, count, desc: materialCatalog[name]?.desc || "生物掉落的战利品。" }));
  }
  if (category === "equipment") {
    return p.gearBag.map(id => {
      const gear = gearCatalog[id];
      const equipped = gear && p.gear[gear.slot] === id;
      return gear && { id, name: gear.name, count: equipped ? "已装备" : "", desc: gearLabel(id), gear };
    }).filter(Boolean);
  }
  if (category === "important") {
    return p.rings > 0 ? [{ id: "ring", name: "戒指", count: p.rings, desc: "请将其交付于至爱之人。" }] : [];
  }
  return [];
}

export function backpackSelectedItem() {
  const items = backpackItems(uiState.backpackCategory);
  if (!items.length) return null;
  if (!uiState.backpackSelected || !items.some(item => item.id === uiState.backpackSelected)) uiState.backpackSelected = items[0].id;
  return items.find(item => item.id === uiState.backpackSelected) || items[0];
}

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

export function backpackDetailHtml(item: BackpackItem | null): string {
  if (!item) return "<p>这个分类里暂时没有物品。</p>";
  if (uiState.backpackCategory === "loot") {
    return `<h2>${escapeHtml(item.name)} x${item.count}</h2><p>${escapeHtml(item.desc)}</p><p><b>锻造效果</b><br>${forgeEffectText(item.name)}</p>`;
  }
  if (uiState.backpackCategory === "equipment") {
    const gear = item.gear;
    const equipped = state.player.gear[gear.slot] === item.id;
    const action = equipped && gear.slot !== "weapon" ? "卸下" : "装备";
    const actionButton = equipped && gear.slot === "weapon"
      ? "<button type=\"button\" disabled>已装备</button>"
      : `<button type="button" data-bag-action="gearToggle" data-id="${escapeHtml(item.id)}">${action}</button>`;
    return `<h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.desc)}</p><p>部位：${slotName(gear.slot)}　攻击：${gear.atk || 0}　防御：${gear.def || 0}</p><div class="backpack-actions">${actionButton}</div>`;
  }
  const useButton = item.action === "use" ? `<button type="button" data-bag-action="use" data-id="${escapeHtml(item.id)}">使用</button>` : "";
  return `<h2>${escapeHtml(item.name)}${item.count ? ` x${item.count}` : ""}</h2><p>${escapeHtml(item.desc)}</p>${useButton ? `<div class="backpack-actions">${useButton}</div>` : ""}`;
}

export function sellableMaterialEntries() {
  return Object.entries(state.player.materials)
    .filter(([name, count]) => count > 0 && !materialCatalog[name]?.unsellable && materialCatalog[name]?.sell != null);
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

export function knownMagicCards(allowCast = true) {
  const known = state.player.magicKnown.map(id => ({ id, ...magicCatalog[id] })).filter(spell => spell.name);
  if (!known.length) return '<div class="trade-card"><p>还没有学会魔法。</p></div>';
  return known.map(spell => {
    const castButton = allowCast ? `<div class="quest-actions"><button type="button" data-magic-action="cast" data-spell="${spell.id}" ${state.player.mp >= spell.cost && !runtime.pendingMagicCast ? "" : "disabled"}>施放</button></div>` : "";
    return `<div class="trade-card"><h3>${escapeHtml(spell.name)}</h3><p>MP 消耗：${spell.cost}</p><p>${escapeHtml(spell.desc || "")}</p>${castButton}</div>`;
  }).join("");
}

export function questPanelHeader(title: string): string {
  return `<div class="quest-head"><strong>${escapeHtml(title)}</strong><button type="button" data-quest-action="close">关闭</button></div>`;
}

export function questObjectiveText(q: QuestState): string {
  if (q.type === "kill") return `讨伐${q.targetName}：${q.progress || 0}/${q.count}`;
  if (q.type === "hunt") return `捕获${q.targetName}：${q.progress || 0}/${q.count}`;
  if (q.type === "delivery") return `送货给${q.targetNpc || "指定 NPC"}：${q.delivered ? "已送达" : "未送达"}`;
  if (q.type === "scout") return `抵达魔王城前庭任务点：${q.goalDone ? "情报已取得" : "未完成"}`;
  return q.name;
}

export function questAutoSettlementText(q: QuestState): string {
  if (q.type === "kill") return "允许自动结算：目标完成后一段时间，消息会传回公会。";
  if (q.type === "delivery") return "允许自动结算：送货结果会通过民间消息传回委托人。";
  if (q.type === "hunt") return "不允许自动结算：需要玩家交付捕获的动物。";
  if (q.type === "scout") return "不允许自动结算：情报必须由玩家亲自带回公会。";
  return "不允许自动结算。";
}

export function questDetailCard(q: QuestState, label: string): string {
  const status = label === "大型任务" ? majorQuestStatus(q) : smallQuestStatus(q);
  return `<div class="quest-card"><h3>${escapeHtml(label)}：${escapeHtml(q.name)}</h3><p>任务目标：${escapeHtml(questObjectiveText(q))}</p><p>${escapeHtml(questAutoSettlementText(q))}</p><p>当前状态：${escapeHtml(status)}</p><p>报酬：${escapeHtml(questRewardText(q.reward || {}))}</p></div>`;
}

export function sellAllMaterials() {
  let gold = 0;
  for (const [name, count] of Object.entries({ ...state.player.materials })) {
    if (materialCatalog[name]?.unsellable) continue;
    gold += sellMaterial(name, count);
  }
  return gold;
}

export function playerRepelsMonsters() {
  return equippedModList().some(mod => mod.repelMonsters);
}
