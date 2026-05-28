import { rand } from '../math.ts';
import { addPickup } from '../world.ts';

interface ArrowCarrier {
  arrowHits?: number;
  x: number;
  y: number;
}

export function addArrowPickup(x: number, y: number) {
  addPickup("arrow", "箭", x, y, "#dbe4ea");
}

export function dropEmbeddedArrows(e: ArrowCarrier) {
  const count = Math.floor(e.arrowHits || 0);
  if (count <= 0) return;
  for (let i = 0; i < count; i += 1) {
    addArrowPickup(e.x + rand(-0.35, 0.35), e.y + rand(-0.35, 0.35));
  }
  e.arrowHits = 0;
}
