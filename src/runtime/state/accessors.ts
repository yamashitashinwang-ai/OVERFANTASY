import type { AttackEffect, BowCharge, MovementKeys, PendingMagicCast, SceneRefLike } from '../../domain/types.ts';
import { runtime } from './runtime.ts';

// Shims for remaining getX/setX call sites. New code can read/write runtime.X
// directly, but these wrappers keep old imports stable while cleanup continues.
export const getAttackEffect = (): AttackEffect | null => runtime.attackEffect;
export const setAttackEffect = (v: AttackEffect | null) => { runtime.attackEffect = v; };
export const getBowCharge = (): BowCharge | null => runtime.bowCharge;
export const setBowCharge = (v: BowCharge | null) => { runtime.bowCharge = v; };
export const getPendingMagicCast = (): PendingMagicCast | null => runtime.pendingMagicCast;
export const setPendingMagicCast = (v: PendingMagicCast | null) => { runtime.pendingMagicCast = v; };
export const getHitStopTimer = (): number => runtime.hitStopTimer;
export const setHitStopTimer = (v: number) => { runtime.hitStopTimer = v; };
export const getAimVector = () => runtime.aimVector;
export const getAimWorld = () => runtime.aimWorld;
export const getMvKeys = (): MovementKeys | null => runtime.mvKeys;
export const getPScene = (): SceneRefLike | null => runtime.pSceneRef;
