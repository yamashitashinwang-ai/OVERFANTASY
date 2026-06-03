import { backpackCategories } from "../../runtime/constants.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { escapeHtml } from "../../domain/math.ts";
import { backpackDetailHtml, backpackItems, backpackSelectedItem } from "../panels-helpers.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";

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
