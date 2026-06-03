import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { escapeHtml } from '../../domain/math.ts';
import type { GearCatalogItem } from '../../domain/types.ts';
import { gearLabel, slotName } from '../../domain/combat/weapon.ts';
import { forgeEffectText } from './forge.ts';

const { gearCatalog, materialCatalog, resourceCatalog } = DATA;

interface BackpackItem {
  id: string;
  name: string;
  count?: string | number;
  desc: string;
  action?: string;
  gear?: GearCatalogItem;
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
    return [
      p.rings > 0 && { id: "ring", name: "戒指", count: p.rings, desc: "请将其交付于至爱之人。" },
      (p.reversePotions || 0) > 0 && { id: "reversePotion", name: "逆魔药", count: p.reversePotions, desc: "极稀有药剂，可以解除魔物化并将魔化值降到10。", action: "use" }
    ].filter(Boolean);
  }
  return [];
}

export function backpackSelectedItem() {
  const items = backpackItems(uiState.backpackCategory);
  if (!items.length) return null;
  if (!uiState.backpackSelected || !items.some(item => item.id === uiState.backpackSelected)) uiState.backpackSelected = items[0].id;
  return items.find(item => item.id === uiState.backpackSelected) || items[0];
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
      ? '<button type="button" disabled>已装备</button>'
      : `<button type="button" data-bag-action="gearToggle" data-id="${escapeHtml(item.id)}">${action}</button>`;
    return `<h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.desc)}</p><p>部位：${slotName(gear.slot)}　攻击：${gear.atk || 0}　防御：${gear.def || 0}</p><div class="backpack-actions">${actionButton}</div>`;
  }
  const useButton = item.action === "use" ? `<button type="button" data-bag-action="use" data-id="${escapeHtml(item.id)}">使用</button>` : "";
  return `<h2>${escapeHtml(item.name)}${item.count ? ` x${item.count}` : ""}</h2><p>${escapeHtml(item.desc)}</p>${useButton ? `<div class="backpack-actions">${useButton}</div>` : ""}`;
}
