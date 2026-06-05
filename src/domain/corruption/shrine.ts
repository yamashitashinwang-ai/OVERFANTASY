import { state } from '../../runtime/state.ts';
import { log, toast } from '../../runtime/services.ts';
import { clamp } from '../math.ts';
import { tryAwardSurvivalProficiency } from '../proficiency.ts';
import type { WorldObjectState } from '../types.ts';
import { CORRUPTION_MAX, SHRINE_LOAD_DECAY_INTERVAL, SHRINE_LOAD_MAX } from './constants.ts';
import { normalizeCorruptionState, shrineLoadKey } from './state.ts';

export function purifyAtShrine(obj: WorldObjectState): boolean {
  normalizeCorruptionState();
  const key = shrineLoadKey(obj);
  const load = clamp(Number(state.shrineLoads[key] || 0), 0, SHRINE_LOAD_MAX);
  const remaining = Math.max(0, SHRINE_LOAD_MAX - load);
  const current = Math.floor(state.player.corruption || 0);
  log(`玩家当前魔化值：${current}。当前祠堂负荷：${Math.floor(load)}/${SHRINE_LOAD_MAX}。`);
  if (current <= 0) {
    if (state.player.monsterForm) {
      toast('普通祠堂无法逆转魔物化。');
      return false;
    }
    if ((state.player.deathFatigue || 0) > 0) return false;
    toast('你的精神从来没有这么好过，也不需要净化。');
    return false;
  }
  if (remaining <= 0) {
    toast('战士的伤痕让神明也不堪重负，一会再来吧。');
    return false;
  }
  const transfer = Math.min(current, remaining);
  state.player.corruption = clamp(current - transfer, 0, CORRUPTION_MAX);
  state.shrineLoads[key] = clamp(load + transfer, 0, SHRINE_LOAD_MAX);
  if (transfer > 0) tryAwardSurvivalProficiency();
  log(`${obj.name || '祠堂'}净化了${Math.floor(transfer)}点魔化值。当前祠堂负荷：${Math.floor(state.shrineLoads[key])}/${SHRINE_LOAD_MAX}。`);
  return true;
}

export function decayShrineLoads(dt: number) {
  state.shrineLoadDecayClock += dt;
  while (state.shrineLoadDecayClock >= SHRINE_LOAD_DECAY_INTERVAL) {
    state.shrineLoadDecayClock -= SHRINE_LOAD_DECAY_INTERVAL;
    for (const [key, value] of Object.entries(state.shrineLoads)) {
      const next = Math.max(0, Number(value || 0) - 1);
      if (next <= 0) delete state.shrineLoads[key];
      else state.shrineLoads[key] = next;
    }
  }
}
