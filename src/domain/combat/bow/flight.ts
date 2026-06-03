import { flyingArrows, state } from "../../../runtime/state.ts";
import { tile } from "../../../runtime/constants.ts";
import { segmentPointDistance } from "../../math.ts";
import { attackEntityFilter } from "../targeting.ts";
import { addArrowPickup } from "../arrows.ts";
import type { ActorState } from "../../types.ts";
import { resolveArrowHit } from "./hits.ts";

export function updateFlyingArrows(dt: number) {
  for (let i = flyingArrows.length - 1; i >= 0; i -= 1) {
    const arrow = flyingArrows[i];
    const oldX = arrow.x;
    const oldY = arrow.y;
    const step = Math.min(arrow.speed * dt, arrow.range - arrow.traveled);
    arrow.x += Math.cos(arrow.angle) * step;
    arrow.y += Math.sin(arrow.angle) * step;
    arrow.traveled += step;
    let hit: ActorState | null = null;
    let best = Infinity;
    for (const e of state.entities) {
      if (!e.alive || !attackEntityFilter(e)) continue;
      const threshold = (e.r || 8) / tile + 0.08;
      const d = segmentPointDistance(oldX, oldY, arrow.x, arrow.y, e.x, e.y);
      if (d <= threshold && d < best) {
        hit = e;
        best = d;
      }
    }
    if (hit) {
      resolveArrowHit(arrow, hit);
      flyingArrows.splice(i, 1);
      continue;
    }
    if (arrow.traveled >= arrow.range - 0.001) {
      addArrowPickup(arrow.endX, arrow.endY);
      flyingArrows.splice(i, 1);
    }
  }
}
