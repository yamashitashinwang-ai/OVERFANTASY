import { display as D } from '../../runtime.ts';
import type { PlayerDisplayMotionInput } from './types.ts';

let lastPlayerPixel = { x: 0, y: 0 };

export function playerDisplayMotionFromKinematics({
  deltaX,
  deltaY,
  velocityX = 0,
  velocityY = 0,
  running = false
}: PlayerDisplayMotionInput) {
  const velocityMoving = Math.hypot(velocityX, velocityY) > 1;
  const deltaMoving = Math.hypot(deltaX, deltaY) > 0.35;
  return {
    moving: running || velocityMoving || deltaMoving,
    facingDx: velocityMoving ? velocityX : deltaX,
    facingDy: velocityMoving ? velocityY : deltaY
  };
}

function playerBodyVelocity() {
  const body = D.playerCircle?.body as { velocity?: { x?: number; y?: number } } | null | undefined;
  return {
    x: body?.velocity?.x ?? 0,
    y: body?.velocity?.y ?? 0
  };
}

export function resetPlayerDisplayPixel(x: number, y: number) {
  lastPlayerPixel = { x, y };
}

export function currentPlayerDisplayMotion(running: boolean) {
  if (!D.playerCircle) {
    return playerDisplayMotionFromKinematics({ deltaX: 0, deltaY: 0, running });
  }
  const dx = D.playerCircle.x - lastPlayerPixel.x;
  const dy = D.playerCircle.y - lastPlayerPixel.y;
  const velocity = playerBodyVelocity();
  return playerDisplayMotionFromKinematics({
    deltaX: dx,
    deltaY: dy,
    velocityX: velocity.x,
    velocityY: velocity.y,
    running
  });
}

export function rememberPlayerDisplayPixel() {
  if (!D.playerCircle) return;
  lastPlayerPixel = { x: D.playerCircle.x, y: D.playerCircle.y };
}
