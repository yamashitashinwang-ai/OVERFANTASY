import type { Direction8, Vector2 } from './common.ts';
import type { AttackEffect, BowCharge, PendingMagicCast } from './combat.ts';

export interface MovementKeyLike {
  isDown: boolean;
}

export interface MovementKeys {
  up: MovementKeyLike;
  down: MovementKeyLike;
  left: MovementKeyLike;
  right: MovementKeyLike;
  upAlt: MovementKeyLike;
  downAlt: MovementKeyLike;
  leftAlt: MovementKeyLike;
  rightAlt: MovementKeyLike;
  run: MovementKeyLike;
  dodge: MovementKeyLike;
}

export interface SceneControllerLike {
  launch(key: string): void;
  pause(): void;
  resume(): void;
  stop(key?: string): void;
  isActive?(key: string): boolean;
}

export interface SceneRefLike {
  scene: SceneControllerLike;
}

export interface RuntimeState {
  attackEffect: AttackEffect | null;
  bowCharge: BowCharge | null;
  pendingMagicCast: PendingMagicCast | null;
  hitStopTimer: number;
  aimVector: Vector2;
  aimWorld: Vector2 | null;
  aimDirection: Direction8 | null;
  facingDirection: Direction8 | null;
  pointerInside: boolean;
  mvKeys: MovementKeys | null;
  pSceneRef: SceneRefLike | null;
}
