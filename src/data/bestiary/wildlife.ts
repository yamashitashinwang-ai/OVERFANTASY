import type { DataCatalog } from '../../domain/types.ts';

export const wildlifeBestiary = {
  rabbit: {
    name: "野兔",
    kind: "animal",
    faction: "animal",
    color: "#d8d1b1",
    r: 8,
    hp: 7,
    atk: 0,
    speed: 1.9,
    flee: true,
    commonDrop: { kind: "material", name: "野兔肉", color: "#d7b58c", chance: 0.9 },
    rareDrop: { kind: "material", name: "柔软毛皮", color: "#eee6c8", chance: 0.12 },
    extraDrops: [
      { kind: "material", name: "旧时代之钻", color: "#f8f2ff", chance: 0.00001 }
    ]
  },
  treant: {
    name: "幼树灵",
    kind: "friendly",
    faction: "tree",
    color: "#6ed084",
    r: 12,
    hp: 28,
    atk: 4,
    speed: 0.9,
    commonDrop: { kind: "material", name: "活木", color: "#8fcf70", chance: 0.75 },
    rareDrop: { kind: "material", name: "树灵核", color: "#d4f7bc", chance: 0.08 },
    extraDrops: [
      { kind: "material", name: "树灵心", color: "#a8ffd1", chance: 0.001 }
    ]
  }
} satisfies DataCatalog['bestiary'];
