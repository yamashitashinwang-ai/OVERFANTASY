// Scene-bound helper compatibility facade. Concrete scene orchestration helpers
// live under scenes/game-scene-helpers/ by responsibility.

export { playerAimAngle, normalizeWithAim } from './game-scene-helpers/aim.ts';
export { livingCount, updateWorld, installWorldTimers } from './game-scene-helpers/world.ts';
export { openPauseMenu, closePauseMenu } from './game-scene-helpers/pause.ts';
export { blockWorldAction } from './game-scene-helpers/modal-gates.ts';
export { installPointerInputs } from './game-scene-helpers/pointer.ts';
export { installKeyBindings } from './game-scene-helpers/keyboard.ts';
