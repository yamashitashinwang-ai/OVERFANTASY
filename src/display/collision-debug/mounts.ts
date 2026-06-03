import type Phaser from 'phaser';
import { display as D } from '../runtime.ts';
import { playerLocomotionPose } from '../player-animation-timing.ts';
import { currentPlayerMagicCastVisual } from '../animations.ts';
import { hexToInt } from '../colors.ts';
import { state, runtime } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { isFacingDir, playerAnimatedMountOffsetsForFacing } from '../../domain/facing.ts';
import type { PlayerMountPose } from '../../domain/facing.ts';
import { drawMountMarker } from './geometry.ts';

function currentPlayerMountPose(): PlayerMountPose {
  const body = D.playerCircle?.body as { velocity?: { x?: number; y?: number } } | null | undefined;
  const speed = Math.hypot(body?.velocity?.x ?? 0, body?.velocity?.y ?? 0);
  const moving = speed > 1 || state.player.running;
  if (!moving) return 'idle';
  return playerLocomotionPose(state.time, state.player.running);
}

export function drawPlayerMounts(g: Phaser.GameObjects.Graphics) {
  const rigPoints = D.playerRig?.debugPointsWorld();
  if (rigPoints) {
    g.lineStyle(1, 0xffffff, 0.35);
    g.lineBetween(rigPoints.body.x, rigPoints.body.y, rigPoints.rightShoulder.x, rigPoints.rightShoulder.y);
    g.lineBetween(rigPoints.rightShoulder.x, rigPoints.rightShoulder.y, rigPoints.rightElbow.x, rigPoints.rightElbow.y);
    g.lineBetween(rigPoints.rightElbow.x, rigPoints.rightElbow.y, rigPoints.rightHand.x, rigPoints.rightHand.y);
    g.lineBetween(rigPoints.body.x, rigPoints.body.y, rigPoints.leftShoulder.x, rigPoints.leftShoulder.y);
    g.lineBetween(rigPoints.leftShoulder.x, rigPoints.leftShoulder.y, rigPoints.leftElbow.x, rigPoints.leftElbow.y);
    g.lineBetween(rigPoints.leftElbow.x, rigPoints.leftElbow.y, rigPoints.leftHand.x, rigPoints.leftHand.y);
    g.lineBetween(rigPoints.body.x, rigPoints.body.y, rigPoints.rightHip.x, rigPoints.rightHip.y);
    g.lineBetween(rigPoints.rightHip.x, rigPoints.rightHip.y, rigPoints.rightKnee.x, rigPoints.rightKnee.y);
    g.lineBetween(rigPoints.rightKnee.x, rigPoints.rightKnee.y, rigPoints.rightFoot.x, rigPoints.rightFoot.y);
    g.lineBetween(rigPoints.body.x, rigPoints.body.y, rigPoints.leftHip.x, rigPoints.leftHip.y);
    g.lineBetween(rigPoints.leftHip.x, rigPoints.leftHip.y, rigPoints.leftKnee.x, rigPoints.leftKnee.y);
    g.lineBetween(rigPoints.leftKnee.x, rigPoints.leftKnee.y, rigPoints.leftFoot.x, rigPoints.leftFoot.y);
    g.lineStyle(1, 0xff7bd5, 0.48);
    g.lineBetween(rigPoints.rightHand.x, rigPoints.rightHand.y, rigPoints.weapon.x, rigPoints.weapon.y);

    drawMountMarker(g, rigPoints.foot.x, rigPoints.foot.y, 0x55e6ff, 2.5);
    g.lineStyle(1, 0x55e6ff, 0.9);
    g.lineBetween(rigPoints.foot.x - 5, rigPoints.foot.y, rigPoints.foot.x + 5, rigPoints.foot.y);
    g.lineBetween(rigPoints.foot.x, rigPoints.foot.y - 5, rigPoints.foot.x, rigPoints.foot.y + 5);
    drawMountMarker(g, rigPoints.body.x, rigPoints.body.y, 0xffffff, 2.5);
    drawMountMarker(g, rigPoints.head.x, rigPoints.head.y, 0xf7d2a9, 2.5);
    drawMountMarker(g, rigPoints.rightShoulder.x, rigPoints.rightShoulder.y, 0xf3c45b, 2.8);
    drawMountMarker(g, rigPoints.rightElbow.x, rigPoints.rightElbow.y, 0xf6a93b, 2.4);
    drawMountMarker(g, rigPoints.rightHand.x, rigPoints.rightHand.y, 0x7cff8a, 3);
    drawMountMarker(g, rigPoints.leftShoulder.x, rigPoints.leftShoulder.y, 0x88bfff, 2.8);
    drawMountMarker(g, rigPoints.leftElbow.x, rigPoints.leftElbow.y, 0x6ca8ff, 2.4);
    drawMountMarker(g, rigPoints.leftHand.x, rigPoints.leftHand.y, 0x88bfff, 3);
    drawMountMarker(g, rigPoints.rightHip.x, rigPoints.rightHip.y, 0xffc66d, 2.3);
    drawMountMarker(g, rigPoints.rightKnee.x, rigPoints.rightKnee.y, 0xffd78a, 2.3);
    drawMountMarker(g, rigPoints.rightFoot.x, rigPoints.rightFoot.y, 0xffe4a8, 2.6);
    drawMountMarker(g, rigPoints.leftHip.x, rigPoints.leftHip.y, 0x9ed6ff, 2.3);
    drawMountMarker(g, rigPoints.leftKnee.x, rigPoints.leftKnee.y, 0xaedfff, 2.3);
    drawMountMarker(g, rigPoints.leftFoot.x, rigPoints.leftFoot.y, 0xc4e9ff, 2.6);
    drawMountMarker(g, rigPoints.weapon.x, rigPoints.weapon.y, 0xff7bd5, 3.4);
    const cast = currentPlayerMagicCastVisual();
    if (cast) {
      const color = cast.color || hexToInt('#d9d4ff');
      g.lineStyle(2, color, 0.9);
      g.strokeCircle(rigPoints.leftHand.x, rigPoints.leftHand.y, cast.stage === 'charge' ? 8 : 12);
      g.lineStyle(1, color, 0.55);
      g.lineBetween(rigPoints.leftShoulder.x, rigPoints.leftShoulder.y, rigPoints.leftHand.x, rigPoints.leftHand.y);
    }
    return;
  }

  const facing = isFacingDir(runtime.facingDirection)
    ? runtime.facingDirection
    : isFacingDir(runtime.aimDirection)
      ? runtime.aimDirection
      : 's';
  const mounts = playerAnimatedMountOffsetsForFacing(facing, currentPlayerMountPose());
  const playerObj = D.playerCircle as (Phaser.GameObjects.GameObject & { x?: number; y?: number }) | null;
  const baseX = playerObj?.x ?? state.player.x * tile;
  const baseY = playerObj?.y ?? state.player.y * tile;
  const foot = { x: baseX + mounts.foot.x, y: baseY + mounts.foot.y };
  const body = { x: baseX + mounts.body.x, y: baseY + mounts.body.y };
  const rightShoulder = { x: baseX + mounts.rightShoulder.x, y: baseY + mounts.rightShoulder.y };
  const rightHand = { x: baseX + mounts.rightHand.x, y: baseY + mounts.rightHand.y };
  const leftHand = { x: baseX + mounts.leftHand.x, y: baseY + mounts.leftHand.y };
  const weapon = { x: baseX + mounts.weapon.x, y: baseY + mounts.weapon.y };

  g.lineStyle(1, 0xffffff, 0.35);
  g.lineBetween(body.x, body.y, rightShoulder.x, rightShoulder.y);
  g.lineBetween(rightShoulder.x, rightShoulder.y, rightHand.x, rightHand.y);
  g.lineBetween(body.x, body.y, leftHand.x, leftHand.y);
  g.lineStyle(1, 0xff7bd5, 0.48);
  g.lineBetween(rightHand.x, rightHand.y, weapon.x, weapon.y);

  drawMountMarker(g, foot.x, foot.y, 0x55e6ff, 2.5);
  g.lineStyle(1, 0x55e6ff, 0.9);
  g.lineBetween(foot.x - 5, foot.y, foot.x + 5, foot.y);
  g.lineBetween(foot.x, foot.y - 5, foot.x, foot.y + 5);
  drawMountMarker(g, body.x, body.y, 0xffffff, 2.5);
  drawMountMarker(g, rightShoulder.x, rightShoulder.y, 0xf3c45b, 2.8);
  drawMountMarker(g, rightHand.x, rightHand.y, 0x7cff8a, 3);
  drawMountMarker(g, leftHand.x, leftHand.y, 0x88bfff, 3);
  drawMountMarker(g, weapon.x, weapon.y, 0xff7bd5, 3.4);
}
