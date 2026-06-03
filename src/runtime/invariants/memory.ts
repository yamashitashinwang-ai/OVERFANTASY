import { bus, Events } from '../events.ts';
import type { InvariantViolation } from './types.ts';

export const CONFIG = {
  // If a hostile monster is adjacent to the player for this many seconds while
  // playing, the player must have taken damage. Otherwise the AI -> damage chain
  // is broken.
  ADJACENT_DAMAGE_GRACE_SECONDS: 2.5
};

const violations: InvariantViolation[] = [];
const livenessClocks = new Map<string, number>();
const damageEventTimes: number[] = [];

bus.on(Events.PLAYER_HURT, () => damageEventTimes.push(performance.now()));

export function pushViolation(violation: InvariantViolation) {
  violations.push(violation);
}

export function getViolations() {
  return [...violations];
}

export function clearViolations() {
  violations.length = 0;
}

export function clearLiveness(id: string) {
  livenessClocks.delete(id);
}

export function livenessElapsed(id: string, dt: number): number {
  const elapsed = (livenessClocks.get(id) || 0) + dt;
  livenessClocks.set(id, elapsed);
  return elapsed;
}

export function setLiveness(id: string, value: number) {
  livenessClocks.set(id, value);
}

export function hasRecentDamageEvent(now = performance.now()) {
  const recentDamage = damageEventTimes.some(t => now - t < 3000);
  while (damageEventTimes.length && now - damageEventTimes[0] > 5000) damageEventTimes.shift();
  return recentDamage;
}
