// Corruption / monsterification system compatibility facade.

export {
  CORRUPTION_HIT_INTERVAL,
  CORRUPTION_MAX,
  RAMPAGE_TIME,
  RAMPAGE_WARNING_TIME,
  SHRINE_LOAD_DECAY_INTERVAL,
  SHRINE_LOAD_MAX
} from './corruption/constants.ts';
export { normalizeCorruptionState, shrineLoadKey } from './corruption/state.ts';
export { isDemonCastleSource, isMonsterSource, isStrongMonsterSource } from './corruption/sources.ts';
export { addCorruption, addCorruptionFromMonsterDeath, addCorruptionFromMonsterHit } from './corruption/gain.ts';
export { acceptMonsterFate, chooseSuppressCorruption, resumeCorruptionStateAfterLoad, useReversePotion } from './corruption/choice.ts';
export { purifyAtShrine } from './corruption/shrine.ts';
export { hasCorruptionControlLock, isCorruptionRampaging } from './corruption/rampage.ts';
export { updateCorruption } from './corruption/tick.ts';
