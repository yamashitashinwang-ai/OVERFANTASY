import { display as D } from '../../runtime.ts';
import { facingFromDelta } from '../../placeholder-art.ts';
import { state, runtime } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import type { FacingDir } from './types.ts';

let playerFacing: FacingDir = 's';

function syncActivePointerAimWorld() {
  if (!D.pScene || !runtime.pointerInside) return;
  const pointer = D.pScene.input.activePointer;
  if (!pointer) return;
  const worldPoint = D.pScene.cameras.main.getWorldPoint(pointer.x, pointer.y);
  runtime.aimWorld = { x: worldPoint.x / tile, y: worldPoint.y / tile };
}

export function syncPlayerFacingFromAim(dx: number, dy: number) {
  syncActivePointerAimWorld();
  const movementFacing = Math.hypot(dx, dy) > 0.35 ? facingFromDelta(dx, dy, playerFacing) : playerFacing;
  if (runtime.aimWorld) {
    const bodyX = (D.playerCircle?.x ?? state.player.x * tile) / tile;
    const bodyY = (D.playerCircle?.y ?? state.player.y * tile) / tile;
    const ax = runtime.aimWorld.x - bodyX;
    const ay = runtime.aimWorld.y - bodyY;
    const len = Math.hypot(ax, ay);
    if (len > 0.02) {
      playerFacing = facingFromDelta(ax * tile, ay * tile, playerFacing);
      runtime.aimVector = { x: ax / len, y: ay / len };
      runtime.aimDirection = playerFacing;
      runtime.facingDirection = playerFacing;
      return;
    }
  }
  playerFacing = movementFacing;
  runtime.aimDirection = runtime.aimWorld ? playerFacing : null;
  runtime.facingDirection = playerFacing;
}

export function currentPlayerFacing() {
  return playerFacing;
}
