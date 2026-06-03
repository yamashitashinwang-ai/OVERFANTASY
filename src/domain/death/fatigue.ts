import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { clamp } from '../math.ts';
import { refreshCombatStats } from '../combat/weapon.ts';
import { normalizeLostPackages } from '../lost-packages.ts';

export const FATIGUE_MAX = 3;
export const FATIGUE_RELIEF_INTERVAL = 300;

export function normalizeDeathState() {
  const p = state.player;
  if (!p.baseMaxHp) p.baseMaxHp = Math.max(1, p.maxHp || 42);
  if (!p.baseMaxMp) p.baseMaxMp = Math.max(1, p.maxMp || 18);
  p.deathFatigue = clamp(Math.floor(Number(p.deathFatigue || 0)), 0, FATIGUE_MAX);
  p.deathFatigueReliefCooldown = Math.max(0, Number(p.deathFatigueReliefCooldown || 0));
  if (!Array.isArray(state.lostPackages)) state.lostPackages = [];
  if (state.lastDeath === undefined) state.lastDeath = null;
  if (state.pendingDeathRespawn === undefined) state.pendingDeathRespawn = null;
  normalizeLostPackages();
  applyDeathFatigueStats();
}

export function applyDeathFatigueStats() {
  const p = state.player;
  const layers = clamp(Math.floor(Number(p.deathFatigue || 0)), 0, FATIGUE_MAX);
  const hpBase = Math.max(1, Number(p.baseMaxHp || p.maxHp || 42));
  const mpBase = Math.max(1, Number(p.baseMaxMp || p.maxMp || 18));
  const multiplier = Math.max(0.1, 1 - layers * 0.1);
  p.maxHp = Math.max(1, Math.ceil(hpBase * multiplier));
  p.maxMp = Math.max(1, Math.ceil(mpBase * multiplier));
  p.hp = Math.min(p.hp, p.maxHp);
  p.mp = Math.min(p.mp, p.maxMp);
  refreshCombatStats();
}

export function deathFatigueStaminaRegenMultiplier(): number {
  normalizeDeathState();
  return Math.max(0.1, 1 - (state.player.deathFatigue || 0) * 0.1);
}

export function updateDeathSystem(dt: number) {
  normalizeDeathState();
  state.player.deathFatigueReliefCooldown = Math.max(0, (state.player.deathFatigueReliefCooldown || 0) - dt);
}

export function relieveDeathFatigue(method: 'rest' | 'shrine'): boolean {
  normalizeDeathState();
  if ((state.player.deathFatigue || 0) <= 0) return false;
  if ((state.player.deathFatigueReliefCooldown || 0) > 0) {
    log(`死亡疲劳还没有松动。还需要${Math.ceil(state.player.deathFatigueReliefCooldown / 60)}分钟。`);
    return false;
  }
  state.player.deathFatigue = Math.max(0, state.player.deathFatigue - 1);
  state.player.deathFatigueReliefCooldown = FATIGUE_RELIEF_INTERVAL;
  applyDeathFatigueStats();
  log(method === 'rest' ? '休息驱散了一层死亡疲劳。' : '祠堂净化驱散了一层死亡疲劳。');
  return true;
}
