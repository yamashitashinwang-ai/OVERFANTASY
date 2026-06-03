import { playerAnimatedMountOffsetsForFacing } from '../../../domain/facing.ts';
import { dirVector } from '../keys.ts';
import type { FacingDir, Graphics, PlayerPose } from '../types.ts';

export const playerTextureW = 48;
export const playerTextureH = 64;
export const playerTextureCenterX = playerTextureW / 2;
export const playerTextureFootY = 56;

export { dirVector };

export function localPlayerMount(
  dir: FacingDir,
  pose: PlayerPose,
  name: 'foot' | 'body' | 'rightShoulder' | 'leftShoulder' | 'rightHand' | 'leftHand' | 'weapon'
) {
  const offset = playerAnimatedMountOffsetsForFacing(dir, pose)[name];
  return { x: playerTextureCenterX + offset.x, y: playerTextureFootY + offset.y };
}

export function drawCapsuleLine(g: Graphics, fromX: number, fromY: number, toX: number, toY: number, color: number, width: number) {
  const outlineR = width / 2 + 1;
  const fillR = width / 2;
  g.lineStyle(width + 2, 0x101317, 0.72);
  g.lineBetween(fromX, fromY, toX, toY);
  g.fillStyle(0x101317, 0.72);
  g.fillCircle(fromX, fromY, outlineR);
  g.fillCircle(toX, toY, outlineR);
  g.lineStyle(width, color, 1);
  g.lineBetween(fromX, fromY, toX, toY);
  g.fillStyle(color, 1);
  g.fillCircle(fromX, fromY, fillR);
  g.fillCircle(toX, toY, fillR);
}
