import type Phaser from 'phaser';
import { display as D, type PhysicsArc } from '../runtime.ts';
import { brightenColorInt, hexToInt } from '../colors.ts';
import type { ActorState } from '../../domain/types.ts';

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
  const sprite = display.sprite;

  const prev = activeHitTweens.get(arc);
  if (prev) {
    prev.tweens.forEach((t: Phaser.Tweens.Tween) => t.stop());
  }

  const baseColorHex = target.wounded ? '#f1a381' : target.color;
  const baseColor = hexToInt(baseColorHex);
  const brightColor = brightenColorInt(baseColorHex, critical ? 0.55 : 0.34);
  const duration = critical ? 180 : 100;
  const amp = critical ? 9 : 6;
  const sign = target.x >= 0 ? 1 : -1;

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

  if (critical) {
    arc.setStrokeStyle(3, 0xffffff, 1);
    D.pScene.time.delayedCall(duration, () => {
      if (arc.scene) arc.setStrokeStyle(2, 0x0b0e12);
    });
  }

  activeHitTweens.set(arc, { tweens: [flashTween, shakeTween] });
}
