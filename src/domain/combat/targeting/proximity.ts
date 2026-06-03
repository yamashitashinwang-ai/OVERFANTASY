import { state } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { dist } from '../../math.ts';
import type { ActorState, Vector2 } from '../../types.ts';
import type { EntityFilter } from './types.ts';

export function nearestEntity(range = 1.3, filter: EntityFilter = () => true): ActorState | null {
  let best: ActorState | null = null;
  let bestD = Infinity;
  for (const e of state.entities) {
    if (!e.alive || !filter(e)) continue;
    const d = dist(state.player, e);
    if (d < range && d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

export function bodyGap(a: Vector2 & { r?: number }, b: Vector2 & { r?: number }): number {
  const radiusA = (a.r || 0) / tile;
  const radiusB = (b.r || 0) / tile;
  return Math.max(0, dist(a, b) - radiusA - radiusB);
}

export function nearestAttackTarget(range: number, filter: EntityFilter = () => true): ActorState | null {
  let best: ActorState | null = null;
  let bestGap = Infinity;
  for (const e of state.entities) {
    if (!e.alive || !filter(e)) continue;
    const gap = bodyGap(state.player, e);
    if (gap <= range && gap < bestGap) {
      best = e;
      bestGap = gap;
    }
  }
  return best;
}
