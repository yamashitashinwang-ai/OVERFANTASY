// DOM chrome — i18n-driven panel labels and cache invalidation. Touches the
// document directly because the sidebar/legend live in index.html.

import { t, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { uiState } from '../runtime/ui-state.js';
import { runtime, flyingArrows, magicEffects } from '../runtime/state.js';

export function applyLanguage() {
  const option = languageOptions.find(item => item.id === currentLanguage()) || languageOptions[0];
  document.documentElement.lang = option.htmlLang;
  document.title = t('document.title');
  const titleEl = document.querySelector('.panel header h1');
  if (titleEl) titleEl.textContent = t('side.title');
  const legendRows = document.querySelectorAll('.legend div');
  if (legendRows[0]) legendRows[0].innerHTML = `<span class="dot player"></span>${t('legend.actor')}`;
  if (legendRows[1]) legendRows[1].innerHTML = `<span class="square"></span>${t('legend.building')}`;
  if (legendRows[2]) legendRows[2].innerHTML = `<span class="tri"></span>${t('legend.pickup')}`;
  const buttonLabels = {
    btnTalk: 'action.talk',
    btnAttack: 'action.attack',
    btnDefend: 'action.defend',
    btnDodge: 'action.dodge',
    btnGift: 'action.gift',
    btnRest: 'action.rest',
    btnBackpack: 'action.backpack',
    btnMagic: 'action.magic'
  };
  for (const [id, key] of Object.entries(buttonLabels)) {
    const button = document.getElementById(id);
    if (button) button.textContent = t(key);
  }
}

export function clearLanguageRenderCaches() {
  htmlCache.menu = '';
  htmlCache.pause = '';
  htmlCache.backpack = '';
  htmlCache.quest = '';
  htmlCache.shop = '';
  htmlCache.forge = '';
  htmlCache.magic = '';
  htmlCache.gear = '';
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
  if (get.pauseMenuEl) get.pauseMenuEl.classList.add('hidden');
  if (get.mainMenuEl) get.mainMenuEl.classList.add('hidden');
  htmlCache.backpack = '';
  htmlCache.quest = '';
  htmlCache.shop = '';
  htmlCache.forge = '';
  htmlCache.magic = '';
  htmlCache.pause = '';
  htmlCache.gear = '';
  runtime.bowCharge = null;
  flyingArrows.length = 0;
  uiState.magicPanelTitle = '魔法';
  runtime.pendingMagicCast = null;
  magicEffects.length = 0;
}
