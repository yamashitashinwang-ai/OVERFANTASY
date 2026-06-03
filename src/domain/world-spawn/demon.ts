import { rand } from '../math.ts';
import { addObject, addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnDemon() {
  addPortal("demon", "west_exit_to_ruins", "退回旧王城", 6, 35, "ruins", "east_entry_from_demon", "#83745c");
  addObject("dungeon", "魔王城门", 78, 32, 4, 5, "#5b2d43", "demonKeep");
  for (let i = 0; i < 10; i += 1) spawnCreature("gargoyle", rand(20, 74), rand(14, 57), { region: "demon" });
  for (let i = 0; i < 9; i += 1) spawnCreature("demonKnight", rand(35, 86), rand(18, 54), { region: "demon" });
  scatterPickups([
    { kind: "potion", name: "高回复药", x: 26.5, y: 19.5, color: "#5ad0ed", value: 2 },
    { kind: "stone", name: "魔城黑石", x: 72.5, y: 50.5, color: "#726c82" },
    { kind: "gear", name: "铁盔", x: 43.5, y: 22.5, color: "#9fa8ad" },
    { kind: "gear", name: "银项链", x: 64.5, y: 43.5, color: "#d8e0e6" }
  ]);
}
