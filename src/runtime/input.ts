// Centralised input compatibility facade. Movement key tracking, pointer
// cleanup, focus restoration, and action routing live under `runtime/input/`.

export { clearMovementKeyState } from './input/key-tracker.ts';
export { restoreGameInputFocus } from './input/focus.ts';
export { clearGamePointerState, releaseWorldPointerInput } from './input/pointer.ts';
export { bindMovementKeys, readMovementVector, isRunning, dodgePressed } from './input/movement.ts';
export { bindActions, routeEscape } from './input/actions.ts';
export { playerAimAngle, normalizeWithAim } from './input/aim.ts';
export { blockWorldAction, worldPointerBlocked, modalKey } from './input/modal-gates.ts';
