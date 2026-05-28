// HTML panel renderer. Subscribes to game state via the domain services /
// re-exports from scenes/Game.js. No engine GameObjects — just innerHTML.

import { state } from '../scenes/Game.js';
import { saveMeta } from '../domain/persistence.js';
import { uiState, isMenuOpen, isPaused } from '../runtime/ui-state.js';
import { resetRuntimeUi, applyLanguage } from './dom-chrome.js';
import DATA from '../data.js';
import { escapeHtml, formatNumber } from '../domain/math.js';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { readSaveSlots, formatSaveTime, formatGameTime } from '../domain/persistence.js';
import { playableRaces } from '../domain/combat/race.js';
import {
  log, toast, autoSave
} from '../scenes/Game.js';

export function saveRowHtml(save) {
  const meta = save.meta || saveMeta(save.state || {});
  const active = save.id === uiState.selectedSaveId ? " active" : "";
  return `<button type="button" class="save-row${active}" data-menu-action="selectSave" data-save-id="${save.id}"><b>${escapeHtml(save.name || save.id)}</b><span>${formatSaveTime(save.savedAt)}　${escapeHtml(meta.scene)}　HP ${escapeHtml(meta.hp)}　${meta.gold}G　${formatGameTime(meta.time || 0)}</span></button>`;
}

export function selectedSaveActionsHtml() {
  const save = readSaveSlots().find(item => item.id === uiState.selectedSaveId);
  if (!save) return "";
  const confirm = uiState.pendingDeleteSaveId === save.id
    ? `<div class="confirm-delete">${t("menu.confirmDelete")} ${escapeHtml(save.name)}？<div class="save-actions"><button type="button" data-menu-action="confirmDelete" data-save-id="${save.id}">${t("menu.confirmDelete")}</button><button type="button" data-menu-action="cancelDelete">${t("menu.cancel")}</button></div></div>`
    : "";
  return `<div class="save-actions"><button type="button" data-menu-action="loadSelected" data-save-id="${save.id}">${t("menu.start")}</button><button type="button" data-menu-action="askDelete" data-save-id="${save.id}">${t("menu.delete")}</button></div>${confirm}`;
}

export function renderLoadMenu() {
  const saves = readSaveSlots().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const list = saves.length ? saves.map(saveRowHtml).join("") : `<p class="menu-note">${t("menu.noSaves")}</p>`;
  return `<div class="menu-card"><h2>${t("menu.load.title")}</h2><div class="save-list">${list}</div>${selectedSaveActionsHtml()}<div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
}

export function renderHelpMenu() {
  return `<div class="menu-card"><h2>${t("menu.help.title")}</h2><p class="menu-note">${t("menu.help.text")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
}

export function renderLanguageMenu() {
  const buttons = languageOptions
    .map(option => `<button type="button" data-menu-action="setLanguage" data-language="${option.id}" ${option.id === currentLanguage() ? "disabled" : ""}>${option.label}</button>`)
    .join("");
  const current = languageOptions.find(option => option.id === currentLanguage())?.label || "中文";
  return `<div class="menu-card"><h2>${t("menu.language.title")}</h2><div class="menu-actions">${buttons}</div><p class="menu-note">${t("menu.currentLanguage")}：${current}</p><p class="menu-note">${t("menu.language.note")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
}

export function renderMainMenu() {
  if (!isMenuOpen()) return;
  const saves = readSaveSlots();
  const disabled = saves.length ? "" : "disabled";
  let html = "";
  if (uiState.menuView === "load") html = renderLoadMenu();
  else if (uiState.menuView === "help") html = renderHelpMenu();
  else if (uiState.menuView === "language") html = renderLanguageMenu();
  else if (uiState.menuView === "race") {
    html = `<div class="menu-card"><h2>${t("menu.race.title")}</h2><div class="menu-actions">${playableRaces.map(race => `<button type="button" data-menu-action="startRace" data-race="${race}">${raceLabel(race)}</button>`).join("")}</div><p class="menu-note">${t("menu.race.note")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
  }
  else {
    html = `<div class="menu-card"><h2>OVERFANTASY</h2><div class="menu-actions"><button type="button" data-menu-action="new">${t("menu.new")}</button><button type="button" data-menu-action="continue" ${disabled}>${t("menu.continue")}</button><button type="button" data-menu-action="load">${t("menu.load")}</button><button type="button" data-menu-action="language">${t("menu.language")}</button><button type="button" data-menu-action="help">${t("menu.help")}</button></div><p class="menu-note">${t("menu.main.note")}</p></div>`;
  }
  if (html !== htmlCache.menu) {
    get.mainMenuEl.innerHTML = html;
    htmlCache.menu = html;
  }
  get.mainMenuEl.classList.remove("hidden");
  get.pauseMenuEl.classList.add("hidden");
}

export function openMainMenu() {
  uiState.appMode = "menu";
  uiState.currentSaveId = null;
  resetRuntimeUi();
  uiState.menuView = "main";
  htmlCache.menu = "";
  applyLanguage();
  renderMainMenu();
}

export function renderPauseMenu() {
  if (!isPaused()) return;
  const html = `<div class="pause-card"><h2>${t("pause.title")}</h2><p class="menu-note">${t("pause.text")}</p><div class="pause-actions"><button type="button" data-pause-action="save">${t("pause.save")}</button><button type="button" data-pause-action="main">${t("pause.main")}</button></div></div>`;
  if (html !== htmlCache.pause) {
    get.pauseMenuEl.innerHTML = html;
    htmlCache.pause = html;
  }
  get.pauseMenuEl.classList.remove("hidden");
}
