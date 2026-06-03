import { escapeHtml } from "../../domain/math.ts";
import {
  formatGameTime,
  formatSaveTime,
  readSaveSlots,
  saveMeta
} from "../../domain/persistence.ts";
import type { SaveRecord } from "../../domain/persistence.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { t } from "../../domain/i18n.ts";

export function saveRowHtml(save: SaveRecord) {
  const meta = save.meta || saveMeta(save.state);
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
  const saves = readSaveSlots().sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  const list = saves.length ? saves.map(saveRowHtml).join("") : `<p class="menu-note">${t("menu.noSaves")}</p>`;
  return `<div class="menu-card"><h2>${t("menu.load.title")}</h2><div class="save-list">${list}</div>${selectedSaveActionsHtml()}<div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
}
