import { bus, Events } from '../../runtime/events.ts';
import type { ActorState } from '../types.ts';

export function publishPlayerInteraction() {
  bus.emit(Events.PLAYER_INTERACTED);
}

export function publishEntityInteraction(actor: ActorState | null | undefined) {
  if (!actor) return;
  bus.emit(Events.ENTITY_INTERACTED, { actor });
}
