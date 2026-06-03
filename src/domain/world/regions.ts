import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import type { RegionState } from '../types.ts';

const { regions, sceneNames } = DATA;

export function regionAt(x: number, y: number): RegionState {
  if (state.mode === "dungeon") return regions.ruins;
  if (state.scene === "forest") return y > 46 || x > 63 ? regions.swamp : regions.forest;
  if (state.scene === "ruins") return x > 58 || y > 42 ? regions.mountain : regions.ruins;
  if (state.scene === "demon") return regions.demon;
  if (state.scene === "silverleaf") return regions.silverleaf;
  if (state.scene === "peakless") return regions.peakless;
  if (state.scene === "stonegorge") return regions.stonegorge;
  if (state.scene === "hatepit") return regions.hatepit;
  if (x < 27 && y < 25) return regions.village;
  if (x >= 28 && x < 61 && y < 37) return regions.forest;
  if (x >= 58 && y >= 38) return regions.ruins;
  return regions.field;
}

export function currentAreaName(): string {
  if (state.mode === "dungeon") return "排列迷宫";
  return `${sceneNames[state.scene] || "未知地带"} / ${regionAt(state.player.x, state.player.y).name}`;
}

export function currentPetScene(): string {
  return state.mode === "dungeon" ? "dungeon" : state.scene;
}
