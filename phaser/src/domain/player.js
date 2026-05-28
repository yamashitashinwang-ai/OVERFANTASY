// Player — input → velocity, stamina regen, dodge edge-trigger, item pickup.
// Movement uses Arcade Physics; cooldown fields on state.player are auto-decayed
// accessor properties (see runtime/player-cooldowns.js).

import { state } from '../scenes/Game.js';
import { runtime } from '../runtime/state.js';
import {
  raceMoveSpeedMultiplier, raceStaminaRegenMultiplier
} from './combat/race.js';
import { hasPathosEffect } from './combat/weapon.js';
import { moveActor } from '../display/index.js';
import { addMaterial, addResource, addGearToBag, gearIdForPickup } from './inventory.js';
import { restoreInjuredPets } from './npc.js';
import { currentPlayerId } from './session.js';
import {
  // facades still in Game.js
  log, autoSave,
  readMovementVector, isRunning, dodgePressed
} from '../scenes/Game.js';
import { playerDodge } from './combat/actions.js';

export function pickupItems() {
  for (const p of state.pickups) {
    if (p.taken) continue;
    if (p.reservedFor && p.reservedFor !== currentPlayerId()) continue;
    if (Math.hypot(state.player.x - p.x, state.player.y - p.y) < 0.75) {
      p.taken = true;
      p.takenBy = currentPlayerId();
      if (p.kind === "herb") state.player.herbs += p.value;
      if (p.kind === "potion") state.player.potions += p.value;
      if (p.kind === "arrow") state.player.arrows = (state.player.arrows || 0) + p.value;
      if (p.kind === "gold") state.player.gold += p.value;
      if (p.kind === "material") addMaterial(p.name, p.value);
      if (p.kind === "wood" || p.kind === "stone" || p.kind === "resource") addResource(p.name, p.value);
      if (p.kind === "weapon" || p.kind === "gear" || p.kind === "armor" || p.kind === "accessory" || p.kind === "ring") {
        const gearId = gearIdForPickup(p);
        if (gearId) addGearToBag(gearId);
        else {
          state.player.rings += p.value;
          autoSave();
        }
      }
      if (p.kind === "conceptSword") {
        addGearToBag("conceptSword");
        state.player.conceptSword = true;
        autoSave();
      }
  if (p.kind === "cleanse") {
    state.player.monsterForm = false;
    state.player.hp = state.player.maxHp;
    restoreInjuredPets();
  }
      log(p.kind === "arrow" ? "拾回了箭。" : `拾取了${p.name}。`);
    }
  }
}

export function updatePlayer(dt) {
  // Read movement from Phaser keyboard handles; no DOM, no `keys` Set, no
  // window listener required.
  const mv = runtime.mvKeys;
  const { dx, dy } = mv ? readMovementVector(mv) : { dx: 0, dy: 0 };
  const wantsRun = !!(mv && isRunning(mv)) && state.player.stamina > 1 && state.player.dodgeTimer <= 0;
  // Dodge: edge-triggered via JustDown so a held Space doesn't repeat.
  if (mv && dodgePressed(mv)) playerDodge();
  state.player.running = !!(dx || dy) && wantsRun;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    const fatigue = state.player.stamina < 8 ? 0.72 : 1;
    const attackDrag = state.player.attackCooldown > 0 ? 0.62 : 1;
    const dodgeBoost = state.player.dodgeTimer > 0 ? 2.35 : 1;
    const runBoost = state.player.running ? 1.45 : 1;
    const pathosBoost = hasPathosEffect() ? 1.5 : 1;
    moveActor(state.player, dx / len, dy / len, (state.player.monsterForm ? 4.1 : 3.6) * fatigue * attackDrag * dodgeBoost * runBoost * pathosBoost * raceMoveSpeedMultiplier(), dt);
    if (state.player.running) state.player.stamina = Math.max(0, state.player.stamina - dt * 1.8);
  }
  // Cooldowns are decremented once per frame by GameScene via
  // tickPlayerCooldowns; updatePlayer only reads the remaining duration.
  if (state.player.stamina < 30 && !state.player.running) state.player.stamina += dt * (0.8 + 30 * 0.02) * raceStaminaRegenMultiplier();
  pickupItems();
}
