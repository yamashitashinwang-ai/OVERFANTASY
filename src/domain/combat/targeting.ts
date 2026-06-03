// Combat target search and attack-shape geometry compatibility facade.
// The pure helpers live under `combat/targeting/` by responsibility.

export { startAttackEffect } from './targeting/effects.ts';
export { attackEntityFilter, canUseWorldActions } from './targeting/filters.ts';
export { bodyGap, nearestAttackTarget, nearestEntity } from './targeting/proximity.ts';
export { attackTargetScore, nearestAttackShapeTarget } from './targeting/score.ts';
export { attackSpecForWeapon } from './targeting/spec.ts';
export type { EntityFilter, WeaponShapeSpec } from './targeting/types.ts';
