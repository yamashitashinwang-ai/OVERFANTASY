// Character status panel compatibility facade. Rendering and scene toggling
// live under `ui/character/` by responsibility.

export { renderCharacterPanel } from "./character/render.ts";
export { openCharacterPanel, closeCharacterPanel } from "./character/scene.ts";
