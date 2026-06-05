// Proficiency compatibility facade. The MVP keeps progression data-driven and
// separate from combat, crafting, gathering, and persistence callers.

export { proficiencyCatalog, proficiencyOrder, proficiencyForWeapon } from './proficiency/catalog.ts';
export { createDefaultProficiencyState } from './proficiency/defaults.ts';
export {
  FIRST_CLASS_REQUIRED_LEVEL,
  SUBCLASS_MAJOR_LEVEL,
  SUBCLASS_MINOR_LEVEL,
  subclassCatalog,
  subclassOrder,
  orderedProficiencyPair,
  subclassIdFor,
  normalizeCareerState,
  careerState,
  firstClassLabel,
  subclassLabel,
  firstClassCandidates,
  hasFirstClassChoice,
  canUnlockSubclass,
  subclassCandidates,
  selectFirstClass,
  selectSubclass
} from './proficiency/career.ts';
export {
  ensureProficiencyState,
  proficiencyExpToNextLevel,
  proficiencyLevel,
  proficiencyRecord,
  classTendencyLabel,
  PROFICIENCY_LEVEL_CAP
} from './proficiency/state.ts';
export {
  awardProficiency,
  awardWeaponHitProficiency,
  awardWeaponDefeatProficiency,
  awardMagicEffectiveProficiency,
  awardForgingProficiency,
  awardGatheringProficiency,
  tryAwardSurvivalProficiency,
  awardDeathSurvivalProficiency
} from './proficiency/award.ts';
export {
  proficiencyDamageMultiplier,
  weaponProficiencyDamageMultiplier,
  magicProficiencyDamageMultiplier,
  forgeSuccessBonusChance,
  gatheringExtraResourceChance,
  survivalRecoveryMultiplier
} from './proficiency/bonuses.ts';
export { proficiencyStatRows } from './proficiency/ui.ts';
