import type { GearCatalogItem, ProficiencyId } from '../types.ts';
import { proficiencyForWeapon } from './catalog.ts';
import { proficiencyLevel } from './state.ts';

export function proficiencyDamageMultiplier(id: ProficiencyId | null): number {
  if (!id) return 1;
  return 1 + proficiencyLevel(id) * 0.005;
}

export function weaponProficiencyDamageMultiplier(weapon: Pick<GearCatalogItem, 'type'> | null | undefined): number {
  return proficiencyDamageMultiplier(proficiencyForWeapon(weapon));
}

export function magicProficiencyDamageMultiplier(): number {
  return proficiencyDamageMultiplier('magic');
}

export function forgeSuccessBonusChance(): number {
  return proficiencyLevel('forging') * 0.002;
}

export function gatheringExtraResourceChance(): number {
  return proficiencyLevel('gathering') * 0.002;
}

export function survivalRecoveryMultiplier(): number {
  return 1 + proficiencyLevel('survival') * 0.002;
}
