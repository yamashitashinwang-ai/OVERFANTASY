import { bus, Events } from '../../../runtime/events.ts';
import type { ActorState } from '../../types.ts';

// Hit reaction is display-only; domain publishes the hit fact and display code
// decides how to visualize it.
export function markHitReaction(target: ActorState, critical = false) {
  bus.emit(Events.ENTITY_HIT, { entity: target, critical });
}
