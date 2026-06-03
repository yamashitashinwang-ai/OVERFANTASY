import { state } from "../../runtime/state.ts";
import { rand } from "../math.ts";
import { spawnCreature } from "../world.ts";

type SpawnRule = [species: string, cap: number, xs: [number, number], ys: [number, number], region: string];

function livingCount(species: string): number {
  return state.entities.filter(e => e.alive && e.species === species).length;
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
