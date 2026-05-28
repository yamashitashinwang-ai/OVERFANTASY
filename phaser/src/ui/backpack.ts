// HTML panel renderer. Subscribes to game state via domain/runtime services.
// No engine GameObjects — just innerHTML.

import { state, runtime } from '../runtime/state.ts';
import { backpackCategories } from '../runtime/constants.ts';
import { backpackItems, backpackSelectedItem, backpackDetailHtml } from './panels-helpers.ts';
import { uiState } from '../runtime/ui-state.ts';
import DATA from '../data.ts';
const { gearCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.ts';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { currentWeapon, gearLabel, gearModList, slotName, refreshCombatStats } from '../domain/combat/weapon.ts';
import { materialCount, sellableMaterialCount, materialSummary, equipGear } from '../domain/inventory.ts';
import { log, toast } from '../runtime/services.ts';
import { autoSave } from '../domain/game-flow.ts';

export function renderBackpack() {
  if (!uiState.backpackOpen) return;
  const items = backpackItems(uiState.backpackCategory);
  const selected = backpackSelectedItem();
  const tabs = backpackCategories
    .map(([id, label]) => `<button type="button" data-bag-category="${id}" class="${id === uiState.backpackCategory ? "active" : ""}">${label}</button>`)
    .join("");
  const list = items.length
    ? items.map(item => `<button type="button" class="backpack-item ${item.id === uiState.backpackSelected ? "active" : ""}" data-bag-item="${escapeHtml(item.id)}"><span>${escapeHtml(item.name)}</span><b>${escapeHtml(item.count || "")}</b></button>`).join("")
    : "<p>暂无物品。</p>";
  const html = `<div class="backpack-head"><strong>背包</strong><span class="backpack-paused">游戏暂停</span><button type="button" class="backpack-close" data-bag-action="close">关闭 B / Esc</button></div><div class="backpack-tabs">${tabs}</div><div class="backpack-body"><div class="backpack-list">${list}</div><div class="backpack-detail">${backpackDetailHtml(selected)}</div></div>`;
  if (html !== htmlCache.backpack) {
    get.backpackEl.innerHTML = html;
    htmlCache.backpack = html;
  }
}

export function toggleBackpack(force: boolean | undefined = undefined) {
  const s = runtime.pSceneRef;
  if (!s) return;
  const active = s.scene.isActive('BackpackScene');
  const target = typeof force === 'boolean' ? force : !active;
  if (target && !active) { s.scene.launch('BackpackScene'); s.scene.pause(); }
  else if (!target && active) {
    // Scene handles its own close path (Esc / close button). External close
    // calls land here; tell the scene to stop and resume GameScene.
    s.scene.stop('BackpackScene'); s.scene.resume();
    get.backpackEl.classList.add('hidden');
    uiState.backpackOpen = false;
  }
}

export function useBackpackItem(id: string) {
  const p = state.player;
  if (id === "herb") {
    if (p.herbs <= 0) return;
    if (p.hp >= p.maxHp) return toast("生命已经是满的。");
    p.herbs -= 1;
    p.hp = Math.min(p.maxHp, p.hp + 10);
    log("使用药草，回复了少量 HP。");
  }
  if (id === "potion") {
    if (p.potions <= 0) return;
    if (p.hp >= p.maxHp) return toast("生命已经是满的。");
    p.potions -= 1;
    p.hp = Math.min(p.maxHp, p.hp + 24);
    log("使用回复药，HP 明显恢复。");
  }
  htmlCache.backpack = "";
  renderBackpack();
}

export function toggleBackpackGear(id: string) {
  const gear = gearCatalog[id];
  if (!gear) return;
  if (state.player.gear[gear.slot] === id) {
    if (gear.slot === "weapon") return toast("武器不能空手卸下。");
    state.player.gear[gear.slot] = null;
    refreshCombatStats();
    log(`卸下了${gear.name}。`);
  } else {
    equipGear(id);
  }
  htmlCache.backpack = "";
  renderBackpack();
}
