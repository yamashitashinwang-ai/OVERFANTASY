// Tween-driven visual feedback. Replaces the handwritten `hitReactions` WeakMap
// with Phaser's tween manager so animations are interpolated, queued, and
// disposed by the engine instead of by a manual sin-curve update loop.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import type { ActorState } from '../domain/types.ts';
import type { PhysicsArc } from './runtime.ts';
import { hexToInt, brightenColorInt } from './colors.ts';

// Per-entity tween bookkeeping so re-triggering during an in-flight hit cleanly
// cancels the previous animation instead of stacking.
const activeHitTweens = new WeakMap<PhysicsArc, { tweens: Phaser.Tweens.Tween[] }>();

/**
 * Flash an entity's color (and briefly shake) when it takes damage.
 * Called from game logic via `markHitReaction(target, critical)`.
 */
export function triggerHitTween(target: ActorState | null | undefined, critical = false) {
  if (!D.pScene || !target) return;
  const display = D.entityDisplayMap.get(target.id);
  if (!display?.circle) return;
  const arc = display.circle;

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
    targets: arc,
    duration: duration * 0.5,
    yoyo: true,
    ease: 'Sine.easeOut',
    displayOriginX: { from: arc.width / 2, to: arc.width / 2 - nudgeX },
    displayOriginY: { from: arc.height / 2, to: arc.height / 2 - nudgeY }
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
