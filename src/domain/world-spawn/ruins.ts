import { rand } from '../math.ts';
import { addObject, addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnRuins() {
  addPortal("ruins", "west_exit_to_field", "回到晨风原野", 9, 34, "field", "east_entry_from_ruins", "#83745c");
  addPortal("ruins", "east_exit_to_demon", "魔王城远门", 84, 35, "demon", "west_entry_from_ruins", "#9b4b62");
  addObject("dungeon", "旧王城入口", 49, 32, 3, 3, "#4b4a59", "dungeon");
  addObject("shrine", "残破圣像", 20, 22, 2, 2, "#ccd2dc", "cleanse");
  for (let i = 0; i < 12; i += 1) spawnCreature("slime", rand(22, 61), rand(20, 58), { region: "ruins" });
  for (let i = 0; i < 12; i += 1) spawnCreature("skeleton", rand(38, 82), rand(14, 61), { region: "ruins" });
  for (let i = 0; i < 6; i += 1) spawnCreature("gargoyle", rand(62, 88), rand(40, 63), { region: "mountain" });
  scatterPickups([
    { kind: "stone", name: "反重力石", x: 68.5, y: 50.5, color: "#b7c0ca" },
    { kind: "potion", name: "小回复药", x: 34.5, y: 54.5, color: "#5ad0ed" },
    { kind: "gear", name: "锁子甲", x: 44.5, y: 22.5, color: "#9fa8ad" }
  ]);
}
