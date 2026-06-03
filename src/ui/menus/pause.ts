import { t } from "../../domain/i18n.ts";
import { isPaused } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";

export function renderPauseMenu() {
  if (!isPaused()) return;
  const html = `<div class="pause-card"><h2>${t("pause.title")}</h2><p class="menu-note">${t("pause.text")}</p><div class="pause-actions"><button type="button" data-pause-action="save">${t("pause.save")}</button><button type="button" data-pause-action="main">${t("pause.main")}</button></div></div>`;
  if (html !== htmlCache.pause) {
    get.pauseMenuEl.innerHTML = html;
    htmlCache.pause = html;
  }
  get.pauseMenuEl.classList.remove("hidden");
}
