// Shop UI compatibility facade. Rendering and modal-scene lifecycle live
// under `ui/shop/` so shop HTML stays separate from scene control.

export {
  refreshShopPanel,
  renderShopPanel
} from "./shop/render.ts";
export {
  openShopPanel,
  closeShopPanel
} from "./shop/scene.ts";
