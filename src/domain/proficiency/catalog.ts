import type { GearCatalogItem, ProficiencyId } from '../types.ts';

export interface ProficiencyCatalogEntry {
  id: ProficiencyId;
  label: string;
  classLabel: string;
  bonusLabel: string;
}

export const proficiencyOrder: ProficiencyId[] = [
  'sword',
  'dagger',
  'spear',
  'hammer',
  'bow',
  'magic',
  'forging',
  'gathering',
  'survival'
];

export const proficiencyCatalog: Record<ProficiencyId, ProficiencyCatalogEntry> = {
  sword: { id: 'sword', label: '剑术', classLabel: '剑士', bonusLabel: '伤害' },
  dagger: { id: 'dagger', label: '匕首', classLabel: '斥候', bonusLabel: '伤害' },
  spear: { id: 'spear', label: '枪术', classLabel: '枪兵', bonusLabel: '伤害' },
  hammer: { id: 'hammer', label: '锤术', classLabel: '战士', bonusLabel: '伤害' },
  bow: { id: 'bow', label: '弓术', classLabel: '游侠', bonusLabel: '伤害' },
  magic: { id: 'magic', label: '魔法', classLabel: '术士', bonusLabel: '伤害' },
  forging: { id: 'forging', label: '锻造', classLabel: '工匠', bonusLabel: '成功率' },
  gathering: { id: 'gathering', label: '采集', classLabel: '收藏家', bonusLabel: '额外资源' },
  survival: { id: 'survival', label: '生存', classLabel: '浪人', bonusLabel: '恢复效果' }
};

export function proficiencyForWeapon(weapon: Pick<GearCatalogItem, 'type'> | null | undefined): ProficiencyId | null {
  const type = weapon?.type || '';
  if (type.includes('剑')) return 'sword';
  if (type === '匕首') return 'dagger';
  if (type.includes('枪')) return 'spear';
  if (type === '锤') return 'hammer';
  if (type === '弓') return 'bow';
  return null;
}

export function raceCanDoubleProficiency(race: string | null | undefined, id: ProficiencyId): boolean {
  if (race === '精灵') return id === 'bow' || id === 'magic';
  if (race === '矮人') return id === 'hammer' || id === 'spear';
  if (race === '人类') return id === 'sword' || id === 'dagger';
  return false;
}
