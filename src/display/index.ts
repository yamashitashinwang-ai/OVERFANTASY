// Phaser display public entry points. Re-exports the focused submodules
// (physics / tiles / world / effects / hud) and provides the once-per-frame
// `syncAllDisplay` orchestrator plus the one-time `initDisplay` setup.

import { display as D } from './runtime.ts';
import type Phaser from 'phaser';
import { W, H } from '../runtime/constants.ts';
import { registerDisplayRebuilder } from '../runtime/display-sync.ts';
import { rebuildDisplay, syncPlayerDisplay, syncEntityDisplay, syncObjectDisplay,
         syncPickupDisplay, syncPetDisplay, syncPetRemainsDisplay,
         syncHpBars } from './world.ts';
import { syncWeaponDisplay, syncArrowsDisplay, syncEffectsDisplay } from './effects.ts';
import { syncHudDisplay } from './hud.ts';
import { initDebugHud, syncDebugHud } from './debug-hud.ts';
import { initCollisionDebug, syncCollisionDebug } from './collision-debug.ts';
import { initAnimationFeedback } from './animations.ts';
import { ensurePlaceholderArt } from './placeholder-art.ts';
import './particles.ts';

// Re-export the public API so callers can import everything from one place.
export { rebuildDisplay };
export { moveActor, syncStateFromBodies, zeroAllVelocities,
         getActorBody, teleportBody, attachCircleBody,
         rebuildPhysicsForMap } from './physics.ts';
export { hexToInt, brightenColorInt } from './colors.ts';

registerDisplayRebuilder(rebuildDisplay);

export function syncAllDisplay() {
  if (!D.pScene) return;
  syncPlayerDisplay();
  syncEntityDisplay();
  syncObjectDisplay();
  syncPickupDisplay();
  syncPetDisplay();
  syncPetRemainsDisplay();
  syncHpBars();
  syncWeaponDisplay();
  syncArrowsDisplay();
  syncEffectsDisplay();
  syncHudDisplay();
  syncDebugHud();
  syncCollisionDebug();
}

export function initDisplay(scene: Phaser.Scene) {
  D.pScene = scene;
  ensurePlaceholderArt(scene);

  D.pickupsGfx     = scene.add.graphics().setDepth(2);
  D.petRemainsGfx  = scene.add.graphics().setDepth(3);
  D.corruptionGfx  = scene.add.graphics().setDepth(5);
  D.weaponGfx      = scene.add.graphics().setDepth(7);
  D.hpBarsGfx      = scene.add.graphics().setDepth(7);
  D.arrowGfx       = scene.add.graphics().setDepth(8);
  D.effectsGfx     = scene.add.graphics().setDepth(9);

  D.hudBg = scene.add.rectangle(12, 12, 560, 124, 0x07090b, 0.62)
    .setOrigin(0, 0).setScrollFactor(0).setDepth(50);
  D.hudAreaText = scene.add.text(24, 20, '', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '16px', color: '#edf3f7'
  }).setScrollFactor(0).setDepth(51);
  D.hudWeaponText = scene.add.text(24, 44, '', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '16px', color: '#f3c45b'
  }).setScrollFactor(0).setDepth(51);
  D.hudBarsGfx = scene.add.graphics().setScrollFactor(0).setDepth(51);

  const labelStyle = {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '12px', color: '#dbe4ea'
  };
  D.hpLabel       = scene.add.text(24, 70, '', labelStyle).setScrollFactor(0).setDepth(52);
  D.mpLabel       = scene.add.text(24, 86, '', labelStyle).setScrollFactor(0).setDepth(52);
  D.staminaLabel  = scene.add.text(24, 102, '', labelStyle).setScrollFactor(0).setDepth(52);
  D.hudCooldownText = scene.add.text(304, 102, '', labelStyle).setScrollFactor(0).setDepth(52);

  D.chantBarGfx = scene.add.graphics().setScrollFactor(0).setDepth(54).setVisible(false);
  D.chantText = scene.add.text(W / 2, H * 0.8 - 9, '', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '14px', color: '#edf3f7'
  }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(55).setVisible(false);

  D.exitHintText = scene.add.text(24, 128, '出口', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '14px', color: '#ffffff'
  }).setScrollFactor(0).setDepth(52).setVisible(false).setAlpha(0.78);

  // monsterForm banner — enemy monsters treat the player as ally and skip
  // attacks, while civilized NPCs become wary.
  D.monsterFormBanner = scene.add.text(W / 2, 16, '魔物化 - 普通魔物视你为同伴，文明聚落会警戒', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '18px', color: '#ffffff', backgroundColor: '#ad6cff',
    padding: { x: 12, y: 6 }, align: 'center'
  }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(80).setVisible(false);

  // Debug HUD (F2 toggle) — shows every variable relevant to combat in real
  // time. Use this when something looks "broken" — read the values and tell
  // me which one is wrong instead of guessing.
  initDebugHud(scene);
  initCollisionDebug(scene);
  initAnimationFeedback(scene);
}
