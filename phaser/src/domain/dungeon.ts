// Scene flow + dungeon generation. loadScene/enterDungeon/leaveDungeon orchestrate
// map rebuild + player position teleport + autosave. generateDungeon builds the
// procedurally arranged "排列迷宫" room layout.

import { state } from '../runtime/state.ts';
import DATA from '../data.ts';
import { rand } from './math.ts';
import { autoSave } from '../runtime/autosave.ts';
import { log } from '../runtime/services.ts';
import { setBowCharge, flyingArrows } from '../runtime/state.ts';
import { makeMap, addObject, addPickup } from './world.ts';
import { spawnWorld } from './world-spawn.ts';
import { recallPets } from './inventory.ts';
import { worldNews } from './npc.ts';
import { rebuildDisplay } from '../display/index.ts';
import type { SceneKey } from './types.ts';

const { bestiary } = DATA;
import { spawnCreature } from './world.ts';

type SpawnRule = [species: string, cap: number, xs: [number, number], ys: [number, number], region: string];

function livingCount(species: string): number {
  return state.entities.filter(e => e.alive && e.species === species).length;
}

export function loadScene(scene: SceneKey, x: number, y: number, message: string) {
  setBowCharge(null);
  flyingArrows.length = 0;
  makeMap(scene);
  spawnWorld(scene);
  state.player.x = x;
  state.player.y = y;
  recallPets();
  state.spawnClock = 6;
  rebuildDisplay();
  log(message);
  autoSave();
}

export function enterDungeon() {
  setBowCharge(null);
  flyingArrows.length = 0;
  state.mode = "dungeon";
  state.player.x = 5.5;
  state.player.y = 5.5;
  generateDungeon();
  recallPets();
  rebuildDisplay();
  log("进入旧王城的排列迷宫。房间由模板重新组合，深处藏着唯一武器。 ");
  autoSave();
}

export function leaveDungeon() {
  loadScene("ruins", 50.5, 36.5, "离开迷宫，回到旧王城入口。 ");
}

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

export function spawnForCurrentScene() {
  if (state.mode !== "world") return;
  const table: SpawnRule[] = ({
    field: [
      ["rabbit", 18, [31, 59], [7, 34], "forest"],
      ["slime", 10, [61, 86], [39, 63], "ruins"],
      ["wolf", 8, [50, 78], [7, 35], "forest"]
    ],
    forest: [
      ["rabbit", 22, [8, 70], [6, 45], "forest"],
      ["wolf", 16, [25, 88], [8, 58], "forest"],
      ["wisp", 12, [60, 88], [45, 66], "swamp"]
    ],
    ruins: [
      ["slime", 14, [22, 62], [18, 60], "ruins"],
      ["skeleton", 16, [37, 85], [13, 63], "ruins"],
      ["gargoyle", 9, [60, 89], [38, 65], "mountain"]
    ],
    demon: [
      ["gargoyle", 12, [20, 78], [12, 59], "demon"],
      ["demonKnight", 13, [32, 88], [17, 56], "demon"]
    ]
  } as Record<string, SpawnRule[]>)[state.scene] || [];

  for (const [species, cap, xs, ys, region] of table) {
    if (livingCount(species) < cap && Math.random() < 0.78) {
      spawnCreature(species, rand(xs[0], xs[1]), rand(ys[0], ys[1]), { region });
    }
  }
}
