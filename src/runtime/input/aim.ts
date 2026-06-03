import { normalize as mathNormalize } from '../../domain/math.ts';
import type { Vector2 } from '../../domain/types.ts';
import { state, runtime } from '../state.ts';

export function playerAimAngle(): number {
  if (runtime.aimWorld) {
    const dx = runtime.aimWorld.x - state.player.x;
    const dy = runtime.aimWorld.y - state.player.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.02) runtime.aimVector = { x: dx / len, y: dy / len };
  }
  return Math.atan2(runtime.aimVector.y, runtime.aimVector.x);
}

export function normalizeWithAim(dx: number, dy: number): Vector2 {
  return mathNormalize(dx, dy, runtime.aimVector);
}
