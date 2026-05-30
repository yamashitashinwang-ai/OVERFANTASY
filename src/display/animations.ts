// Tween-driven visual feedback. Replaces the handwritten `hitReactions` WeakMap
// with Phaser's tween manager so animations are interpolated, queued, and
// disposed by the engine instead of by a manual sin-curve update loop.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import type { ActorState } from '../domain/types.ts';
import type { PhysicsArc } from './runtime.ts';
import type { FacingDir, PlayerPose, ReservedPlayerAttackAnimationName } from './placeholder-art.ts';
import { dirVector, playerTextureKey, reservedPlayerAttackAnimationNames } from './placeholder-art.ts';
import { hexToInt, brightenColorInt } from './colors.ts';
import { bus, Events } from '../runtime/events.ts';

// Per-entity tween bookkeeping so re-triggering during an in-flight hit cleanly
// cancels the previous animation instead of stacking.
const activeHitTweens = new WeakMap<PhysicsArc, { tweens: Phaser.Tweens.Tween[] }>();

type VisualActionKind = 'interact' | 'hurt' | 'attack';
type VisualAction = {
  kind: VisualActionKind;
  startedAt: number;
  endsAt: number;
  attackName?: ReservedPlayerAttackAnimationName | 'attack';
};

export const playerAttackAnimationNames = reservedPlayerAttackAnimationNames;

let playerAction: VisualAction | null = null;
const npcActions = new Map<string, VisualAction>();
const playerActionPriority: Record<VisualActionKind, number> = {
  interact: 1,
  attack: 2,
  hurt: 3
};

function nowMs() {
  return D.pScene?.time.now ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function activeAction(action: VisualAction | null | undefined): (VisualAction & { progress: number }) | null {
  if (!action) return null;
  const now = nowMs();
  if (now >= action.endsAt) return null;
  return {
    ...action,
    progress: clamp01((now - action.startedAt) / Math.max(1, action.endsAt - action.startedAt))
  };
}

function setPlayerAction(kind: VisualActionKind, durationMs: number, attackName?: VisualAction['attackName']) {
  const now = nowMs();
  const current = activeAction(playerAction);
  if (current && playerActionPriority[current.kind] > playerActionPriority[kind]) return;
  playerAction = { kind, startedAt: now, endsAt: now + durationMs, attackName };
}

function setNpcAction(id: string, durationMs: number) {
  const now = nowMs();
  npcActions.set(id, { kind: 'interact', startedAt: now, endsAt: now + durationMs });
}

function playerFacingFromTexture(): FacingDir {
  const key = D.playerSprite?.texture?.key || '';
  const dir = key.split(':')[3];
  return (['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].includes(dir) ? dir : 's') as FacingDir;
}

function playerMonsterFormFromTexture() {
  return (D.playerSprite?.texture?.key || '').includes(':monster:');
}

function applyImmediatePlayerPose(pose: PlayerPose, tint: number, scale = 1.04) {
  if (!D.playerSprite) return;
  D.playerSprite.setTexture(playerTextureKey(playerFacingFromTexture(), pose, playerMonsterFormFromTexture()));
  D.playerSprite.setTint(tint);
  D.playerSprite.setScale(scale);
}

export function triggerPlayerInteract() {
  setPlayerAction('interact', 260);
  applyImmediatePlayerPose('interact', 0xf3d778, 1.035);
}

export function triggerPlayerHurt() {
  setPlayerAction('hurt', 330);
  applyImmediatePlayerPose('hurt', 0xff8372, 1.05);
}

export function triggerPlayerAttackPlaceholder(attackName: ReservedPlayerAttackAnimationName | 'attack' = 'attack') {
  setPlayerAction('attack', attackName === 'attack_bow' ? 300 : 230, attackName);
  applyImmediatePlayerPose('attack', attackName === 'attack_bow' ? 0xcfe7ff : 0xfff4b0, 1.025);
}

export function triggerNpcInteract(actor: ActorState | null | undefined) {
  if (!actor || (actor.kind !== 'npc' && actor.kind !== 'friendly')) return;
  setNpcAction(actor.id, 340);
  const display = D.entityDisplayMap.get(actor.id);
  if (display?.sprite) {
    display.sprite.setTint(0xf3d778);
    display.sprite.setScale(1.04);
  }
}

export function currentPlayerPoseOverride(): PlayerPose | null {
  const action = activeAction(playerAction);
  if (!action) {
    playerAction = null;
    return null;
  }
  if (action.kind === 'interact') return 'interact';
  if (action.kind === 'hurt') return 'hurt';
  return 'attack';
}

export function playerVisualAdjust(facing: FacingDir) {
  const action = activeAction(playerAction);
  if (!action) return { offsetX: 0, offsetY: 0, scale: 1, tint: null as number | null };
  const pulse = Math.sin(action.progress * Math.PI);
  if (action.kind === 'interact') {
    return { offsetX: 0, offsetY: -3 * pulse, scale: 1 + 0.035 * pulse, tint: 0xf3d778 };
  }
  if (action.kind === 'hurt') {
    const shake = Math.sin(action.progress * Math.PI * 4);
    return { offsetX: shake * 4, offsetY: -1 * pulse, scale: 1 + 0.05 * pulse, tint: 0xff8372 };
  }
  const v = dirVector(facing);
  return {
    offsetX: v.x * 4 * pulse,
    offsetY: v.y * 4 * pulse - 1.5 * pulse,
    scale: 1 + 0.025 * pulse,
    tint: action.attackName === 'attack_bow' ? 0xcfe7ff : 0xfff4b0
  };
}

export function npcVisualAdjust(actor: ActorState) {
  const action = activeAction(npcActions.get(actor.id));
  if (!action) {
    npcActions.delete(actor.id);
    return { offsetX: 0, offsetY: 0, scale: 1, tint: null as number | null };
  }
  const pulse = Math.sin(action.progress * Math.PI);
  return { offsetX: 0, offsetY: -2.5 * pulse, scale: 1 + 0.04 * pulse, tint: 0xf3d778 };
}

export function initAnimationFeedback(scene: Phaser.Scene) {
  const onPlayerHurt = () => triggerPlayerHurt();
  bus.on(Events.PLAYER_HURT, onPlayerHurt);
  scene.events.once('shutdown', () => {
    bus.off(Events.PLAYER_HURT, onPlayerHurt);
  });
}

/**
 * Flash an entity's color (and briefly shake) when it takes damage.
 * Called from game logic via `markHitReaction(target, critical)`.
 */
export function triggerHitTween(target: ActorState | null | undefined, critical = false) {
  if (!D.pScene || !target) return;
  const display = D.entityDisplayMap.get(target.id);
  if (!display?.circle) return;
  const arc = display.circle;
  const sprite = display.sprite;

  // Cancel any in-flight hit tween on this arc.
  const prev = activeHitTweens.get(arc);
  if (prev) {
    prev.tweens.forEach((t: Phaser.Tweens.Tween) => t.stop());
  }

  const baseColorHex = target.wounded ? '#f1a381' : target.color;
  const baseColor = hexToInt(baseColorHex);
  const brightColor = brightenColorInt(baseColorHex, critical ? 0.55 : 0.34);
  const duration = critical ? 180 : 100;
  const amp = critical ? 9 : 6;
  const sign = target.x >= 0 ? 1 : -1; // simple direction bias; play-tested feel

  // Color flash: tween fillColor from bright back to base.
  arc.setFillStyle(brightColor, 1);
  sprite?.setTint(brightColor);
  if (sprite) sprite.scale = 1.08;
  arc._hitTweenActive = true;
  const flashTween = D.pScene.tweens.add({
    targets: arc,
    duration,
    ease: 'Cubic.easeOut',
    fillColor: { from: brightColor, to: baseColor },
    onUpdate: (t: { progress: number }) => {
      // Phaser doesn't directly tween fillColor on Arc; do it manually via progress.
      const p = t.progress;
      const mix = (a: number, b: number) => Math.round(a + (b - a) * p);
      const ar = (brightColor >> 16) & 255, ag = (brightColor >> 8) & 255, ab = brightColor & 255;
      const br = (baseColor >> 16) & 255, bg = (baseColor >> 8) & 255, bb = baseColor & 255;
      arc.setFillStyle((mix(ar, br) << 16) | (mix(ag, bg) << 8) | mix(ab, bb), 1);
    },
    onComplete: () => {
      arc.setFillStyle(baseColor, 1);
      sprite?.clearTint();
      if (sprite) sprite.scale = 1;
      arc._hitTweenActive = false;
    }
  });

  // Position nudge: small offset that yoyos back. Body is the position
  // authority, so we tween a visual offset by adjusting the arc's
  // displayOriginX/Y without moving the physics body.
  const nudgeX = sign * amp;
  const nudgeY = amp * 0.55;
  arc.setDisplayOrigin(arc.width / 2, arc.height / 2);
  const shakeTween = D.pScene.tweens.add({
    targets: sprite || arc,
    duration: duration * 0.5,
    yoyo: true,
    ease: 'Sine.easeOut',
    x: { from: sprite?.x ?? arc.x, to: (sprite?.x ?? arc.x) + nudgeX },
    y: { from: sprite?.y ?? arc.y, to: (sprite?.y ?? arc.y) + nudgeY }
  });

  // Critical hits get a brief outline flash too.
  if (critical) {
    arc.setStrokeStyle(3, 0xffffff, 1);
    D.pScene.time.delayedCall(duration, () => {
      if (arc.scene) arc.setStrokeStyle(2, 0x0b0e12);
    });
  }

  activeHitTweens.set(arc, { tweens: [flashTween, shakeTween] });
}
