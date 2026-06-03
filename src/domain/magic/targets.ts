import { state, getAimWorld } from '../../runtime/state.ts';
import { currentPetScene } from '../world.ts';
import type { ActorState, PetState, Vector2 } from '../types.ts';

export function magicTargetFilter(e: ActorState): boolean {
  if (!e.alive) return false;
  if (state.player.monsterForm) return e.faction !== "monster" && e.kind !== "animal";
  return e.faction === "monster";
}

export function hostileToPlayer(e: ActorState | null | undefined): boolean {
  return !!e?.alive && magicTargetFilter(e);
}

export function playerHasEnemyAggro() {
  return state.entities.some(e => hostileToPlayer(e) && (e.playerAggro || 0) > 0.01);
}

export function magicCastPoint(maxRange = 12.5) {
  const p = state.player;
  const aimWorld = getAimWorld();
  const raw = aimWorld || { x: p.x + maxRange, y: p.y };
  const dx = raw.x - p.x;
  const dy = raw.y - p.y;
  const d = Math.hypot(dx, dy);
  if (d <= maxRange) return { x: raw.x, y: raw.y };
  return { x: p.x + (dx / d) * maxRange, y: p.y + (dy / d) * maxRange };
}

export function closestEnemyAtPoint(point: Vector2, radius: number): ActorState | null {
  let best: ActorState | null = null;
  let bestD = Infinity;
  for (const e of state.entities) {
    if (!magicTargetFilter(e)) continue;
    const d = Math.hypot(e.x - point.x, e.y - point.y);
    if (d <= radius && d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

export function friendlyAtPoint(point: Vector2, radius: number): PetState | ActorState | null {
  const pets = state.pets
    .filter(pet => !pet.lost && !pet.injured && pet.alive && currentPetScene() === (pet.scene || currentPetScene()))
    .map(pet => ({ target: pet, d: Math.hypot(pet.x - point.x, pet.y - point.y) }))
    .filter(item => item.d <= radius)
    .sort((a, b) => a.d - b.d);
  if (pets[0]) return pets[0].target;
  const npc = state.entities
    .filter(e => e.alive && (e.kind === "npc" || e.kind === "friendly"))
    .map(e => ({ target: e, d: Math.hypot(e.x - point.x, e.y - point.y) }))
    .filter(item => item.d <= radius)
    .sort((a, b) => a.d - b.d)[0];
  return npc?.target || null;
}
