import { bus, Events } from '../../runtime/events.ts';
import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import type { ActorState, ProficiencyId, ProficiencyState } from '../types.ts';
import { proficiencyCatalog, proficiencyOrder, raceCanDoubleProficiency } from './catalog.ts';
import { applyClassTendency, ensureProficiencyState, proficiencyExpToNextLevel, PROFICIENCY_LEVEL_CAP } from './state.ts';

const MAX_CLAIMS_PER_PROFICIENCY = 512;
const SURVIVAL_REWARD_INTERVAL = 90;
const SURVIVAL_DEATH_REWARD_INTERVAL = 180;

export interface ProficiencyAwardResult {
  id: ProficiencyId;
  added: number;
  levelBefore: number;
  levelAfter: number;
  doubled: boolean;
}

function claimBucket(proficiency: ProficiencyState, group: 'hits' | 'defeats', id: ProficiencyId): string[] {
  const bucket = proficiency.claims[group][id] || [];
  proficiency.claims[group][id] = bucket;
  return bucket;
}

function entityClaimKey(entity: ActorState): string {
  return String(entity.id || `${entity.kind || 'entity'}:${entity.name || '?'}:${Math.round(entity.x * 100)}:${Math.round(entity.y * 100)}`);
}

function markClaim(group: 'hits' | 'defeats', id: ProficiencyId, entity: ActorState): boolean {
  const proficiency = ensureProficiencyState();
  const key = entityClaimKey(entity);
  const bucket = claimBucket(proficiency, group, id);
  if (bucket.includes(key)) return false;
  bucket.push(key);
  if (bucket.length > MAX_CLAIMS_PER_PROFICIENCY) bucket.splice(0, bucket.length - MAX_CLAIMS_PER_PROFICIENCY);
  return true;
}

export function awardProficiency(id: ProficiencyId, amount: number): ProficiencyAwardResult {
  const proficiency = ensureProficiencyState();
  const record = proficiency.records[id];
  const levelBefore = record.level;
  let added = Math.max(0, Math.floor(Number(amount) || 0));
  let doubled = false;
  if (added > 0 && raceCanDoubleProficiency(state.player.race, id) && Math.random() < 0.02) {
    added *= 2;
    doubled = true;
  }
  if (added <= 0 || record.level >= PROFICIENCY_LEVEL_CAP) {
    return { id, added: 0, levelBefore, levelAfter: record.level, doubled: false };
  }
  if (record.totalExp <= 0) {
    record.firstReachedAt = proficiency.nextOrder;
    proficiency.nextOrder += 1;
  }
  record.exp += added;
  record.totalExp += added;

  while (record.level < PROFICIENCY_LEVEL_CAP) {
    const required = proficiencyExpToNextLevel(record.level);
    if (record.exp < required) break;
    record.exp -= required;
    record.level += 1;
  }
  if (record.level >= PROFICIENCY_LEVEL_CAP) record.exp = 0;

  applyClassTendency(state.player, proficiency);
  const levelAfter = record.level;
  if (levelAfter > levelBefore) {
    log(`${proficiencyCatalog[id].label}熟练度提升到了 ${levelAfter}。`);
    bus.emit(Events.PROFICIENCY_LEVEL_UP, { id, level: levelAfter });
  }
  bus.emit(Events.PROFICIENCY_CHANGED, { id, added, levelBefore, levelAfter, doubled });
  bus.emit(Events.PLAYER_STATS);
  return { id, added, levelBefore, levelAfter, doubled };
}

export function awardWeaponHitProficiency(id: ProficiencyId | null, entity: ActorState): ProficiencyAwardResult | null {
  if (!id || !proficiencyOrder.includes(id)) return null;
  if (!markClaim('hits', id, entity)) return null;
  return awardProficiency(id, 1);
}

export function awardWeaponDefeatProficiency(id: ProficiencyId | null, entity: ActorState): ProficiencyAwardResult | null {
  if (!id || !proficiencyOrder.includes(id)) return null;
  if (!markClaim('defeats', id, entity)) return null;
  return awardProficiency(id, 3);
}

export function awardMagicEffectiveProficiency(): ProficiencyAwardResult {
  return awardProficiency('magic', 1);
}

export function awardForgingProficiency(): ProficiencyAwardResult {
  return awardProficiency('forging', 1);
}

export function awardGatheringProficiency(): ProficiencyAwardResult {
  return awardProficiency('gathering', 1);
}

export function tryAwardSurvivalProficiency(amount = 1, interval = SURVIVAL_REWARD_INTERVAL): ProficiencyAwardResult | null {
  const proficiency = ensureProficiencyState();
  const now = Math.max(0, Number(state.time || 0));
  if (proficiency.survivalAwardedAt != null && now - proficiency.survivalAwardedAt < interval) return null;
  proficiency.survivalAwardedAt = now;
  return awardProficiency('survival', amount);
}

export function awardDeathSurvivalProficiency(): ProficiencyAwardResult | null {
  return tryAwardSurvivalProficiency(2, SURVIVAL_DEATH_REWARD_INTERVAL);
}
