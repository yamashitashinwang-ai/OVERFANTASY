// HTML panel renderer. Subscribes to game state via the domain services /
// re-exports from scenes/Game.js. No engine GameObjects — just innerHTML.

import { state, runtime } from '../scenes/Game.js';
import { panelHeader, knownMagicCards, getPendingMagicCast } from '../scenes/Game.js';
import { magicList } from '../domain/magic-input.js';
import { closeShopPanel } from './shop.js';
import { closeForgePanel } from './forge.js';
import { toggleBackpack } from './backpack.js';
import { closeQuestPanel } from './quest.js';
import { uiState } from '../runtime/ui-state.js';
import DATA from '../data.js';
const { magicCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.js';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import {
  log, toast, autoSave
} from '../scenes/Game.js';

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

export function openMagicPanel(mode = 'book', title = null) {
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
    const input = get.magicPanelEl.querySelector("[data-magic-input]");
    if (input) input.focus();
  }
}
