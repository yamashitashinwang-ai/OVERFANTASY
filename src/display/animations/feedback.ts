import type Phaser from 'phaser';
import { bus, Events } from '../../runtime/events.ts';
import type { ActorState } from '../../domain/types.ts';
import { triggerHitTween } from './hit-tween.ts';
import { triggerPlayerHurt } from './player.ts';

type EntityHitPayload = {
  entity?: unknown;
  critical?: unknown;
};

function entityHitPayload(payload: unknown): EntityHitPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as EntityHitPayload;
}

function onEntityHit(payload: unknown) {
  const hit = entityHitPayload(payload);
  if (!hit || !hit.entity || typeof hit.entity !== 'object') return;
  triggerHitTween(hit.entity as ActorState, hit.critical === true);
}

export function initAnimationFeedback(scene: Phaser.Scene) {
  const onPlayerHurt = () => triggerPlayerHurt();
  bus.on(Events.PLAYER_HURT, onPlayerHurt);
  bus.on(Events.ENTITY_HIT, onEntityHit);
  scene.events.once('shutdown', () => {
    bus.off(Events.PLAYER_HURT, onPlayerHurt);
    bus.off(Events.ENTITY_HIT, onEntityHit);
  });
}
