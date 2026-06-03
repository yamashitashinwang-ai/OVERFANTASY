import type Phaser from 'phaser';
import { display as D } from '../runtime.ts';
import { currentPlayerMagicCastVisual } from '../animations.ts';
import { state } from '../../runtime/state.ts';
import { clamp } from '../../domain/math.ts';

export function drawMagicCastHandEffect(gfx: Phaser.GameObjects.Graphics) {
  const cast = currentPlayerMagicCastVisual();
  const points = D.playerRig?.debugPointsWorld();
  if (!cast || !points) return;
  const color = cast.color;
  const leftHand = points.leftHand;
  const leftShoulder = points.leftShoulder;
  const time = state.time * 10;
  if (cast.stage === 'charge') {
    const settle = clamp(cast.progress / 0.28, 0, 1);
    const pulse = 0.5 + Math.sin(time * 1.8) * 0.5;
    const radius = 4.2 + settle * 3.8 + pulse * 1.2;
    gfx.fillStyle(color, 0.2 + settle * 0.22);
    gfx.fillCircle(leftHand.x, leftHand.y, radius);
    gfx.lineStyle(1.5, color, 0.55 + pulse * 0.24);
    gfx.strokeCircle(leftHand.x, leftHand.y, radius + 2.5);
    for (let i = 0; i < 4; i += 1) {
      const a = time * 0.9 + i * Math.PI * 0.5;
      const orbit = radius + 4 + i * 0.8;
      gfx.fillStyle(color, 0.48);
      gfx.fillCircle(leftHand.x + Math.cos(a) * orbit, leftHand.y + Math.sin(a) * orbit * 0.72, 1.6);
    }
    return;
  }

  const fade = 1 - cast.progress;
  gfx.lineStyle(3, color, 0.7 * fade);
  gfx.beginPath();
  gfx.moveTo(leftShoulder.x, leftShoulder.y);
  gfx.lineTo(leftHand.x, leftHand.y);
  gfx.strokePath();
  gfx.fillStyle(color, 0.35 * fade);
  gfx.fillCircle(leftHand.x, leftHand.y, 10 + cast.progress * 8);
  gfx.lineStyle(2, color, 0.8 * fade);
  gfx.strokeCircle(leftHand.x, leftHand.y, 6 + cast.progress * 14);
}
