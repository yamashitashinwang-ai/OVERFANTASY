import type { DataCatalog } from '../../domain/types.ts';

export const eliteMonsterBestiary = {
  gargoyle: {
    name: "石像鬼",
    kind: "monster",
    faction: "monster",
    color: "#8f8a9a",
    r: 12,
    hp: 44,
    atk: 12,
    speed: 1.8,
    pounce: true,
    guard: true,
    commonDrop: { kind: "material", name: "魔像石", color: "#b7c0ca", chance: 0.78 },
    rareDrop: { kind: "gear", name: "黑铁戒指", color: "#726c82", chance: 0.07 }
  },
  demonKnight: {
    name: "魔城骑士",
    kind: "monster",
    faction: "monster",
    color: "#eb5f73",
    r: 12,
    hp: 58,
    atk: 15,
    speed: 2.05,
    pounce: true,
    ranged: true,
    commonDrop: { kind: "gold", name: "魔城军饷", color: "#f3c45b", chance: 0.85, value: 9 },
    rareDrop: { kind: "weapon", name: "黑曜枪", color: "#d9d4ff", chance: 0.08 }
  }
} satisfies DataCatalog['bestiary'];
