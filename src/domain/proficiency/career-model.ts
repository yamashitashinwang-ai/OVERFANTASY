import type { CareerState, CareerSubclassId, ProficiencyId } from '../types.ts';
import { proficiencyOrder } from './catalog.ts';
import { createDefaultCareerState } from './defaults.ts';

export const FIRST_CLASS_REQUIRED_LEVEL = 5;
export const SUBCLASS_MAJOR_LEVEL = 30;
export const SUBCLASS_MINOR_LEVEL = 5;

export interface CareerSubclassCatalogEntry {
  id: CareerSubclassId;
  label: string;
  proficiencies: [ProficiencyId, ProficiencyId];
  effectText: string;
}

function subclassEntry(a: ProficiencyId, b: ProficiencyId, label: string): CareerSubclassCatalogEntry {
  const proficiencies = orderedProficiencyPair(a, b);
  return {
    id: subclassIdFor(proficiencies[0], proficiencies[1]),
    label,
    proficiencies,
    effectText: '职业效果暂未开放'
  };
}

export function orderedProficiencyPair(a: ProficiencyId, b: ProficiencyId): [ProficiencyId, ProficiencyId] {
  return proficiencyOrder.indexOf(a) <= proficiencyOrder.indexOf(b) ? [a, b] : [b, a];
}

export function subclassIdFor(a: ProficiencyId, b: ProficiencyId): CareerSubclassId {
  const pair = orderedProficiencyPair(a, b);
  return `${pair[0]}+${pair[1]}`;
}

export const subclassCatalog: Record<CareerSubclassId, CareerSubclassCatalogEntry> = Object.fromEntries([
  subclassEntry('sword', 'dagger', '影武士'),
  subclassEntry('sword', 'spear', '近卫'),
  subclassEntry('sword', 'hammer', '强攻手'),
  subclassEntry('sword', 'bow', '游斗士'),
  subclassEntry('sword', 'magic', '魔剑士'),
  subclassEntry('sword', 'forging', '铸剑师'),
  subclassEntry('sword', 'gathering', '寻锋者'),
  subclassEntry('sword', 'survival', '剑仙'),

  subclassEntry('dagger', 'spear', '帝国尖锋'),
  subclassEntry('dagger', 'hammer', '破甲者'),
  subclassEntry('dagger', 'bow', '猎人'),
  subclassEntry('dagger', 'magic', '咒术刺客'),
  subclassEntry('dagger', 'forging', '地下铁匠'),
  subclassEntry('dagger', 'gathering', '盗贼'),
  subclassEntry('dagger', 'survival', '游荡者'),

  subclassEntry('spear', 'hammer', '破阵者'),
  subclassEntry('spear', 'bow', '巡境射手'),
  subclassEntry('spear', 'magic', '卫道士'),
  subclassEntry('spear', 'forging', '皇家工匠'),
  subclassEntry('spear', 'gathering', '巡野长锋'),
  subclassEntry('spear', 'survival', '边境守卫'),

  subclassEntry('hammer', 'bow', '破甲猎手'),
  subclassEntry('hammer', 'magic', '狂暴祭祀'),
  subclassEntry('hammer', 'forging', '铁魂之人'),
  subclassEntry('hammer', 'gathering', '开山者'),
  subclassEntry('hammer', 'survival', '岩上行者'),

  subclassEntry('bow', 'magic', '自然之人'),
  subclassEntry('bow', 'forging', '机关射手'),
  subclassEntry('bow', 'gathering', '巡林者'),
  subclassEntry('bow', 'survival', '荒野游侠'),

  subclassEntry('magic', 'forging', '符文工匠'),
  subclassEntry('magic', 'gathering', '灵药师'),
  subclassEntry('magic', 'survival', '隐士'),

  subclassEntry('forging', 'gathering', '矿工'),
  subclassEntry('forging', 'survival', '荒炉守卫'),

  subclassEntry('gathering', 'survival', '冒险家')
].map(entry => [entry.id, entry]));

export const subclassOrder = Object.keys(subclassCatalog) as CareerSubclassId[];

export function normalizeCareerState(value: Partial<CareerState> | null | undefined): CareerState {
  const defaults = createDefaultCareerState();
  const firstClass = proficiencyOrder.includes(value?.firstClass as ProficiencyId)
    ? value?.firstClass as ProficiencyId
    : null;
  const firstClassConfirmed = !!value?.firstClassConfirmed && !!firstClass;
  const subclass = value?.subclass && subclassCatalog[value.subclass] ? value.subclass : null;
  const subclassConfirmed = !!value?.subclassConfirmed && !!subclass;
  return {
    ...defaults,
    firstClass,
    firstClassConfirmed,
    subclass,
    subclassConfirmed
  };
}

export function canUnlockSubclass(baseLevel: number, otherLevel: number): boolean {
  return (baseLevel >= SUBCLASS_MAJOR_LEVEL && otherLevel >= SUBCLASS_MINOR_LEVEL)
    || (baseLevel >= SUBCLASS_MINOR_LEVEL && otherLevel >= SUBCLASS_MAJOR_LEVEL);
}
