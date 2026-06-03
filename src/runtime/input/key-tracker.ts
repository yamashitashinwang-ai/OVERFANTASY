import type Phaser from 'phaser';
import type { MovementKeyLike } from '../../domain/types.ts';

const movementKeyCodes = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ShiftLeft', 'ShiftRight', 'Shift'
]);
const pressedMovementKeys = new Set<string>();
let movementTrackerInstalled = false;

function trackedCodeFor(event: KeyboardEvent): string | null {
  if (event.code && movementKeyCodes.has(event.code)) return event.code;
  const key = event.key;
  if (!key) return null;
  const lower = key.toLowerCase();
  if (lower === 'w') return 'KeyW';
  if (lower === 'a') return 'KeyA';
  if (lower === 's') return 'KeyS';
  if (lower === 'd') return 'KeyD';
  if (key === 'ArrowUp') return 'ArrowUp';
  if (key === 'ArrowDown') return 'ArrowDown';
  if (key === 'ArrowLeft') return 'ArrowLeft';
  if (key === 'ArrowRight') return 'ArrowRight';
  if (key === 'Shift') return 'Shift';
  return null;
}

export function clearMovementKeyState() {
  pressedMovementKeys.clear();
}

export function installMovementKeyTracker() {
  if (movementTrackerInstalled || typeof window === 'undefined') return;
  movementTrackerInstalled = true;

  window.addEventListener('keydown', (event) => {
    const code = trackedCodeFor(event);
    if (code) pressedMovementKeys.add(code);
  }, true);
  window.addEventListener('keyup', (event) => {
    const code = trackedCodeFor(event);
    if (code) pressedMovementKeys.delete(code);
  }, true);
  window.addEventListener('blur', clearMovementKeyState, true);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') clearMovementKeyState();
    });
  }
}

function isTrackedDown(codes: string[]): boolean {
  if (!movementTrackerInstalled || typeof window === 'undefined') return false;
  return codes.some((code) => pressedMovementKeys.has(code));
}

export function trackedMovementKey(key: Phaser.Input.Keyboard.Key, codes: string[]): MovementKeyLike {
  return {
    get isDown() {
      return movementTrackerInstalled ? isTrackedDown(codes) : key.isDown;
    }
  };
}
