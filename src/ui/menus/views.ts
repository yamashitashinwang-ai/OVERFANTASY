import { playableRaces } from "../../domain/combat/race.ts";
import {
  currentLanguage,
  languageOptions,
  raceLabel,
  t
} from "../../domain/i18n.ts";

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

export function renderRaceMenu() {
  const buttons = playableRaces
    .map(race => `<button type="button" data-menu-action="startRace" data-race="${race}">${raceLabel(race)}</button>`)
    .join("");
  return `<div class="menu-card"><h2>${t("menu.race.title")}</h2><div class="menu-actions">${buttons}</div><p class="menu-note">${t("menu.race.note")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
}

export function renderHomeMenu(hasSaves: boolean) {
  const disabled = hasSaves ? "" : "disabled";
  return `<div class="menu-card"><h2>OVERFANTASY</h2><div class="menu-actions"><button type="button" data-menu-action="new">${t("menu.new")}</button><button type="button" data-menu-action="continue" ${disabled}>${t("menu.continue")}</button><button type="button" data-menu-action="load">${t("menu.load")}</button><button type="button" data-menu-action="language">${t("menu.language")}</button><button type="button" data-menu-action="help">${t("menu.help")}</button></div><p class="menu-note">${t("menu.main.note")}</p></div>`;
}
