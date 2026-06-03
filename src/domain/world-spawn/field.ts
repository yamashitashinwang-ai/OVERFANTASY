import { rand } from '../math.ts';
import { addObject, addEntity, addPortal, spawnCreature, scatterPickups } from '../world.ts';
import { addTree, addBush, addWindFlag } from './helpers.ts';

export function spawnField() {
  addObject("shop", "杂货店", 7, 6, 3, 3, "#8fa0b2", "shop");
  addObject("house", "空屋", 12, 6, 3, 3, "#b28d65", "house");
  addObject("guild", "公会", 6, 12, 4, 2, "#8d77a6", "guild");
  addObject("shrine", "白石祠", 15, 12, 2, 2, "#ccd2dc", "cleanse");
  addObject("magicCottage", "魔法爱好者小屋", 21, 7, 3, 3, "#5f83b7", "magicCottage");
  addObject("forge", "锻造台", 31, 27, 2, 2, "#a6654f", "forge");
  addTree("村口槐树", 4.5, 18.2);
  addTree("井边小树", 18.8, 17.2);
  addTree("路边老树", 37.5, 16.2);
  addBush("屋后草丛", 4.2, 10.2);
  addBush("白石草丛", 18.0, 14.5);
  addBush("铁匠铺草丛", 35.0, 29.8);
  addWindFlag("公会布旗", 4.8, 13.4);
  addPortal("field", "west_exit_to_peakless", "无峰山脉西路", 3, 25, "peakless", "east_entry_from_field", "#8b8170");
  addPortal("field", "north_exit_to_forest", "北部森林路标", 76, 24, "forest", "south_entry_from_village", "#5e9c63");
  addPortal("field", "east_exit_to_ruins", "旧王城路标", 84, 55, "ruins", "west_entry_from_field", "#726a7d");

  addEntity({ kind: "npc", name: "莉娜", faction: "human", x: 10.5, y: 11.5, r: 10, hp: 18, maxHp: 18, atk: 2, color: "#83c5ff", region: "village", affection: 24, devotion: 0, wantsTalk: false });
  addEntity({ kind: "npc", name: "艾梅", faction: "elf", x: 18.5, y: 14.5, r: 10, hp: 16, maxHp: 16, atk: 2, color: "#9fe0a2", region: "village", affection: 10, devotion: 0, wantsTalk: false });
  addEntity({ kind: "npc", name: "陶格", faction: "dwarf", x: 33.5, y: 30.5, r: 10, hp: 22, maxHp: 22, atk: 4, color: "#d49b6a", region: "field", affection: 4, devotion: 0, wantsTalk: false });

  for (let i = 0; i < 14; i += 1) spawnCreature("rabbit", rand(32, 58), rand(8, 33), { region: "forest" });
  for (let i = 0; i < 7; i += 1) spawnCreature("slime", rand(62, 84), rand(39, 62), { region: "ruins" });
  for (let i = 0; i < 5; i += 1) spawnCreature("wolf", rand(51, 76), rand(8, 35), { region: "forest" });
  scatterPickups([
    { kind: "herb", name: "药草", x: 31.5, y: 8.5, color: "#6bd46c" },
    { kind: "herb", name: "药草", x: 47.5, y: 30.5, color: "#6bd46c" },
    { kind: "potion", name: "小回复药", x: 64.5, y: 44.5, color: "#5ad0ed" },
    { kind: "wood", name: "木材", x: 38.5, y: 21.5, color: "#b8895a" },
    { kind: "stone", name: "反重力石", x: 56.5, y: 53.5, color: "#b7c0ca" },
    { kind: "gear", name: "皮帽", x: 24.5, y: 29.5, color: "#c79b64" }
  ]);
}
