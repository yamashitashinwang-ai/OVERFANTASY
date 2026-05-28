// HTML panel renderer. Subscribes to game state via the domain services /
// re-exports from scenes/Game.js. No engine GameObjects — just innerHTML.

import { state, runtime } from '../scenes/Game.js';
import { backpackItems, backpackSelectedItem, backpackDetailHtml, backpackCategories } from '../scenes/Game.js';
import { uiState } from '../runtime/ui-state.js';
import DATA from '../data.js';
const { gearCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.js';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { currentWeapon, gearLabel, gearModList, slotName, refreshCombatStats } from '../domain/combat/weapon.js';
import { materialCount, sellableMaterialCount, materialSummary, equipGear } from '../domain/inventory.js';
import {
  log, toast, autoSave
} from '../scenes/Game.js';

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

export function toggleBackpack(force) {
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

export function useBackpackItem(id) {
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

export function toggleBackpackGear(id) {
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
