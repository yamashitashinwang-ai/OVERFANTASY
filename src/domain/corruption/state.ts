import { state } from '../../runtime/state.ts';
import { clamp } from '../math.ts';
import type { WorldObjectState } from '../types.ts';
import { CORRUPTION_MAX } from './constants.ts';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeCorruptionState() {
  const p = state.player;
  p.corruption = clamp(Number(p.corruption || 0), 0, CORRUPTION_MAX);
  p.corruptionHitCooldown = Math.max(0, Number(p.corruptionHitCooldown || 0));
  if (!isPlainRecord(p.corruptionStageWarnings)) p.corruptionStageWarnings = {};
  p.corruptionChoicePending = !!p.corruptionChoicePending;
  p.corruptionRampageWarningTimer = Math.max(0, Number(p.corruptionRampageWarningTimer || 0));
  p.corruptionRampageTimer = Math.max(0, Number(p.corruptionRampageTimer || 0));
  p.corruptionRampageAttackCooldown = Math.max(0, Number(p.corruptionRampageAttackCooldown || 0));
  p.reversePotions = Math.max(0, Math.floor(Number(p.reversePotions || 0)));
  if (p.originalRace === undefined) p.originalRace = null;
  if (!isPlainRecord(state.shrineLoads)) state.shrineLoads = {};
  state.shrineLoadDecayClock = Math.max(0, Number(state.shrineLoadDecayClock || 0));
}

export function shrineLoadKey(obj: WorldObjectState): string {
  return `${state.scene}:${obj.name}:${obj.x}:${obj.y}`;
}
