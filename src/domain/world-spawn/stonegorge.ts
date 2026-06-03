import { rand } from '../math.ts';
import { addObject, addEntity, addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnStonegorge() {
  addPortal("stonegorge", "east_exit_to_peakless", "回到无峰山脉", 88, 34, "peakless", "west_entry_from_stonegorge", "#83745c");
  addPortal("stonegorge", "north_exit_to_hatepit", "仇恨之孔北梯", 47, 4, "hatepit", "south_entry_from_stonegorge", "#4c4655");
  addObject("house", "洞穴小家", 12, 12, 5, 4, "#94765d", "house");
  addObject("shrine", "英灵殿", 23, 13, 3, 3, "#b7c0ca", "cleanse");
  addObject("magicCottage", "术士研讨所", 33, 12, 4, 3, "#6c7b91", "magicCottage");
  addObject("shop", "人类出张所", 12, 25, 3, 3, "#8fa0b2", "shop");
  addObject("guild", "公会", 23, 25, 4, 2, "#8d77a6", "guild");
  addObject("forge", "铁魂工坊", 34, 24, 3, 3, "#a6654f", "forge");
  addEntity({ kind: "npc", name: "布洛克", faction: "dwarf", x: 20.5, y: 19.5, r: 10, hp: 22, maxHp: 22, atk: 4, color: "#d49b6a", region: "stonegorge", affection: 18, devotion: 0, wantsTalk: false });
  addEntity({ kind: "npc", name: "石泉匠", faction: "dwarf", x: 39.5, y: 27.5, r: 10, hp: 24, maxHp: 24, atk: 4, color: "#c9a37a", region: "stonegorge", affection: 10, devotion: 0, wantsTalk: false });
  for (let i = 0; i < 6; i += 1) spawnCreature("slime", rand(52, 82), rand(18, 58), { region: "stonegorge" });
  for (let i = 0; i < 4; i += 1) spawnCreature("wolf", rand(50, 84), rand(15, 55), { region: "stonegorge" });
  scatterPickups([
    { kind: "stone", name: "石泉矿石", x: 55.5, y: 21.5, color: "#b7c0ca" },
    { kind: "stone", name: "粗矿石", x: 70.5, y: 47.5, color: "#9fa8ad" },
    { kind: "potion", name: "小回复药", x: 29.5, y: 22.5, color: "#5ad0ed" },
    { kind: "gear", name: "铁盔", x: 62.5, y: 58.5, color: "#9fa8ad" }
  ]);
}
