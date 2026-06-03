// Magic UI compatibility facade. Rendering and modal-scene lifecycle live
// under `ui/magic/` so magic HTML stays separate from scene control.

export {
  refreshMagicPanel,
  renderMagicPanel
} from "./magic/render.ts";
export {
  openMagicPanel,
  closeMagicPanel
} from "./magic/scene.ts";
