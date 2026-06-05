// DOM chrome — i18n-driven document labels, panel cache invalidation, and
// runtime modal cleanup.

import { t, languageOptions, currentLanguage } from '../domain/i18n.ts';
import { htmlCache } from './cache.ts';
import { get } from './dom.ts';
import { uiState } from '../runtime/ui-state.ts';
import { runtime, flyingArrows, magicEffects } from '../runtime/state.ts';
import { registerGameFlowUiHandlers } from '../runtime/game-flow-ui.ts';

export function applyLanguage() {
  const option = languageOptions.find(item => item.id === currentLanguage()) || languageOptions[0];
  document.documentElement.lang = option.htmlLang;
  document.title = t('document.title');
}

export function clearLanguageRenderCaches() {
  htmlCache.menu = '';
  htmlCache.pause = '';
  htmlCache.backpack = '';
  htmlCache.quest = '';
  htmlCache.shop = '';
  htmlCache.forge = '';
  htmlCache.magic = '';
  htmlCache.character = '';
  htmlCache.career = '';
}

export function resetRuntimeUi() {
  uiState.backpackOpen = false;
  if (get.backpackEl) get.backpackEl.classList.add('hidden');
  uiState.questOpen = false;
  if (get.questPanelEl) get.questPanelEl.classList.add('hidden');
  uiState.shopOpen = false;
  if (get.shopPanelEl) get.shopPanelEl.classList.add('hidden');
  uiState.forgeOpen = false;
  if (get.forgePanelEl) get.forgePanelEl.classList.add('hidden');
  uiState.magicOpen = false;
  if (get.magicPanelEl) get.magicPanelEl.classList.add('hidden');
  uiState.characterOpen = false;
  if (get.characterPanelEl) get.characterPanelEl.classList.add('hidden');
  uiState.careerOpen = false;
  if (get.careerPanelEl) get.careerPanelEl.classList.add('hidden');
  uiState.corruptionChoiceOpen = false;
  if (get.pauseMenuEl) get.pauseMenuEl.classList.add('hidden');
  if (get.mainMenuEl) get.mainMenuEl.classList.add('hidden');
  htmlCache.backpack = '';
  htmlCache.quest = '';
  htmlCache.shop = '';
  htmlCache.forge = '';
  htmlCache.magic = '';
  htmlCache.character = '';
  htmlCache.career = '';
  htmlCache.pause = '';
  runtime.bowCharge = null;
  flyingArrows.length = 0;
  uiState.magicPanelTitle = '魔法';
  runtime.pendingMagicCast = null;
  magicEffects.length = 0;
}

registerGameFlowUiHandlers({
  clearToast() {
    if (get.toastEl) get.toastEl.textContent = '';
  },
  resetRuntimeUi,
  applyLanguage
});
