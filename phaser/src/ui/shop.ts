// HTML panel renderer. Subscribes to game state via domain/runtime services.
// No engine GameObjects — just innerHTML.

import { state, runtime } from '../runtime/state.ts';
import { panelHeader, sellableMaterialEntries } from './panels-helpers.ts';
import { uiState } from '../runtime/ui-state.ts';
import DATA from '../data.ts';
const { materialCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.ts';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { closeForgePanel } from './forge.ts';
import { closeMagicPanel } from './magic.ts';
import { currentWeapon, gearLabel, gearModList, slotName, refreshCombatStats } from '../domain/combat/weapon.ts';
import { materialCount, sellableMaterialCount, materialSummary } from '../domain/inventory.ts';
import { log, toast } from '../runtime/services.ts';
import { autoSave } from '../domain/game-flow.ts';

export function closeShopPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.('ShopScene')) {
    s.scene.stop('ShopScene');
    s.scene.resume();
  }
  uiState.shopOpen = false;
  get.shopPanelEl.classList.add('hidden');
  htmlCache.shop = '';
}

export function openShopPanel() {
  if (state.player.monsterForm) return toast('商人拒绝和魔物化角色交易。');
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive('ShopScene')) return;
  s.scene.launch('ShopScene');
  s.scene.pause();
}

export function refreshShopPanel() {
  htmlCache.shop = "";
  renderShopPanel();
  // stats + gear sidebars are push-driven; no direct call needed here.
}

export function renderShopPanel() {
  if (!uiState.shopOpen) return;
  const tabs = `<div class="backpack-tabs"><button type="button" data-shop-tab="buy" class="${uiState.shopTab === "buy" ? "active" : ""}">购买</button><button type="button" data-shop-tab="sell" class="${uiState.shopTab === "sell" ? "active" : ""}">出售</button></div>`;
  const body = uiState.shopTab === "buy"
    ? `<div class="trade-card"><h3>小回复药</h3><p>价格：8G。当前金币：${state.player.gold}G。</p><div class="quest-actions"><button type="button" data-shop-action="buyPotion" ${state.player.gold >= 8 ? "" : "disabled"}>购买</button></div></div><div class="trade-card"><h3>箭</h3><p>价格：1G / 支。当前持有：${state.player.arrows || 0} 支。</p><div class="quest-actions"><button type="button" data-shop-action="buyArrow" data-amount="1" ${state.player.gold >= 1 ? "" : "disabled"}>购买 1 支</button><button type="button" data-shop-action="buyArrow" data-amount="5" ${state.player.gold >= 5 ? "" : "disabled"}>购买 5 支</button></div></div>`
    : (sellableMaterialEntries().length
      ? sellableMaterialEntries().map(([name, count]) => {
        const unit = materialCatalog[name].sell || 0;
        return `<div class="trade-row"><span>${escapeHtml(name)}</span><span>数量 ${count}</span><span>单价 ${unit}G</span><button type="button" data-shop-action="sellOne" data-material="${escapeHtml(name)}">出售一个</button><button type="button" data-shop-action="sellAll" data-material="${escapeHtml(name)}">全部出售</button></div>`;
      }).join("")
      : '<div class="trade-card"><p>当前没有可出售素材。</p></div>');
  const html = `${panelHeader("商店", "shop")}${tabs}<div class="trade-list">${body}</div>`;
  if (html !== htmlCache.shop) {
    get.shopPanelEl.innerHTML = html;
    htmlCache.shop = html;
  }
}
