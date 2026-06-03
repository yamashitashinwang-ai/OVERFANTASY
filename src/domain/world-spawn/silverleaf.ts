import { rand } from '../math.ts';
import { addObject, addEntity, addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnSilverleaf() {
  addPortal("silverleaf", "south_exit_to_forest", "树灵森林南径", 47, 66, "forest", "north_entry_from_silverleaf", "#5e9c63");
  addObject("house", "银叶殿堂", 12, 10, 5, 4, "#b8cda4", "house");
  addObject("shrine", "银叶祠", 23, 13, 2, 2, "#dbe6d2", "cleanse");
  addObject("magicCottage", "自然之拥", 31, 11, 3, 3, "#8ed0b2", "magicCottage");
  addObject("shop", "人类出张所", 14, 23, 3, 3, "#8fa0b2", "shop");
  addObject("guild", "公会", 23, 23, 4, 2, "#8d77a6", "guild");
  addObject("forge", "锻造台", 34, 23, 2, 2, "#a6654f", "forge");
  addEntity({ kind: "npc", name: "露希尔", faction: "elf", x: 19.5, y: 18.5, r: 10, hp: 16, maxHp: 16, atk: 2, color: "#b8f0c4", region: "silverleaf", affection: 18, devotion: 0, wantsTalk: false });
  addEntity({ kind: "npc", name: "银叶守望", faction: "elf", x: 41.5, y: 58.5, r: 10, hp: 18, maxHp: 18, atk: 3, color: "#d7efc0", region: "silverleaf", affection: 10, devotion: 0, wantsTalk: false });
  spawnCreature("treant", 58.5, 27.5, { region: "silverleaf", affection: 0, devotion: 0 });
  spawnCreature("treant", 70.5, 46.5, { region: "silverleaf", affection: 0, devotion: 0 });
  for (let i = 0; i < 16; i += 1) spawnCreature("rabbit", rand(42, 84), rand(12, 56), { region: "silverleaf" });
  for (let i = 0; i < 3; i += 1) spawnCreature("wolf", rand(68, 88), rand(47, 63), { region: "silverleaf" });
  scatterPickups([
    { kind: "herb", name: "银叶草", x: 54.5, y: 20.5, color: "#b8f0c4" },
    { kind: "herb", name: "月见草", x: 70.5, y: 38.5, color: "#8ce86f" },
    { kind: "wood", name: "银叶木", x: 61.5, y: 52.5, color: "#c7d7a4" },
    { kind: "potion", name: "小回复药", x: 28.5, y: 20.5, color: "#5ad0ed" },
    { kind: "gear", name: "旅靴", x: 78.5, y: 57.5, color: "#a98f6b" }
  ]);
}
