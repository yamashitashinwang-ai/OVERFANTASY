import { readSaveSlots } from "../../domain/persistence.ts";
import { uiState, isMenuOpen } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { applyLanguage, resetRuntimeUi } from "../dom-chrome.ts";
import { renderLoadMenu } from "./save-slots.ts";
import {
  renderHelpMenu,
  renderHomeMenu,
  renderLanguageMenu,
  renderRaceMenu
} from "./views.ts";

export function renderMainMenu() {
  if (!isMenuOpen()) return;
  let html = "";
  if (uiState.menuView === "load") html = renderLoadMenu();
  else if (uiState.menuView === "help") html = renderHelpMenu();
  else if (uiState.menuView === "language") html = renderLanguageMenu();
  else if (uiState.menuView === "race") html = renderRaceMenu();
  else html = renderHomeMenu(readSaveSlots().length > 0);

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
