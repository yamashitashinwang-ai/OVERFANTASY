import type { SceneKey } from "../types.ts";
import type { ExitPathRect, MapExitConfig } from "./types.ts";

const road = (x: number, y: number, w: number, h: number, tile = "road"): ExitPathRect => ({ x, y, w, h, tile });

export const mapExitConfigs: MapExitConfig[] = [
  { sourceScene: "field", portalId: "west_exit_to_peakless", zone: { x: 0, y: 24, w: 2, h: 5 }, path: [road(0, 24, 6, 5)] },
  { sourceScene: "field", portalId: "north_exit_to_forest", zone: { x: 74, y: 0, w: 5, h: 2 }, path: [road(74, 0, 5, 27)] },
  { sourceScene: "field", portalId: "east_exit_to_ruins", zone: { x: 94, y: 54, w: 2, h: 5 }, path: [road(84, 54, 12, 5)] },

  { sourceScene: "forest", portalId: "north_exit_to_silverleaf", zone: { x: 46, y: 0, w: 5, h: 2 }, path: [road(46, 0, 5, 8)] },
  { sourceScene: "forest", portalId: "south_exit_to_village", zone: { x: 7, y: 70, w: 5, h: 2 }, path: [road(7, 34, 5, 38)] },
  { sourceScene: "forest", portalId: "east_exit_to_ruins", zone: { x: 94, y: 59, w: 2, h: 5 }, path: [road(83, 59, 13, 5)] },

  { sourceScene: "silverleaf", portalId: "south_exit_to_forest", zone: { x: 46, y: 70, w: 5, h: 2 }, path: [road(46, 66, 5, 6, "elvenRoad")] },

  { sourceScene: "peakless", portalId: "east_exit_to_field", zone: { x: 94, y: 33, w: 2, h: 5 }, path: [road(88, 33, 8, 5)] },
  { sourceScene: "peakless", portalId: "west_exit_to_stonegorge", zone: { x: 0, y: 33, w: 2, h: 5 }, path: [road(0, 33, 6, 5)] },

  { sourceScene: "stonegorge", portalId: "east_exit_to_peakless", zone: { x: 94, y: 33, w: 2, h: 5 }, path: [road(88, 33, 8, 5)] },
  { sourceScene: "stonegorge", portalId: "north_exit_to_hatepit", zone: { x: 46, y: 0, w: 5, h: 2 }, path: [road(46, 0, 5, 7)] },

  { sourceScene: "hatepit", portalId: "south_exit_to_stonegorge", zone: { x: 46, y: 70, w: 5, h: 2 }, path: [road(46, 66, 5, 6)] },

  { sourceScene: "ruins", portalId: "west_exit_to_field", zone: { x: 0, y: 33, w: 2, h: 5 }, path: [road(0, 33, 11, 5)] },
  { sourceScene: "ruins", portalId: "east_exit_to_demon", zone: { x: 94, y: 33, w: 2, h: 5 }, path: [road(84, 33, 12, 5)] },

  { sourceScene: "demon", portalId: "west_exit_to_ruins", zone: { x: 0, y: 33, w: 2, h: 5 }, path: [road(0, 33, 8, 5)] }
];

export function mapExitConfigFor(sourceScene: SceneKey, portalId: string): MapExitConfig | null {
  return mapExitConfigs.find(config => config.sourceScene === sourceScene && config.portalId === portalId) || null;
}
