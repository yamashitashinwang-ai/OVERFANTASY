import Phaser from 'phaser';
import type { MovementKeys } from '../../domain/types.ts';
import { installMovementKeyTracker, trackedMovementKey } from './key-tracker.ts';

const KC = Phaser.Input.Keyboard.KeyCodes;

export function bindMovementKeys(scene: Phaser.Scene): MovementKeys {
  installMovementKeyTracker();
  const keyboard = scene.input.keyboard;
  return {
    up: trackedMovementKey(keyboard.addKey(KC.W, true, true), ['KeyW']),
    down: trackedMovementKey(keyboard.addKey(KC.S, true, true), ['KeyS']),
    left: trackedMovementKey(keyboard.addKey(KC.A, true, true), ['KeyA']),
    right: trackedMovementKey(keyboard.addKey(KC.D, true, true), ['KeyD']),
    upAlt: trackedMovementKey(keyboard.addKey(KC.UP, true, true), ['ArrowUp']),
    downAlt: trackedMovementKey(keyboard.addKey(KC.DOWN, true, true), ['ArrowDown']),
    leftAlt: trackedMovementKey(keyboard.addKey(KC.LEFT, true, true), ['ArrowLeft']),
    rightAlt: trackedMovementKey(keyboard.addKey(KC.RIGHT, true, true), ['ArrowRight']),
    run: trackedMovementKey(keyboard.addKey(KC.SHIFT, true, true), ['ShiftLeft', 'ShiftRight', 'Shift']),
    dodge: keyboard.addKey(KC.SPACE, true, true)
  };
}

export function readMovementVector(keys: MovementKeys): { dx: number; dy: number } {
  let dx = 0, dy = 0;
  if (keys.left.isDown || keys.leftAlt.isDown) dx -= 1;
  if (keys.right.isDown || keys.rightAlt.isDown) dx += 1;
  if (keys.up.isDown || keys.upAlt.isDown) dy -= 1;
  if (keys.down.isDown || keys.downAlt.isDown) dy += 1;
  return { dx, dy };
}

export function isRunning(keys: MovementKeys): boolean {
  return keys.run.isDown;
}

export function dodgePressed(keys: MovementKeys): boolean {
  return Phaser.Input.Keyboard.JustDown(keys.dodge as Phaser.Input.Keyboard.Key);
}
