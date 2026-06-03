import { state } from "../../runtime/state.ts";
import { rand } from "../math.ts";
import { addObject, addPickup, spawnCreature } from "../world.ts";

export function generateDungeon() {
  const dw = 30;
  const dh = 20;
  state.dungeon = { w: dw, h: dh };
  state.map = [];
  state.solids = [];
  state.objects = [];
  state.entities = [];
  state.pickups = [];
  for (let y = 0; y < dh; y += 1) {
    const row = [];
    for (let x = 0; x < dw; x += 1) {
      row.push(x === 0 || y === 0 || x === dw - 1 || y === dh - 1 ? "wall" : "dungeon");
    }
    state.map.push(row);
  }
  for (let x = 3; x < 27; x += 1) state.map[9][x] = "road";
  for (let y = 3; y < 17; y += 1) state.map[y][14] = "road";
  const blocks = [
    [8, 4, 3, 1], [19, 5, 1, 4], [5, 13, 5, 1], [21, 12, 3, 1], [12, 2, 1, 4], [16, 15, 1, 3]
  ].sort(() => Math.random() - 0.5);
  for (const [x, y, w, h] of blocks.slice(0, 4)) {
    addObject("block", "石墙", x, y, w, h, "#171d24", "none");
  }
  addObject("exit", "出口", 2, 8, 2, 3, "#596879", "exit");
  addObject("door", "机关门", 23, 8, 1, 3, "#76694b", "none");
  for (let i = 0; i < 5; i += 1) spawnCreature("skeleton", rand(7, 26), rand(4, 16), { region: "ruins" });
  for (let i = 0; i < 4; i += 1) spawnCreature("wisp", rand(9, 25), rand(5, 15), { region: "ruins" });
  for (let i = 0; i < 3; i += 1) spawnCreature("gargoyle", rand(15, 27), rand(7, 17), { region: "ruins" });
  addPickup("potion", "小回复药", 12.5, 5.5, "#5ad0ed");
  addPickup("cleanse", "净化药", 18.5, 14.5, "#d9d4ff");
}
