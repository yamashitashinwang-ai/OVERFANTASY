// Centralised keyboard input. Wraps Phaser's keyboard plugin so game logic can
// query held state (movement) and one-shot triggers (actions) without ever
// touching `window.addEventListener` or a manual `Set` of pressed keys.
//
// Public shape (per scene that calls bindGameKeys):
//   keys.left / right / up / down          held vector for movement
//   keys.run                                shift held
//   keys.justDodge()                        true once per press
//   on('action', handler)                   { key: 'e'|'g'|'r'|'b'|'j'|'f'|'esc' }
//
// All Esc routing (modal stack) lives in routeEscape() — single source of
// truth instead of the chain of `if (k === 'escape' && xOpen)` branches.

import Phaser from 'phaser';
import type { MovementKeys } from '../domain/types.ts';

const KC = Phaser.Input.Keyboard.KeyCodes;

export function bindMovementKeys(scene: Phaser.Scene): MovementKeys {
  const k = scene.input.keyboard;
  return {
    up:     k.addKey(KC.W,        true, true),
    down:   k.addKey(KC.S,        true, true),
    left:   k.addKey(KC.A,        true, true),
    right:  k.addKey(KC.D,        true, true),
    upAlt:    k.addKey(KC.UP,     true, true),
    downAlt:  k.addKey(KC.DOWN,   true, true),
    leftAlt:  k.addKey(KC.LEFT,   true, true),
    rightAlt: k.addKey(KC.RIGHT,  true, true),
    run:    k.addKey(KC.SHIFT,    true, true),
    dodge:  k.addKey(KC.SPACE,    true, true)
  };
}

export function readMovementVector(keys: MovementKeys): { dx: number; dy: number } {
  let dx = 0, dy = 0;
  if (keys.left.isDown  || keys.leftAlt.isDown)  dx -= 1;
  if (keys.right.isDown || keys.rightAlt.isDown) dx += 1;
  if (keys.up.isDown    || keys.upAlt.isDown)    dy -= 1;
  if (keys.down.isDown  || keys.downAlt.isDown)  dy += 1;
  return { dx, dy };
}

export function isRunning(keys: MovementKeys): boolean {
  return keys.run.isDown;
}

// JustDown: edge-triggered; true exactly once per press cycle.
export function dodgePressed(keys: MovementKeys): boolean {
  return Phaser.Input.Keyboard.JustDown(keys.dodge as Phaser.Input.Keyboard.Key);
}

// Register one-shot action handlers. Returns an unbind() callback.
export function bindActions(scene: Phaser.Scene, handlers: Record<string, (event: KeyboardEvent) => void>) {
  const k = scene.input.keyboard;
  const subs: Array<[string, (event: KeyboardEvent) => void]> = [];
  for (const [keyCode, fn] of Object.entries(handlers)) {
    const sub = (event: KeyboardEvent) => fn(event);
    k.on(`keydown-${keyCode}`, sub);
    subs.push([`keydown-${keyCode}`, sub]);
  }
  return () => subs.forEach(([ev, fn]) => k.off(ev, fn));
}

// Centralised Esc routing. Pass a function that returns the currently open
// modal id ('backpack' | 'quest' | 'shop' | 'forge' | 'magic' | 'pause' | null)
// and per-modal close callbacks. routeEscape() picks the right one.
export function routeEscape(getOpenModal: () => string | null, closers: Record<string, () => void>, openPauseFn?: () => void) {
  const open = getOpenModal();
  if (open && closers[open]) { closers[open](); return; }
  if (openPauseFn) openPauseFn();
}
