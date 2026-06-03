import type { RuntimeState } from '../../domain/types.ts';

// Reassignable runtime-only singletons. Game logic mutates these in place and
// display/UI code reads them each frame. Keeping them in one object avoids ES
// module `let` reassignment hazards across imports.
export const runtime: RuntimeState = {
  attackEffect: null,
  bowCharge: null,
  pendingMagicCast: null,
  hitStopTimer: 0,
  aimVector: { x: 1, y: 0 },
  aimWorld: null,
  aimDirection: null,
  facingDirection: null,
  pointerInside: false,
  mvKeys: null,
  pSceneRef: null
};
