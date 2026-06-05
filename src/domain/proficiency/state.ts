import { state } from '../../runtime/state.ts';
import { clamp, clonePlain } from '../math.ts';
import type { PlayerState, ProficiencyId, ProficiencyProgress, ProficiencyState } from '../types.ts';
import { proficiencyCatalog, proficiencyOrder } from './catalog.ts';
import { createDefaultProficiencyState } from './defaults.ts';
import { normalizeCareerState } from './career-model.ts';

export const PROFICIENCY_LEVEL_CAP = 30;
export const PROFICIENCY_BASE_EXP = 150;

export function proficiencyExpToNextLevel(level: number): number {
  const safeLevel = clamp(Math.floor(Number(level) || 0), 0, PROFICIENCY_LEVEL_CAP);
  let required = PROFICIENCY_BASE_EXP;
  for (let current = 0; current < safeLevel; current += 1) {
    required = Math.floor(required * 1.1);
  }
  return required;
}

function cumulativeExpForLevel(level: number): number {
  let total = 0;
  for (let current = 0; current < level; current += 1) total += proficiencyExpToNextLevel(current);
  return total;
}

function normalizeProgress(value: Partial<ProficiencyProgress> | null | undefined, fallbackOrder: number): ProficiencyProgress {
  const level = clamp(Math.floor(Number(value?.level || 0)), 0, PROFICIENCY_LEVEL_CAP);
  const exp = level >= PROFICIENCY_LEVEL_CAP
    ? 0
    : clamp(Math.floor(Number(value?.exp || 0)), 0, proficiencyExpToNextLevel(level) - 1);
  const derivedTotal = cumulativeExpForLevel(level) + exp;
  const totalExp = Math.max(derivedTotal, Math.floor(Number(value?.totalExp ?? derivedTotal) || 0));
  const firstReachedAt = Number.isFinite(Number(value?.firstReachedAt)) ? Number(value?.firstReachedAt) : fallbackOrder;
  return { level, exp, totalExp, firstReachedAt };
}

function compactClaimList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => String(item)).filter(Boolean))].slice(-512);
}

export function classTendencyForProficiency(proficiency: ProficiencyState): ProficiencyId {
  return proficiencyOrder.reduce((best, id) => {
    const bestRecord = proficiency.records[best];
    const record = proficiency.records[id];
    if (record.totalExp > bestRecord.totalExp) return id;
    if (record.totalExp < bestRecord.totalExp) return best;
    if (record.totalExp <= 0) return best;
    return record.firstReachedAt < bestRecord.firstReachedAt ? id : best;
  }, proficiencyOrder[0]);
}

export function applyClassTendency(player: PlayerState, proficiency = player.proficiency): ProficiencyId {
  const tendency = classTendencyForProficiency(proficiency);
  proficiency.classTendency = tendency;
  player.job = proficiencyCatalog[tendency].classLabel;
  return tendency;
}

export function ensureProficiencyState(player: PlayerState = state.player): ProficiencyState {
  const defaults = createDefaultProficiencyState();
  const existing = player.proficiency as Partial<ProficiencyState> | undefined;
  const records = clonePlain(defaults.records);
  for (const [index, id] of proficiencyOrder.entries()) {
    records[id] = normalizeProgress(existing?.records?.[id], index);
  }
  const claims = {
    hits: {} as ProficiencyState['claims']['hits'],
    defeats: {} as ProficiencyState['claims']['defeats']
  };
  for (const id of proficiencyOrder) {
    claims.hits[id] = compactClaimList(existing?.claims?.hits?.[id]);
    claims.defeats[id] = compactClaimList(existing?.claims?.defeats?.[id]);
  }
  const nextOrder = Math.max(
    0,
    Math.floor(Number(existing?.nextOrder || 0)),
    ...proficiencyOrder
      .filter(id => records[id].firstReachedAt < Number.MAX_SAFE_INTEGER)
      .map(id => Math.floor(Number(records[id].firstReachedAt || 0)) + 1)
  );
  const survivalAwardedAt = existing?.survivalAwardedAt == null
    ? null
    : Math.max(0, Number(existing.survivalAwardedAt) || 0);
  player.proficiency = {
    records,
    classTendency: proficiencyOrder.includes(existing?.classTendency as ProficiencyId)
      ? existing?.classTendency as ProficiencyId
      : defaults.classTendency,
    nextOrder,
    claims,
    survivalAwardedAt,
    career: normalizeCareerState(existing?.career)
  };
  applyClassTendency(player, player.proficiency);
  return player.proficiency;
}

export function proficiencyRecord(id: ProficiencyId, player: PlayerState = state.player): ProficiencyProgress {
  return ensureProficiencyState(player).records[id];
}

export function proficiencyLevel(id: ProficiencyId, player: PlayerState = state.player): number {
  return proficiencyRecord(id, player).level;
}

export function classTendencyLabel(player: PlayerState = state.player): string {
  const proficiency = ensureProficiencyState(player);
  return proficiencyCatalog[proficiency.classTendency].classLabel;
}
