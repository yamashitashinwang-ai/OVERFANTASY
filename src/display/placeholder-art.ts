// Generated placeholder art. These textures are deliberately simple and live
// in code so gameplay data, collision, and visual size stay separate.

import type Phaser from 'phaser';
import {
  drawDemonKnight,
  drawGargoyle,
  drawNpc,
  drawPet,
  drawRabbit,
  drawSkeleton,
  drawSlime,
  drawTreant,
  drawWisp,
  drawWolf
} from './placeholder-art/actors.ts';
import {
  actorDirs,
  playerPoses,
  playerRigTextureKey,
  playerRigTextureParts,
  playerTextureKey
} from './placeholder-art/keys.ts';
import { drawObjectTexture } from './placeholder-art/objects.ts';
import {
  drawHumanoid,
  drawRigPartTexture,
  playerRigTextureSize,
  playerTextureH,
  playerTextureW
} from './placeholder-art/player.ts';
import { makeTexture } from './placeholder-art/texture.ts';

export type {
  FacingDir,
  PlayerPose,
  PlayerRigTexturePart,
  ReservedPlayerAttackAnimationName
} from './placeholder-art/types.ts';
export {
  dirVector,
  entityTextureKey,
  facingFromDelta,
  objectTextureKey,
  petTextureKey,
  playerRigTextureKey,
  playerTextureKey,
  reservedPlayerAttackAnimationNames
} from './placeholder-art/keys.ts';
export { drawTileCell } from './placeholder-art/tiles.ts';

export function ensurePlaceholderArt(scene: Phaser.Scene) {
  for (const monsterForm of [false, true]) {
    for (const dir of actorDirs) {
      for (const pose of playerPoses) {
        makeTexture(scene, playerTextureKey(dir, pose, monsterForm), playerTextureW, playerTextureH, g =>
          drawHumanoid(g, monsterForm ? 0x5d327d : 0x3f78c7, monsterForm ? 0xd986ff : 0xf3c45b, 0x101317, dir, pose, monsterForm)
        );
      }
    }
    for (const part of playerRigTextureParts) {
      const size = playerRigTextureSize(part);
      makeTexture(scene, playerRigTextureKey(part, monsterForm), size.w, size.h, g => drawRigPartTexture(g, part, monsterForm));
    }
  }

  [
    ['of:npc:human', 0x407cb5, 0xf3c45b, false],
    ['of:npc:elf', 0x56a66d, 0xcff4b4, false],
    ['of:npc:dwarf', 0xa76b38, 0xe1b178, false],
    ['of:npc:wounded', 0x8f4f45, 0xff8f70, true]
  ].forEach(([key, base, trim, wounded]) => {
    makeTexture(scene, key as string, 40, 54, g => drawNpc(g, base as number, trim as number, wounded as boolean));
  });

  makeTexture(scene, 'of:creature:treant', 44, 52, drawTreant);
  makeTexture(scene, 'of:creature:rabbit', 44, 48, drawRabbit);
  makeTexture(scene, 'of:monster:slime', 44, 50, drawSlime);
  makeTexture(scene, 'of:monster:wolf', 44, 50, drawWolf);
  makeTexture(scene, 'of:monster:skeleton', 44, 52, drawSkeleton);
  makeTexture(scene, 'of:monster:wisp', 44, 52, drawWisp);
  makeTexture(scene, 'of:monster:gargoyle', 44, 52, drawGargoyle);
  makeTexture(scene, 'of:monster:demonKnight', 44, 52, drawDemonKnight);
  makeTexture(scene, 'of:pet:default', 44, 48, g => drawPet(g, 'default'));
  makeTexture(scene, 'of:pet:wolf', 44, 48, g => drawPet(g, 'wolf'));
  makeTexture(scene, 'of:pet:treant', 44, 52, g => drawPet(g, 'treant'));
  makeTexture(scene, 'of:pet:injured', 44, 48, g => drawPet(g, 'injured'));

  ['shop', 'guild', 'forge', 'shrine', 'magic', 'house', 'roadSign', 'ruinsGate', 'demonGate', 'dungeon', 'tree', 'bush', 'leafPile', 'windFlag', 'default']
    .forEach(kind => makeTexture(scene, `of:object:${kind}`, 64, 64, g => drawObjectTexture(g, kind)));
}
