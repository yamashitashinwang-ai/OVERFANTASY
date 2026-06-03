import { rand } from '../math.ts';
import { addObject, addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnHatepit() {
  addPortal("hatepit", "south_exit_to_stonegorge", "回到石泉沟壑", 47, 66, "stonegorge", "north_entry_from_hatepit", "#83745c");
  addObject("shrine", "封印柱", 45, 32, 3, 3, "#53506e", "cleanse");
  for (let i = 0; i < 12; i += 1) spawnCreature("skeleton", rand(16, 76), rand(12, 58), { region: "hatepit" });
  for (let i = 0; i < 8; i += 1) spawnCreature("wisp", rand(22, 80), rand(14, 60), { region: "hatepit" });
  for (let i = 0; i < 5; i += 1) spawnCreature("gargoyle", rand(42, 86), rand(20, 55), { region: "hatepit" });
  scatterPickups([
    { kind: "stone", name: "异常矿石", x: 61.5, y: 24.5, color: "#726c82" },
    { kind: "stone", name: "黑裂矿", x: 33.5, y: 44.5, color: "#53506e" },
    { kind: "potion", name: "小回复药", x: 25.5, y: 57.5, color: "#5ad0ed" },
    { kind: "cleanse", name: "净化药", x: 52.5, y: 40.5, color: "#d9d4ff" }
  ]);
}
