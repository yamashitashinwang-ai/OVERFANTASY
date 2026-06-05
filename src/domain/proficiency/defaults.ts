import type { CareerState, ProficiencyProgress, ProficiencyState, ProficiencyTable } from '../types.ts';
import { proficiencyOrder } from './catalog.ts';

function defaultProgress(): ProficiencyProgress {
  return {
    level: 0,
    exp: 0,
    totalExp: 0,
    firstReachedAt: Number.MAX_SAFE_INTEGER
  };
}

export function createDefaultProficiencyState(): ProficiencyState {
  const records = Object.fromEntries(
    proficiencyOrder.map(id => [id, defaultProgress()])
  ) as ProficiencyTable;
  return {
    records,
    classTendency: 'sword',
    nextOrder: 0,
    claims: { hits: {}, defeats: {} },
    survivalAwardedAt: null,
    career: createDefaultCareerState()
  };
}

export function createDefaultCareerState(): CareerState {
  return {
    firstClass: null,
    firstClassConfirmed: false,
    subclass: null,
    subclassConfirmed: false
  };
}
