import type { DataCatalog } from '../domain/types.ts';

export const questCatalog: DataCatalog['questCatalog'] = {
  major: [
    { id: "major_wolf_hunt", name: "森林魔狼讨伐", type: "kill", species: "wolf", targetName: "小魔狼", count: 3, reward: { gold: [42, 60], potions: [1, 2], wood: [1, 3], stone: [1, 2] }, autoSettleDelay: 28 },
    { id: "major_demon_scout", name: "魔王城前庭侦察", type: "scout", scene: "demon", x: 48, y: 35, radius: 9, reward: { gold: [62, 90], potions: [1, 3], wood: [2, 4], stone: [2, 4] } }
  ],
  small: [
    { id: "small_rabbit_hunt", name: "捕猎野兔", type: "hunt", species: "rabbit", targetName: "野兔", count: 2, reward: { gold: [7, 13], affection: [10, 15], devotion: [3, 5] } },
    { id: "small_delivery", name: "送货", type: "delivery", reward: { gold: [6, 12], affection: [12, 16], devotion: [3, 6] }, autoSettleDelay: 22 }
  ]
};
