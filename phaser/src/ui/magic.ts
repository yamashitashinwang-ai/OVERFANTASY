// HTML panel renderer. Subscribes to game state via domain/runtime services.
// No engine GameObjects — just innerHTML.

import { state, runtime, getPendingMagicCast } from '../runtime/state.ts';
import { panelHeader, knownMagicCards } from './panels-helpers.ts';
import { magicList } from '../domain/magic-input.ts';
import { closeShopPanel } from './shop.ts';
import { closeForgePanel } from './forge.ts';
import { toggleBackpack } from './backpack.ts';
import { closeQuestPanel } from './quest.ts';
import { uiState } from '../runtime/ui-state.ts';
import DATA from '../data.ts';
const { magicCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.ts';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { log, toast } from '../runtime/services.ts';
import { autoSave } from '../domain/game-flow.ts';

export function closeMagicPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.('MagicScene')) {
    s.scene.stop('MagicScene');
    s.scene.resume();
  }
  uiState.magicOpen = false;
  get.magicPanelEl.classList.add('hidden');
  htmlCache.magic = '';
}

export function openMagicPanel(mode = 'book', title: string | null = null) {
  uiState.magicMode = mode;
  uiState.magicPanelTitle = title || (mode === 'study' ? '魔法爱好者小屋' : '魔法');
  uiState.magicInput = '';
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive('MagicScene')) {
    htmlCache.magic = '';
    renderMagicPanel();
    return;
  }
  s.scene.launch('MagicScene');
  s.scene.pause();
}

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
