import { state } from '../../runtime/state.ts';
import { log, toast } from '../../runtime/services.ts';
import { clamp, rand } from '../math.ts';
import type { ActorState } from '../types.ts';
import { CORRUPTION_HIT_INTERVAL, CORRUPTION_MAX } from './constants.ts';
import { showCorruptionChoice } from './choice.ts';
import { normalizeCorruptionState } from './state.ts';
import { isMonsterSource, isStrongMonsterSource } from './sources.ts';

function showStageWarnings(previous: number, next: number) {
  const warnings = state.player.corruptionStageWarnings;
  const stages = [
    [30, '你感知到了危险的气息。'],
    [50, '你警觉地四周望去，但并没有发现魔王的踪迹。'],
    [90, '你感受到了召唤，它来自血脉，来自灵魂。']
  ] as const;
  for (const [stage, message] of stages) {
    const key = String(stage);
    if (previous < stage && next >= stage && !warnings[key]) {
      warnings[key] = true;
      log(message);
      toast(message, 5000);
    }
  }
}

export function addCorruption(amount: number, bypassHitInterval = false): number {
  normalizeCorruptionState();
  if (amount <= 0) return 0;
  if (!bypassHitInterval) {
    if (state.player.corruptionHitCooldown > 0) return 0;
    state.player.corruptionHitCooldown = CORRUPTION_HIT_INTERVAL;
  }
  const previous = state.player.corruption;
  const next = clamp(previous + amount, 0, CORRUPTION_MAX);
  state.player.corruption = next;
  const gained = next - previous;
  if (gained <= 0) return 0;
  showStageWarnings(previous, next);
  if (next >= CORRUPTION_MAX) showCorruptionChoice();
  return gained;
}

export function addCorruptionFromMonsterHit(source: ActorState | null | undefined): number {
  if (!isMonsterSource(source) || state.player.monsterForm) return 0;
  return addCorruption(isStrongMonsterSource(source) ? Math.floor(rand(4, 7)) : Math.floor(rand(1, 4)), false);
}

export function addCorruptionFromMonsterDeath(source: ActorState | null | undefined): number {
  if (!isMonsterSource(source) || state.player.monsterForm) return 0;
  return addCorruption(isStrongMonsterSource(source) ? 60 : 40, true);
}
