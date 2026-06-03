// Modal panel scene compatibility facade. Each concrete panel scene lives in
// `scenes/panels/` with the shared DOM-backed base class kept separate from
// Backpack, Quest, Shop, Forge, and Magic panel actions.

export { BackpackScene } from './panels/BackpackScene.ts';
export { QuestScene } from './panels/QuestScene.ts';
export { ShopScene } from './panels/ShopScene.ts';
export { ForgeScene } from './panels/ForgeScene.ts';
export { MagicScene } from './panels/MagicScene.ts';
