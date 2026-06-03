import { clamp } from '../domain/math.ts';
import type { ActorState } from '../domain/types.ts';
import { worldH, worldW } from '../domain/world/constants.ts';
import { state } from './state.ts';

export type ActorMover = (actor: ActorState, dx: number, dy: number, speed: number, dt: number) => void;

function actorMovementBounds(): { w: number; h: number } {
  if (state.mode === 'dungeon' && state.dungeon) return { w: state.dungeon.w, h: state.dungeon.h };
  return { w: worldW, h: worldH };
}

export function fallbackMoveActor(actor: ActorState, dx: number, dy: number, speed: number, dt: number) {
  const bounds = actorMovementBounds();
  actor.x = clamp(actor.x + dx * speed * dt, 0.5, bounds.w - 0.5);
  actor.y = clamp(actor.y + dy * speed * dt, 0.5, bounds.h - 0.5);
}

let actorMover: ActorMover = fallbackMoveActor;

export function registerActorMover(mover: ActorMover | null | undefined) {
  actorMover = mover || fallbackMoveActor;
}

export function resetActorMover() {
  actorMover = fallbackMoveActor;
}

export function moveActor(actor: ActorState, dx: number, dy: number, speed: number, dt: number) {
  actorMover(actor, dx, dy, speed, dt);
}
