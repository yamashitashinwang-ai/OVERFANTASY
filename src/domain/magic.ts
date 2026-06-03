// Magic compatibility facade. Spell knowledge, targeting, MP, casting, and
// magic effects live under `domain/magic/` by responsibility.

export {
  addMagicClue,
  hasMagicClue,
  knowsMagic,
  learnMagicFromInput,
  shareMagicRumor
} from './magic/knowledge.ts';
export {
  closestEnemyAtPoint,
  friendlyAtPoint,
  hostileToPlayer,
  magicCastPoint,
  magicTargetFilter,
  playerHasEnemyAggro
} from './magic/targets.ts';
export {
  damageByMagic,
  startMagicEffect,
  updateMagicZoneEffect
} from './magic/effects.ts';
export type { SpellWithId } from './magic/effects.ts';
export {
  beginMagicCast,
  resolveMagicCast,
  updatePendingMagicCast
} from './magic/casting.ts';
export { updateMpRegen } from './magic/mp.ts';
