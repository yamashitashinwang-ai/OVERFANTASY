import type { DataCatalog } from '../../domain/types.ts';

export const commonMonsterBestiary = {
  slime: {
    name: "灰史莱姆",
    kind: "monster",
    faction: "monster",
    color: "#d95858",
    r: 10,
    hp: 22,
    atk: 6,
    speed: 1.65,
    split: true,
    commonDrop: { kind: "material", name: "黏液块", color: "#b9d2b3", chance: 0.68 },
    rareDrop: { kind: "material", name: "凝胶药核", color: "#5ad0ed", chance: 0.18 },
    extraDrops: [
      { kind: "material", name: "凝胶爆弹", color: "#7adff2", chance: 0.01 }
    ]
  },
  wolf: {
    name: "小魔狼",
    kind: "monster",
    faction: "monster",
    color: "#b75ee8",
    r: 10,
    hp: 24,
    atk: 8,
    speed: 2.55,
    pounce: true,
    commonDrop: { kind: "material", name: "魔狼牙", color: "#e2e4e8", chance: 0.54 },
    rareDrop: { kind: "weapon", name: "狼牙短剑", color: "#ded6ef", chance: 0.1 },
    extraDrops: [
      { kind: "material", name: "幼狼狗", color: "#c8b49b", chance: 0.005 }
    ]
  },
  skeleton: {
    name: "骨兵",
    kind: "monster",
    faction: "monster",
    color: "#d7d0be",
    r: 10,
    hp: 30,
    atk: 9,
    speed: 1.35,
    guard: true,
    commonDrop: { kind: "material", name: "旧骨片", color: "#c7c1b2", chance: 0.62 },
    rareDrop: { kind: "weapon", name: "锈蚀长剑", color: "#cfd3d6", chance: 0.13 },
    extraDrops: [
      { kind: "weapon", name: "崭新长剑", color: "#edf3f7", chance: 0.001 }
    ]
  },
  wisp: {
    name: "沼火",
    kind: "monster",
    faction: "monster",
    color: "#6ee0d2",
    r: 9,
    hp: 20,
    atk: 7,
    speed: 2.0,
    ranged: true,
    commonDrop: { kind: "material", name: "冷焰瓶", color: "#5ad0ed", chance: 0.5 },
    rareDrop: { kind: "material", name: "磷光石", color: "#b7c0ca", chance: 0.16 }
  }
} satisfies DataCatalog['bestiary'];
