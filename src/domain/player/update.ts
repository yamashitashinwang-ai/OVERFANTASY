import { moveActor } from "../../runtime/actor-movement.ts";
import { dodgePressed, isRunning, readMovementVector } from "../../runtime/input.ts";
import { runtime, state } from "../../runtime/state.ts";
import { playerDodge } from "../combat/actions.ts";
import { raceMoveSpeedMultiplier, raceStaminaRegenMultiplier } from "../combat/race.ts";
import { hasPathosEffect } from "../combat/weapon.ts";
import { deathFatigueStaminaRegenMultiplier } from "../death.ts";
import { runExhaustionRecoveryStamina, runMinimumStamina } from "./constants.ts";
import { pickupItems } from "./pickups.ts";

export function updatePlayer(dt: number) {
  // Read movement from Phaser keyboard handles; no DOM, no `keys` Set, no
  // window listener required.
  const mv = runtime.mvKeys;
  const { dx, dy } = mv ? readMovementVector(mv) : { dx: 0, dy: 0 };
  if (state.player.runExhausted && state.player.stamina >= runExhaustionRecoveryStamina) {
    state.player.runExhausted = false;
  }
  const runHeld = !!(mv && isRunning(mv));
  const isMoving = !!(dx || dy);
  let depletedRunThisFrame = false;
  if (!state.player.runExhausted && runHeld && isMoving && state.player.stamina <= runMinimumStamina) {
    state.player.runExhausted = true;
    depletedRunThisFrame = true;
  }
  const wantsRun = runHeld
    && !state.player.runExhausted
    && state.player.stamina > runMinimumStamina
    && state.player.dodgeTimer <= 0;
  // Dodge: edge-triggered via JustDown so a held Space doesn't repeat.
  if (mv && dodgePressed(mv)) playerDodge();
  state.player.running = isMoving && wantsRun;
  if (isMoving) {
    const len = Math.hypot(dx, dy);
    const fatigue = state.player.stamina < 8 ? 0.72 : 1;
    const attackDrag = state.player.attackCooldown > 0 ? 0.62 : 1;
    const dodgeBoost = state.player.dodgeTimer > 0 ? 2.35 : 1;
    const runBoost = state.player.running ? 1.45 : 1;
    const pathosBoost = hasPathosEffect() ? 1.5 : 1;
    moveActor(
      state.player,
      dx / len,
      dy / len,
      (state.player.monsterForm ? 4.1 : 3.6) * fatigue * attackDrag * dodgeBoost * runBoost * pathosBoost * raceMoveSpeedMultiplier(),
      dt
    );
    if (state.player.running) {
      state.player.stamina = Math.max(0, state.player.stamina - dt * 1.8);
      if (state.player.stamina <= runMinimumStamina) {
        state.player.running = false;
        state.player.runExhausted = true;
        depletedRunThisFrame = true;
      }
    }
  }
  // Cooldowns are decremented once per frame by GameScene via
  // tickPlayerCooldowns; updatePlayer only reads the remaining duration.
  if (state.player.stamina < 30 && !state.player.running && !depletedRunThisFrame) {
    state.player.stamina += dt * (0.8 + 30 * 0.02) * raceStaminaRegenMultiplier() * deathFatigueStaminaRegenMultiplier();
    if (state.player.runExhausted && state.player.stamina >= runExhaustionRecoveryStamina) {
      state.player.runExhausted = false;
    }
  }
  pickupItems();
}
