// Death compatibility facade. Death fatigue, inventory loss, lost-package
// placement, and the top-level death flow live under `domain/death/` by
// responsibility.

export {
  applyDeathFatigueStats,
  deathFatigueStaminaRegenMultiplier,
  normalizeDeathState,
  relieveDeathFatigue,
  updateDeathSystem
} from './death/fatigue.ts';
export { inventorySnapshot, rollDeathInventoryLoss } from './death/inventory-loss.ts';
export { safePackagePosition } from './death/package-position.ts';
export { processPlayerDeath } from './death/process.ts';
