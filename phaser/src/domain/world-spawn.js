// World population per scene. This is the big content table that places
// NPCs / monsters / pickups / portals for each map. Kept separate from
// world.js so the factories module stays small and reusable.

import { state } from '../scenes/Game.js';
import { rand } from './math.js';
import {
  addObject, addEntity, addPickup, addPortal,
  spawnCreature, scatterPickups
} from './world.js';

export function spawnWorld(scene = state.scene) {
  state.entities = [];
  state.objects = [];
  state.solids = [];
  state.pickups = [];

  if (scene === "field") {
    addObject("shop", "杂货店", 7, 6, 3, 3, "#8fa0b2", "shop");
    addObject("house", "空屋", 12, 6, 3, 3, "#b28d65", "house");
    addObject("guild", "公会", 6, 12, 4, 2, "#8d77a6", "guild");
    addObject("shrine", "白石祠", 15, 12, 2, 2, "#ccd2dc", "cleanse");
    addObject("magicCottage", "魔法爱好者小屋", 21, 7, 3, 3, "#5f83b7", "magicCottage");
    addObject("forge", "锻造台", 31, 27, 2, 2, "#a6654f", "forge");
    addPortal("无峰山脉西路", 3, 25, "peakless", 88.5, 35.5, "#8b8170");
    addPortal("北部森林路标", 76, 24, "forest", 8.5, 35.5, "#5e9c63");
    addPortal("旧王城路标", 84, 55, "ruins", 12.5, 34.5, "#726a7d");

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

  if (scene === "forest") {
    addPortal("银叶林北径", 47, 4, "silverleaf", 48.5, 62.5, "#b9d9a2");
    addPortal("回到晨风原野", 4, 33, "field", 74.5, 25.5, "#83745c");
    addPortal("沼泽古径", 83, 61, "ruins", 22.5, 48.5, "#5e8a86");
    addObject("shrine", "树根祠", 43, 31, 2, 2, "#ccd2dc", "cleanse");
    spawnCreature("treant", 35.5, 24.5, { region: "forest", affection: 0, devotion: 0 });
    spawnCreature("treant", 55.5, 39.5, { region: "forest", affection: 0, devotion: 0 });
    for (let i = 0; i < 18; i += 1) spawnCreature("rabbit", rand(9, 70), rand(7, 45), { region: "forest" });
    for (let i = 0; i < 11; i += 1) spawnCreature("wolf", rand(28, 86), rand(8, 55), { region: "forest" });
    for (let i = 0; i < 8; i += 1) spawnCreature("wisp", rand(61, 87), rand(47, 65), { region: "swamp" });
    scatterPickups([
      { kind: "herb", name: "月见草", x: 25.5, y: 18.5, color: "#8ce86f" },
      { kind: "herb", name: "苦叶草", x: 68.5, y: 40.5, color: "#6bd46c" },
      { kind: "wood", name: "硬木", x: 51.5, y: 17.5, color: "#b8895a" },
      { kind: "resource", name: "七眼蛛丝", x: 45.5, y: 61.5, color: "#d8f5ff" },
      { kind: "potion", name: "小回复药", x: 76.5, y: 58.5, color: "#5ad0ed" },
      { kind: "gear", name: "旅靴", x: 63.5, y: 28.5, color: "#a98f6b" },
      { kind: "gear", name: "铜戒指", x: 80.5, y: 55.5, color: "#c58a4d" }
    ]);
  }

  if (scene === "silverleaf") {
    addPortal("树灵森林南径", 47, 66, "forest", 47.5, 7.5, "#5e9c63");
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

  if (scene === "peakless") {
    addPortal("回到晨风原野", 88, 34, "field", 4.5, 26.5, "#83745c");
    addPortal("石泉西路", 4, 34, "stonegorge", 88.5, 35.5, "#9a8f78");
    for (let i = 0; i < 8; i += 1) spawnCreature("wolf", rand(20, 75), rand(12, 58), { region: "peakless" });
    for (let i = 0; i < 7; i += 1) spawnCreature("slime", rand(22, 74), rand(18, 58), { region: "peakless" });
    for (let i = 0; i < 3; i += 1) spawnCreature("skeleton", rand(35, 70), rand(22, 52), { region: "peakless", maxHp: 24, atk: 7 });
    scatterPickups([
      { kind: "stone", name: "山脉碎石", x: 31.5, y: 28.5, color: "#b7c0ca" },
      { kind: "stone", name: "粗矿石", x: 55.5, y: 17.5, color: "#9fa8ad" },
      { kind: "wood", name: "寒风枯枝", x: 68.5, y: 41.5, color: "#b8895a" },
      { kind: "potion", name: "小回复药", x: 78.5, y: 35.5, color: "#5ad0ed" }
    ]);
  }

  if (scene === "stonegorge") {
    addPortal("回到无峰山脉", 88, 34, "peakless", 6.5, 35.5, "#83745c");
    addPortal("仇恨之孔北梯", 47, 4, "hatepit", 48.5, 62.5, "#4c4655");
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

  if (scene === "hatepit") {
    addPortal("回到石泉沟壑", 47, 66, "stonegorge", 47.5, 6.5, "#83745c");
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

  if (scene === "ruins") {
    addPortal("回到晨风原野", 9, 34, "field", 83.5, 55.5, "#83745c");
    addPortal("魔王城远门", 84, 35, "demon", 10.5, 35.5, "#9b4b62");
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

  if (scene === "demon") {
    addPortal("退回旧王城", 6, 35, "ruins", 82.5, 35.5, "#83745c");
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
}
