// Shared runtime-state compatibility facade. Mutable runtime refs, frame
// collections, serializable game state, reset snapshots, and legacy accessors
// live under `runtime/state/` by responsibility.

export { runtime } from './state/runtime.ts';
export { logs, flyingArrows, magicEffects } from './state/collections.ts';
export { state, initialState, initialRegions } from './state/game-state.ts';
export {
  getAttackEffect,
  setAttackEffect,
  getBowCharge,
  setBowCharge,
  getPendingMagicCast,
  setPendingMagicCast,
  getHitStopTimer,
  setHitStopTimer,
  getAimVector,
  getAimWorld,
  getMvKeys,
  getPScene
} from './state/accessors.ts';
