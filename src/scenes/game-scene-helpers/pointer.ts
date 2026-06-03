import type Phaser from 'phaser';
import { state, runtime } from '../../runtime/state.ts';
import { clearGamePointerState, normalizeWithAim, worldPointerBlocked } from '../../runtime/input.ts';
import { playerAttack, playerDefend } from '../../domain/combat/actions.ts';
import { beginBowCharge, releaseBowCharge } from '../../domain/combat/bow.ts';

const TILE = 32;

export function installPointerInputs(scene: Phaser.Scene) {
  scene.input.mouse.disableContextMenu();
  const capturePointerAim = (pointer: Phaser.Input.Pointer) => {
    runtime.pointerInside = true;
    const wx = pointer.worldX / TILE;
    const wy = pointer.worldY / TILE;
    runtime.aimVector = normalizeWithAim(wx - state.player.x, wy - state.player.y);
    runtime.aimWorld = { x: wx, y: wy };
  };
  scene.input.on('gameover', () => { runtime.pointerInside = true; });
  scene.input.on('gameout', () => { runtime.pointerInside = false; });
  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (!worldPointerBlocked()) capturePointerAim(pointer);
  });
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (worldPointerBlocked()) {
      clearGamePointerState(scene);
      return;
    }
    capturePointerAim(pointer);
    if (pointer.leftButtonDown()) {
      if (!beginBowCharge()) playerAttack();
    }
    if (pointer.rightButtonDown()) playerDefend();
  });
  scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    if (worldPointerBlocked()) {
      clearGamePointerState(scene);
      return;
    }
    if (pointer.leftButtonReleased()) releaseBowCharge();
  });
}
