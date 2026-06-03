import { escapeHtml } from '../../domain/math.ts';
import { t } from '../../domain/i18n.ts';
import type { GearMod } from '../../domain/types.ts';

export function panelHeader(title: string, actionName: string): string {
  return `<div class="backpack-head"><strong>${escapeHtml(title)}</strong><span class="backpack-paused">${t("panel.paused")}</span><button type="button" class="backpack-close" data-${actionName}-action="close">${t("panel.closeEsc")}</button></div>`;
}

export function modSummary(mod: GearMod): string {
  const parts: string[] = [];
  if (mod.atk) parts.push(`攻击+${mod.atk}`);
  if (mod.def) parts.push(`防御+${mod.def}`);
  if (mod.thorns) parts.push(`反伤+${mod.thorns}`);
  if (mod.slowOnHit) parts.push(`命中减速${Math.round(mod.slowOnHit * 100)}%`);
  if (mod.slowOnBlock) parts.push(`受击减速${Math.round(mod.slowOnBlock * 100)}%`);
  if (mod.aoeSlowOnHit) parts.push(`范围减速${Math.round(mod.aoeSlowOnHit * 100)}%`);
  if (mod.repelMonsters) parts.push("普通魔物不敢靠近");
  if (mod.cooldownMult !== 1) parts.push(`攻击间隔-${Math.round((1 - mod.cooldownMult) * 100)}%`);
  return parts.join("、");
}
