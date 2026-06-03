import { display as D } from '../../runtime.ts';
import {
  playerIdleCycleProgress,
  playerLocomotionCycleProgress,
  playerLocomotionPose
} from '../../player-animation-timing.ts';
import { playerTextureKey } from '../../placeholder-art.ts';
import type { PlayerPose } from '../../placeholder-art.ts';
import { currentPlayerPoseOverride, currentPlayerMagicCastVisual, playerVisualAdjust } from '../../animations.ts';
import { state } from '../../../runtime/state.ts';
import { currentWeapon } from '../../../domain/combat/weapon.ts';
import { syncCameraToPlayerAnchor } from './camera.ts';
import { currentPlayerFacing, syncPlayerFacingFromAim } from './facing.ts';
import { currentPlayerDisplayMotion, rememberPlayerDisplayPixel } from './motion.ts';
import { syncCorruptionAura } from './aura.ts';

export function syncPlayerDisplay() {
  if (!D.playerCircle) return;
  const p = state.player;
  D.playerCircle.setVisible(false);
  const displayMotion = currentPlayerDisplayMotion(p.running);
  const moving = displayMotion.moving;
  syncCameraToPlayerAnchor();
  syncPlayerFacingFromAim(displayMotion.facingDx, displayMotion.facingDy);
  const playerFacing = currentPlayerFacing();
  const basePose: PlayerPose = moving ? playerLocomotionPose(state.time, p.running) : 'idle';
  const pose = currentPlayerPoseOverride() || basePose;
  const magicCast = currentPlayerMagicCastVisual();
  const animationProgress = moving
    ? playerLocomotionCycleProgress(state.time, p.running)
    : playerIdleCycleProgress(state.time);
  const visual = playerVisualAdjust(playerFacing);
  const invulnOffsetY = p.invuln > 0 ? Math.sin(state.time * 28) * 1.5 : 0;
  let tint: number | null = null;
  if (visual.tint) tint = visual.tint;
  else if (p.blockTimer > 0) tint = 0x9ed6ff;
  else if (currentWeapon().name === '剑的概念') tint = 0xfff4b0;

  if (D.playerSprite) {
    D.playerSprite.setTexture(playerTextureKey(playerFacing, pose, !!p.monsterForm));
    D.playerSprite.setPosition(
      D.playerCircle.x + visual.offsetX,
      D.playerCircle.y + visual.offsetY + invulnOffsetY
    );
    D.playerSprite.setScale(visual.scale);
    D.playerSprite.setDepth(6 + D.playerCircle.y / 100000);
    D.playerSprite.setVisible(false);
    if (tint) D.playerSprite.setTint(tint);
    else D.playerSprite.clearTint();
  }
  D.playerRig?.sync({
    x: D.playerCircle.x,
    y: D.playerCircle.y,
    facing: playerFacing,
    pose,
    animationProgress,
    magicCast,
    monsterForm: !!p.monsterForm,
    visualOffsetX: visual.offsetX,
    visualOffsetY: visual.offsetY + invulnOffsetY,
    visualScale: visual.scale,
    tint,
    depth: 6 + D.playerCircle.y / 100000
  });
  rememberPlayerDisplayPixel();
  syncCorruptionAura();
}
