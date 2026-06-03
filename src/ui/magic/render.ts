import DATA from "../../data.ts";
import { magicList } from "../../domain/magic-input.ts";
import { escapeHtml, formatNumber } from "../../domain/math.ts";
import { getPendingMagicCast, state } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { knownMagicCards, panelHeader } from "../panels-helpers.ts";

const { magicCatalog } = DATA;

export function refreshMagicPanel() {
  htmlCache.magic = "";
  renderMagicPanel();
  // stats panel is push-driven (subscribes to PLAYER_STATS / MP changes via
  // syncRegistry); no direct call needed here.
}

export function renderMagicPanel() {
  if (!uiState.magicOpen) return;
  const clueCount = Object.keys(state.player.magicClues || {}).length;
  const html = uiState.magicMode === "study"
    ? `${panelHeader(uiState.magicPanelTitle, "magic")}<div class="trade-list"><div class="trade-card"><h3>请输入你理解到的魔法：</h3><div class="magic-input"><input type="text" data-magic-input autocomplete="off" /><button type="button" data-magic-action="parse">解析</button></div><p>这间小屋里堆满了半懂不懂的笔记。没有线索时，正确的词也无法成形。</p></div><div class="trade-card"><h3>已理解线索</h3><p>${clueCount}/${magicList().length}</p></div><div class="trade-card"><h3>已学会魔法</h3><p>${state.player.magicKnown.length ? state.player.magicKnown.map(id => magicCatalog[id]?.name).filter(Boolean).join("、") : "无"}</p></div></div>`
    : `${panelHeader(uiState.magicPanelTitle, "magic")}<div class="trade-list"><div class="trade-card"><h3>当前 MP</h3><p>${formatNumber(state.player.mp)}/${state.player.maxMp}</p>${getPendingMagicCast() ? `<p>正在吟唱${escapeHtml(magicCatalog[getPendingMagicCast().spellId]?.name || "魔法")}...</p>` : ""}</div>${knownMagicCards(true)}</div>`;
  if (html !== htmlCache.magic) {
    get.magicPanelEl.innerHTML = html;
    htmlCache.magic = html;
    const input = get.magicPanelEl.querySelector<HTMLInputElement>("[data-magic-input]");
    if (input) input.focus();
  }
}
