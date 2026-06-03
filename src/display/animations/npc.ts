import { bus, Events } from '../../runtime/events.ts';
import { display as D } from '../runtime.ts';
import type { ActorState } from '../../domain/types.ts';
import type { VisualAdjust } from './types.ts';
import { activeNpcAction, setNpcAction } from './action-state.ts';

export function triggerNpcInteract(actor: ActorState | null | undefined) {
  if (!actor || (actor.kind !== 'npc' && actor.kind !== 'friendly')) return;
  setNpcAction(actor.id, 340);
  const display = D.entityDisplayMap.get(actor.id);
  if (display?.sprite) {
    display.sprite.setTint(0xf3d778);
    display.sprite.setScale(1.04);
  }
}

export function npcVisualAdjust(actor: ActorState): VisualAdjust {
  const action = activeNpcAction(actor);
  if (!action) return { offsetX: 0, offsetY: 0, scale: 1, tint: null };
  const pulse = Math.sin(action.progress * Math.PI);
  return { offsetX: 0, offsetY: -2.5 * pulse, scale: 1 + 0.04 * pulse, tint: 0xf3d778 };
}
type EntityInteractionPayload = {
  actor?: unknown;
};

function entityInteractionPayload(payload: unknown): EntityInteractionPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as EntityInteractionPayload;
}

function onEntityInteracted(payload: unknown) {
  const event = entityInteractionPayload(payload);
  if (!event || !event.actor || typeof event.actor !== 'object') return;
  triggerNpcInteract(event.actor as ActorState);
}

bus.on(Events.ENTITY_INTERACTED, onEntityInteracted);
