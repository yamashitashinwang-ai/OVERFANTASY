// Forge UI compatibility facade. Rendering and modal-scene lifecycle live
// under `ui/forge/` so forge HTML stays separate from scene control.

export {
  refreshForgePanel,
  renderWeaponForgePanel,
  renderForgePanel
} from "./forge/render.ts";
export {
  openForgePanel,
  closeForgePanel
} from "./forge/scene.ts";
