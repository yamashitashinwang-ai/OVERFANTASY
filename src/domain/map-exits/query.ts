import { state } from "../../runtime/state.ts";
import type { SceneKey, Vector2, WorldObjectState } from "../types.ts";
import { mapExitConfigFor } from "./config.ts";
import type { ExitRect } from "./types.ts";

export function mapExitZoneFor(sourceScene: SceneKey, portalId: string): ExitRect | null {
  return mapExitConfigFor(sourceScene, portalId)?.zone || null;
}

export function pointInObject(point: Vector2, obj: WorldObjectState): boolean {
  return point.x >= obj.x && point.x <= obj.x + obj.w && point.y >= obj.y && point.y <= obj.y + obj.h;
}

export function currentMapExit(): WorldObjectState | null {
  return state.objects.find(obj => obj.kind === "mapExit" && pointInObject(state.player, obj)) || null;
}
