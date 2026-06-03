// World rendering sync: tilemap rebuild and compatibility exports for
// player, entity, object, pickup, pet, remains, and HP-bar display sync.

import { display as D } from './runtime.ts';
import { hexToInt } from './colors.ts';
import { attachCircleBody, rebuildPhysicsForMap } from './physics.ts';
import { ensureTileTextures } from './tiles.ts';
import { PlayerRig } from './player-rig.ts';
import { playerTextureKey } from './placeholder-art.ts';
import { state } from '../runtime/state.ts';
import { tile } from '../runtime/constants.ts';
import { mapBounds } from '../domain/world.ts';
import { resetBody } from './world/shared.ts';
import {
  resetPlayerDisplayPixel,
  syncCameraToPlayerAnchor,
  syncPlayerDisplay
} from './world/player.ts';
import { syncEntityDisplay } from './world/entities.ts';
import { syncObjectDisplay } from './world/objects.ts';
import { syncPetDisplay } from './world/pets.ts';

export {
  computeCameraScrollForAnchor,
  playerDisplayMotionFromKinematics,
  syncPlayerDisplay
} from './world/player.ts';
export { syncEntityDisplay } from './world/entities.ts';
export { syncObjectDisplay } from './world/objects.ts';
export { syncPickupDisplay } from './world/pickups.ts';
export { syncPetDisplay, syncPetRemainsDisplay, syncHpBars } from './world/pets.ts';

export function destroyAllDisplayObjects() {
  for (const obj of D.entityDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
    if (obj.sprite) obj.sprite.destroy();
  }
  D.entityDisplayMap.clear();
  for (const obj of D.objectDisplayMap.values()) {
    if (obj.sprite) obj.sprite.destroy();
    for (const rect of obj.collisionRects) rect.destroy();
    if (obj.labelBg) obj.labelBg.destroy();
    if (obj.labelText) obj.labelText.destroy();
  }
  D.objectDisplayMap.clear();
  for (const obj of D.petDisplayMap.values()) {
    if (obj.circle) obj.circle.destroy();
    if (obj.sprite) obj.sprite.destroy();
  }
  D.petDisplayMap.clear();
  if (D.staticBuildingsGroup) { D.staticBuildingsGroup.clear(true, true); }
}

export function rebuildDisplay() {
  if (!D.pScene) return;
  ensureTileTextures();
  destroyAllDisplayObjects();

  if (D.activeLayer) { D.activeLayer.destroy(); D.activeLayer = null; }
  if (D.activeMap) { D.activeMap.destroy(); D.activeMap = null; }

  const bounds = mapBounds();
  const mapData = state.map.map(row => row.map(cell => D.tileIndexMap[cell] ?? 0));
  D.activeMap = D.pScene.make.tilemap({ data: mapData, tileWidth: tile, tileHeight: tile });
  const tileset = D.activeMap.addTilesetImage('tiles', 'tiles', tile, tile, 0, 0);
  D.activeLayer = D.activeMap.createLayer(0, tileset, 0, 0);
  D.activeLayer.setDepth(0);

  D.pScene.cameras.main.setBounds(0, 0, bounds.w * tile, bounds.h * tile);
  D.pScene.cameras.main.stopFollow();

  if (!D.playerCircle) {
    D.playerCircle = D.pScene.add.arc(state.player.x * tile, state.player.y * tile, state.player.r, 0, 360, false, hexToInt('#f3c45b'));
    D.playerCircle.setVisible(false);
  }
  if (!D.playerSprite) {
    D.playerSprite = D.pScene.add.sprite(state.player.x * tile, state.player.y * tile, playerTextureKey('s', 'idle'));
    D.playerSprite.setOrigin(0.5, 0.88);
    D.playerSprite.setDepth(6);
  }
  D.playerSprite.setVisible(false);
  if (!D.playerRig) {
    D.playerRig = new PlayerRig(D.pScene);
  }
  // Attach physics body to player (idempotent)
  if (!D.playerCircle.body) attachCircleBody(D.playerCircle, state.player.r, true);
  // Teleport body to spawn position (overrides any leftover velocity).
  resetBody(D.playerCircle.body, state.player.x * tile, state.player.y * tile);
  resetPlayerDisplayPixel(state.player.x * tile, state.player.y * tile);

  syncCameraToPlayerAnchor();

  // Build tilemap + buildings collision now that all groups & layer exist.
  rebuildPhysicsForMap();

  syncObjectDisplay();   // creates static building bodies via group
  syncEntityDisplay();   // creates dynamic bodies for monsters/NPCs
  syncPetDisplay();
  syncPlayerDisplay();
}
