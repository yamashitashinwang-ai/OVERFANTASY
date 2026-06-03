import { bus, Events } from "../../runtime/events.ts";

let lastDamageT = 0;
let lastDealtT = 0;
let aiTickT = 0;
let aiTickCount = 0;

bus.on(Events.PLAYER_HURT, () => { lastDamageT = performance.now(); });
bus.on(Events.ENTITY_DEFEATED, () => { lastDealtT = performance.now(); });
bus.on(Events.ENTITY_HIT, () => { lastDealtT = performance.now(); });

export function lastDamageTime() {
  return lastDamageT;
}

export function lastDealtTime() {
  return lastDealtT;
}

export function tickDebugFps(now: number): number | null {
  aiTickCount += 1;
  if (now - aiTickT <= 1000) return null;
  const fps = aiTickCount;
  aiTickCount = 0;
  aiTickT = now;
  return fps;
}
