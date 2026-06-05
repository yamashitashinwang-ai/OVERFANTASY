import { bus, Events } from '../../runtime/events.ts';
import { state } from '../../runtime/state.ts';
import { toast } from '../../runtime/services.ts';
import type { CareerState, CareerSubclassId, PlayerState, ProficiencyId } from '../types.ts';
import { proficiencyCatalog, proficiencyOrder } from './catalog.ts';
import { ensureProficiencyState } from './state.ts';
export {
  FIRST_CLASS_REQUIRED_LEVEL,
  SUBCLASS_MAJOR_LEVEL,
  SUBCLASS_MINOR_LEVEL,
  canUnlockSubclass,
  normalizeCareerState,
  orderedProficiencyPair,
  subclassCatalog,
  subclassIdFor,
  subclassOrder
} from './career-model.ts';
import {
  FIRST_CLASS_REQUIRED_LEVEL,
  canUnlockSubclass,
  subclassCatalog,
  subclassIdFor
} from './career-model.ts';

export interface FirstClassCandidate {
  id: ProficiencyId;
  label: string;
  proficiencyLabel: string;
  level: number;
  eligible: boolean;
  selected: boolean;
  conditionText: string;
}

export interface SubclassCandidate {
  id: CareerSubclassId;
  label: string;
  proficiencies: [ProficiencyId, ProficiencyId];
  effectText: string;
  baseLevel: number;
  otherLevel: number;
  eligible: boolean;
  selected: boolean;
  conditionText: string;
}

export function careerState(player: PlayerState = state.player): CareerState {
  return ensureProficiencyState(player).career;
}

export function firstClassLabel(player: PlayerState = state.player): string {
  const career = careerState(player);
  return career.firstClassConfirmed && career.firstClass ? proficiencyCatalog[career.firstClass].classLabel : '未选择';
}

export function subclassLabel(player: PlayerState = state.player): string {
  const career = careerState(player);
  return career.subclassConfirmed && career.subclass ? subclassCatalog[career.subclass].label : '未选择';
}

export function firstClassCandidates(player: PlayerState = state.player): FirstClassCandidate[] {
  const proficiency = ensureProficiencyState(player);
  const career = proficiency.career;
  return proficiencyOrder.map(id => {
    const level = proficiency.records[id].level;
    return {
      id,
      label: proficiencyCatalog[id].classLabel,
      proficiencyLabel: proficiencyCatalog[id].label,
      level,
      eligible: level >= FIRST_CLASS_REQUIRED_LEVEL && !career.firstClassConfirmed,
      selected: career.firstClassConfirmed && career.firstClass === id,
      conditionText: `${proficiencyCatalog[id].label} Lv${FIRST_CLASS_REQUIRED_LEVEL}`
    };
  });
}

export function hasFirstClassChoice(player: PlayerState = state.player): boolean {
  return firstClassCandidates(player).some(candidate => candidate.eligible);
}

export function subclassCandidates(player: PlayerState = state.player): SubclassCandidate[] {
  const proficiency = ensureProficiencyState(player);
  const career = proficiency.career;
  if (!career.firstClassConfirmed || !career.firstClass) return [];
  const base = career.firstClass;
  const baseLevel = proficiency.records[base].level;
  return proficiencyOrder
    .filter(id => id !== base)
    .map(other => {
      const entry = subclassCatalog[subclassIdFor(base, other)];
      const otherLevel = proficiency.records[other].level;
      return {
        ...entry,
        baseLevel,
        otherLevel,
        eligible: canUnlockSubclass(baseLevel, otherLevel) && !career.subclassConfirmed,
        selected: career.subclassConfirmed && career.subclass === entry.id,
        conditionText: `${proficiencyCatalog[base].label} Lv30 + ${proficiencyCatalog[other].label} Lv5，或 ${proficiencyCatalog[base].label} Lv5 + ${proficiencyCatalog[other].label} Lv30`
      };
    });
}

export function selectFirstClass(id: ProficiencyId, player: PlayerState = state.player): boolean {
  const candidate = firstClassCandidates(player).find(item => item.id === id);
  if (!candidate?.eligible) return false;
  const proficiency = ensureProficiencyState(player);
  const career = proficiency.career;
  if (career.firstClassConfirmed) return false;
  career.firstClass = id;
  career.firstClassConfirmed = true;
  bus.emit(Events.CAREER_CHANGED, { firstClass: id, subclass: career.subclass });
  bus.emit(Events.PLAYER_STATS);
  toast(`第一职业已确认：${candidate.label}。`);
  return true;
}

export function selectSubclass(id: CareerSubclassId, player: PlayerState = state.player): boolean {
  const candidate = subclassCandidates(player).find(item => item.id === id);
  if (!candidate?.eligible) return false;
  const proficiency = ensureProficiencyState(player);
  const career = proficiency.career;
  if (!career.firstClassConfirmed || career.subclassConfirmed) return false;
  career.subclass = id;
  career.subclassConfirmed = true;
  bus.emit(Events.CAREER_CHANGED, { firstClass: career.firstClass, subclass: id });
  bus.emit(Events.PLAYER_STATS);
  toast(`细分职业已确认：${candidate.label}。`);
  return true;
}
