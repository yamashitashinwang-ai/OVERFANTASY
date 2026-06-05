import type { ProficiencyId } from '../types.ts';
import { proficiencyCatalog, proficiencyOrder } from './catalog.ts';
import { gatheringExtraResourceChance, forgeSuccessBonusChance, proficiencyDamageMultiplier, survivalRecoveryMultiplier } from './bonuses.ts';
import { classTendencyLabel, ensureProficiencyState, proficiencyExpToNextLevel } from './state.ts';

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function bonusText(id: ProficiencyId): string {
  if (id === 'forging') return `成功率+${percent(forgeSuccessBonusChance())}`;
  if (id === 'gathering') return `额外+${percent(gatheringExtraResourceChance())}`;
  if (id === 'survival') return `恢复+${percent(survivalRecoveryMultiplier() - 1)}`;
  return `伤害+${percent(proficiencyDamageMultiplier(id) - 1)}`;
}

export function proficiencyStatRows(): [string, string][] {
  const proficiency = ensureProficiencyState();
  const rows: [string, string][] = [['职业倾向', classTendencyLabel()]];
  for (const id of proficiencyOrder) {
    const record = proficiency.records[id];
    const progress = record.level >= 30 ? 'MAX' : `${record.exp}/${proficiencyExpToNextLevel(record.level)}`;
    rows.push([
      `熟练度·${proficiencyCatalog[id].label}`,
      `Lv${record.level} ${progress} ${bonusText(id)}`
    ]);
  }
  return rows;
}
