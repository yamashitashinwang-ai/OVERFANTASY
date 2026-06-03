// Backpack UI compatibility facade. Rendering, scene toggling, item use, and
// equipment actions live under `ui/backpack/` by responsibility.

export { renderBackpack } from "./backpack/render.ts";
export { toggleBackpack } from "./backpack/scene.ts";
export { useBackpackItem } from "./backpack/items.ts";
export { toggleBackpackGear } from "./backpack/gear.ts";
