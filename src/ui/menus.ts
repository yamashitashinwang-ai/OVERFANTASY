// Menu UI compatibility facade. Concrete renderers live under `ui/menus/`
// by menu surface so the DOM rendering stays separate from scene orchestration.

import { registerGameFlowUiHandlers } from "../runtime/game-flow-ui.ts";
import { htmlCache } from "./cache.ts";
import { openMainMenu, renderMainMenu } from "./menus/main.ts";

export {
  saveRowHtml,
  selectedSaveActionsHtml,
  renderLoadMenu
} from "./menus/save-slots.ts";
export {
  renderHelpMenu,
  renderLanguageMenu,
  renderRaceMenu,
  renderHomeMenu
} from "./menus/views.ts";
export {
  renderMainMenu,
  openMainMenu
};
export { renderPauseMenu } from "./menus/pause.ts";

registerGameFlowUiHandlers({
  invalidateMenuCache() {
    htmlCache.menu = '';
  },
  renderMainMenu
});
