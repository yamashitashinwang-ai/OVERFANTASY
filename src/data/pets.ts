import type { DataCatalog } from '../domain/types.ts';

export const petCatalog: DataCatalog['petCatalog'] = {
  wolfPup: { name: "幼狼狗", color: "#c8b49b", r: 8, maxHp: 24, atk: 4, speed: 2.7, roamRadius: 3.8, attackRange: 0.85, guardRange: 4.6, cooldown: 0.9 },
  heartTreant: { name: "心芽树灵", color: "#a8ffd1", r: 10, maxHp: 34, atk: 3, speed: 1.8, roamRadius: 3.4, attackRange: 0.95, guardRange: 4.2, cooldown: 1.15 }
};
