import { state } from "../../runtime/state.ts";
import type { SceneKey } from "../types.ts";
import { mapExitConfigFor } from "./config.ts";
import type { ExitPathRect } from "./types.ts";

function paintRect(rect: ExitPathRect) {
  const tile = rect.tile || "road";
  for (let yy = rect.y; yy < rect.y + rect.h; yy += 1) {
    if (!state.map[yy]) continue;
    for (let xx = rect.x; xx < rect.x + rect.w; xx += 1) {
      if (state.map[yy][xx] !== undefined) state.map[yy][xx] = tile;
    }
  }
}

export function paintMapExitPath(sourceScene: SceneKey, portalId: string) {
  const config = mapExitConfigFor(sourceScene, portalId);
  if (!config) return;
  for (const rect of config.path) paintRect(rect);
  paintRect({ ...config.zone, tile: config.path[0]?.tile || "road" });
}
