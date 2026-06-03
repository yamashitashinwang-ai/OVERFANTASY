import { state } from '../../runtime/state.ts';
import { worldH, worldW } from './constants.ts';

export function mapBounds(): { w: number; h: number } {
  if (state.mode === "dungeon" && state.dungeon) return { w: state.dungeon.w, h: state.dungeon.h };
  return { w: worldW, h: worldH };
}

export function tileAt(x: number, y: number): string {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const bounds = mapBounds();
  if (tx < 0 || ty < 0 || tx >= bounds.w || ty >= bounds.h) return "wall";
  return state.map[ty]?.[tx] || "wall";
}

export function makeMap(scene = "field") {
  state.map = [];
  state.mode = "world";
  state.scene = scene;
  state.dungeon = null;
  for (let y = 0; y < worldH; y += 1) {
    const row: string[] = [];
    for (let x = 0; x < worldW; x += 1) {
      let t = "grass";
      if (scene === "field") {
        if (x < 27 && y < 25) t = "village";
        if (x >= 28 && x < 61 && y < 37) t = "forest";
        if (x >= 58 && y >= 38) t = "ruins";
        if ((x === 27 && y < 58) || (y === 26 && x < 78) || (y === 56 && x > 18 && x < 88)) t = "road";
      } else if (scene === "forest") {
        t = "forest";
        if ((x + y) % 13 === 0) t = "grass";
        if (x > 62 || y > 46) t = "swamp";
        if (x > 70 && y > 52) t = "water";
        if ((x === 47 && y > 5 && y < 66) || (y === 34 && x > 6 && x < 86)) t = "road";
      } else if (scene === "ruins") {
        t = "ruins";
        if (x < 22 && y < 22) t = "grass";
        if (x > 62 || y > 46) t = "mountain";
        if ((x === 45 && y > 7 && y < 64) || (y === 35 && x > 10 && x < 86)) t = "road";
      } else if (scene === "silverleaf") {
        t = "silverleaf";
        if ((x + y * 2) % 17 === 0) t = "paleGrove";
        if (x > 8 && x < 39 && y > 8 && y < 31) t = "paleGrove";
        if ((x === 48 && y > 5 && y < 68) || (y === 58 && x > 11 && x < 84) || (y === 18 && x > 9 && x < 42)) t = "elvenRoad";
        if (x > 73 && y < 20) t = "forest";
      } else if (scene === "peakless") {
        t = "mountain";
        if ((x * 3 + y) % 19 === 0) t = "ore";
        if ((y === 35 && x > 4 && x < 91) || (x === 48 && y > 10 && y < 63)) t = "road";
        if ((y === 24 && x > 20 && x < 70 && !(x > 43 && x < 53)) || (y === 49 && x > 31 && x < 83 && !(x > 45 && x < 56))) t = "wall";
      } else if (scene === "stonegorge") {
        t = "mountain";
        if (x > 8 && x < 39 && y > 9 && y < 33) t = "ore";
        if ((x + y) % 11 === 0) t = "ore";
        if ((y === 35 && x > 5 && x < 91) || (x === 48 && y > 5 && y < 66) || (y === 20 && x > 9 && x < 42)) t = "road";
        if ((x === 64 && y > 12 && y < 55 && !(y > 31 && y < 39)) || (y === 51 && x > 18 && x < 65 && !(x > 43 && x < 53))) t = "wall";
      } else if (scene === "hatepit") {
        t = "chasm";
        if ((x + y * 3) % 13 === 0) t = "ore";
        if ((x === 48 && y > 8 && y < 68) || (y === 36 && x > 10 && x < 75)) t = "road";
        if ((x > 38 && x < 59 && y > 23 && y < 46) || (x > 70 && y < 24)) t = "seal";
        if ((y === 18 && x > 17 && x < 79 && !(x > 44 && x < 52)) || (x === 76 && y > 28 && y < 60)) t = "wall";
      } else if (scene === "demon") {
        t = "ash";
        if (x > 19 && x < 77 && y > 12 && y < 58) t = "castle";
        if ((x === 48 && y > 5 && y < 67) || (y === 35 && x > 8 && x < 88)) t = "road";
        if ((x > 29 && x < 35 && y > 24 && y < 47) || (x > 61 && x < 67 && y > 24 && y < 47)) t = "wall";
      }
      if (x < 2 || y < 2 || x > worldW - 3 || y > worldH - 3) t = scene === "demon" ? "wall" : "water";
      row.push(t);
    }
    state.map.push(row);
  }
}
