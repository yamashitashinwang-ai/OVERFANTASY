// HTML panel renderer. Subscribes to game state via the domain services /
// re-exports from scenes/Game.js. No engine GameObjects — just innerHTML.

import { state, runtime } from '../scenes/Game.js';
import { panelHeader, weaponForgeEntries, weaponForgeCategories, selectedWeaponForgeEntry, selectedForgeMaterial, materialOptionList, forgeEffectText, forgeRequirementHtml, forgeSlotButton, hasForgeIngredients } from '../scenes/Game.js';
import { uiState } from '../runtime/ui-state.js';
import DATA from '../data.js';
import { escapeHtml, formatNumber } from '../domain/math.js';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { closeShopPanel } from './shop.js';
import { closeMagicPanel } from './magic.js';
import { currentWeapon, gearLabel, gearModList, slotName, refreshCombatStats } from '../domain/combat/weapon.js';
import { materialCount, sellableMaterialCount, materialSummary } from '../domain/inventory.js';
import {
  log, toast, autoSave
} from '../scenes/Game.js';

export function closeForgePanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.('ForgeScene')) {
    s.scene.stop('ForgeScene');
    s.scene.resume();
  }
  uiState.forgeOpen = false;
  get.forgePanelEl.classList.add('hidden');
  htmlCache.forge = '';
}

export function openForgePanel() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive('ForgeScene')) return;
  s.scene.launch('ForgeScene');
  s.scene.pause();
}

export function refreshForgePanel() {
  htmlCache.forge = "";
  renderForgePanel();
  // stats + gear sidebars are push-driven (subscribe to PLAYER_STATS /
  // GEAR_EQUIPPED / INVENTORY_CHANGED) — no direct call needed here.
}

export function renderWeaponForgePanel() {
  const categories = weaponForgeCategories();
  const selected = selectedWeaponForgeEntry();
  if (!selected) return '<div class="trade-card"><p>当前没有可锻造武器。</p></div>';
  const categoryTabs = `<div class="backpack-tabs">${categories.map(category => `<button type="button" data-forge-weapon-category="${escapeHtml(category)}" class="${category === uiState.forgeWeaponCategory ? "active" : ""}">${escapeHtml(category)}</button>`).join("")}</div>`;
  const entries = weaponForgeEntries(uiState.forgeWeaponCategory);
  const list = entries.map(entry => `<button type="button" class="backpack-item ${entry.gearId === selected.gearId ? "active" : ""}" data-forge-weapon="${escapeHtml(entry.gearId)}"><span>${escapeHtml(entry.gear.name)}</span><b>${escapeHtml(entry.gear.type)}</b></button>`).join("");
  const gear = selected.gear;
  const enough = hasForgeIngredients(selected.materials);
  const owned = state.player.gearBag.includes(selected.gearId);
  const disabled = owned || !enough;
  const buttonText = owned ? "已拥有" : enough ? "锻造武器" : "材料不足";
  const detail = `<div class="backpack-detail"><h2>${escapeHtml(gear.name)}</h2><p>类型：${escapeHtml(gear.type)}　攻击：${gear.atk || 0}　防御：${gear.def || 0}</p><p>距离：${Number(gear.range || 0).toFixed(2)}　攻击间隔：${Number(gear.cooldown || 0).toFixed(2)}s　体力消耗：${Number(gear.stamina || 0).toFixed(1)}</p><h3>所需材料</h3><div class="trade-list">${forgeRequirementHtml(selected.materials)}</div><div class="quest-actions"><button type="button" data-forge-action="forgeWeapon" data-weapon="${escapeHtml(selected.gearId)}" ${disabled ? "disabled" : ""}>${buttonText}</button></div></div>`;
  return `${categoryTabs}<div class="backpack-body"><div class="backpack-list">${list}</div>${detail}</div>`;
}

export function renderForgePanel() {
  if (!uiState.forgeOpen) return;
  const tabs = `<div class="backpack-tabs"><button type="button" data-forge-tab="ring" class="${uiState.forgeTab === "ring" ? "active" : ""}">戒指锻造</button><button type="button" data-forge-tab="material" class="${uiState.forgeTab === "material" ? "active" : ""}">素材锻造</button><button type="button" data-forge-tab="weapon" class="${uiState.forgeTab === "weapon" ? "active" : ""}">武器锻造</button></div>`;
  const ringHtml = `<div class="trade-card"><h3>粗制戒指</h3><p>所需材料：木材 1 / 反重力石 1。</p><p>当前拥有：木材 ${state.player.wood || 0} / 反重力石 ${state.player.stone || 0} / 戒指 ${state.player.rings || 0}。</p><div class="quest-actions"><button type="button" data-forge-action="forgeRing" ${(state.player.wood >= 1 && state.player.stone >= 1) ? "" : "disabled"}>锻造戒指</button></div></div>`;
  const selected = selectedForgeMaterial();
  const materialList = materialOptionList();
  const materialHtml = selected
    ? `<div class="backpack-body"><div class="backpack-list">${materialList.map(item => `<button type="button" class="backpack-item ${item.name === selected.name ? "active" : ""}" data-forge-material="${escapeHtml(item.name)}"><span>${escapeHtml(item.name)}</span><b>${item.count}</b></button>`).join("")}</div><div class="backpack-detail"><h2>${escapeHtml(selected.name)} x${selected.count}</h2><p>${escapeHtml(selected.desc)}</p><p><b>可用效果</b><br>${forgeEffectText(selected.name)}</p><div class="forge-slot-grid">${["weapon", "head", "body", "legs", "feet", "accessory"].map(slot => forgeSlotButton(selected.name, slot)).join("")}</div></div></div>`
    : '<div class="trade-card"><p>当前没有可用于锻造的素材。</p></div>';
  const body = uiState.forgeTab === "ring" ? ringHtml : uiState.forgeTab === "weapon" ? renderWeaponForgePanel() : materialHtml;
  const html = `${panelHeader("锻造台", "forge")}${tabs}${body}`;
  if (html !== htmlCache.forge) {
    get.forgePanelEl.innerHTML = html;
    htmlCache.forge = html;
  }
}
