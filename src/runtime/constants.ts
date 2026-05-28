export const TILE_SIZE = 32;
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;
export const WORLD_WIDTH = 96;
export const WORLD_HEIGHT = 72;
export const VIEW_WIDTH = Math.floor(GAME_WIDTH / TILE_SIZE);
export const VIEW_HEIGHT = Math.floor(GAME_HEIGHT / TILE_SIZE);
export const MAGIC_CHANT_TIME_SCALE = 3.5;

export const BACKPACK_CATEGORIES = [
  ['consumables', '消耗品'],
  ['materials', '素材'],
  ['loot', '战利品'],
  ['equipment', '装备'],
  ['important', '重要物品']
];

// Legacy aliases while the old Game.ts facade is being removed.
export const tile = TILE_SIZE;
export const W = GAME_WIDTH;
export const H = GAME_HEIGHT;
export const worldW = WORLD_WIDTH;
export const worldH = WORLD_HEIGHT;
export const viewW = VIEW_WIDTH;
export const viewH = VIEW_HEIGHT;
export const magicChantTimeScale = MAGIC_CHANT_TIME_SCALE;
export const backpackCategories = BACKPACK_CATEGORIES;
