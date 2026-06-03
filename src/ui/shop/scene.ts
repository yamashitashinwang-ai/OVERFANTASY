import { setOpenShopPanelHandler } from "../../runtime/panel-actions.ts";
import { restoreGameInputFocus } from "../../runtime/input.ts";
import { runtime, state } from "../../runtime/state.ts";
import { toast } from "../../runtime/services.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";

export function closeShopPanel() {
  const s = runtime.pSceneRef;
  if (s?.scene?.isActive?.("ShopScene")) {
    s.scene.stop("ShopScene");
    s.scene.resume();
    restoreGameInputFocus(s);
  }
  uiState.shopOpen = false;
  get.shopPanelEl.classList.add("hidden");
  htmlCache.shop = "";
}

export function openShopPanel() {
  if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive("ShopScene")) return;
  s.scene.launch("ShopScene");
  s.scene.pause();
}
setOpenShopPanelHandler(openShopPanel);
