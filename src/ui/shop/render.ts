import DATA from "../../data.ts";
import { escapeHtml } from "../../domain/math.ts";
import { state } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { panelHeader, sellableMaterialEntries } from "../panels-helpers.ts";

const { materialCatalog } = DATA;

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
