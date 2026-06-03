import { state } from '../../runtime/state.ts';
import type { Vector2, WorldObjectState } from '../types.ts';

export function objectEdgeDistance(o: WorldObjectState, actor: Vector2 = state.player): number {
  const dx = Math.max(o.x - actor.x, 0, actor.x - (o.x + o.w));
  const dy = Math.max(o.y - actor.y, 0, actor.y - (o.y + o.h));
  return Math.hypot(dx, dy);
}

export function nearestObject(range = 1.4) {
  let best: WorldObjectState | null = null;
  let bestD = Infinity;
  for (const o of state.objects) {
    if ((o.environment || o.visualOnly) && !o.action) continue;
    const edgeDistance = objectEdgeDistance(o);
    if (edgeDistance < range && edgeDistance < bestD) {
      best = o;
      bestD = edgeDistance;
    }
  }
  return best;
}

export function isNearAction(action: string, range = 2.3): boolean {
  return state.objects.some(obj => obj.action === action && objectEdgeDistance(obj) < range);
}
