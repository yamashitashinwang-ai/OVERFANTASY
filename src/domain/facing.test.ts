import { describe, expect, it } from 'vitest';
import {
  facingDirs,
  handOffsetForFacing,
  playerAnimatedMountOffsetsForFacing,
  playerMountOffsetsForFacing
} from './facing.ts';

describe('player action-ready mount offsets', () => {
  it('provides foot, body, hand, and weapon mounts for every facing direction', () => {
    for (const dir of facingDirs) {
      const mounts = playerMountOffsetsForFacing(dir);
      expect(mounts.foot).toEqual({ x: 0, y: 0 });
      expect(mounts.body.y).toBeLessThan(mounts.foot.y);
      expect(mounts.mainHand).toBe(mounts.rightHand);
      expect(mounts.offHand).toBe(mounts.leftHand);
      expect(Math.hypot(mounts.rightShoulder.x - mounts.body.x, mounts.rightShoulder.y - mounts.body.y)).toBeGreaterThan(5);
      expect(Math.hypot(mounts.rightHand.x - mounts.body.x, mounts.rightHand.y - mounts.body.y)).toBeGreaterThan(5);
      expect(Math.hypot(mounts.leftHand.x - mounts.body.x, mounts.leftHand.y - mounts.body.y)).toBeGreaterThan(5);
      expect(Math.hypot(mounts.weapon.x, mounts.weapon.y)).toBeGreaterThan(10);
    }
  });

  it('binds the weapon mount to the semantic right hand for every facing', () => {
    for (const dir of facingDirs) {
      expect(playerMountOffsetsForFacing(dir).weapon).toMatchObject(playerMountOffsetsForFacing(dir).rightHand);
    }
  });

  it('keeps combat hand offsets separate from visual arm swing mounts', () => {
    expect(handOffsetForFacing('s')).toEqual({ x: 8, y: -16, front: true });
    expect(handOffsetForFacing('n')).toEqual({ x: -7, y: -27, front: false });
  });

  it('animates the right hand and weapon together around the right shoulder', () => {
    for (const dir of facingDirs) {
      const idle = playerAnimatedMountOffsetsForFacing(dir, 'idle');
      const walk0 = playerAnimatedMountOffsetsForFacing(dir, 'walk0');
      const walk1 = playerAnimatedMountOffsetsForFacing(dir, 'walk1');
      const run0 = playerAnimatedMountOffsetsForFacing(dir, 'run0');
      const shoulderRadius = Math.hypot(idle.rightHand.x - idle.rightShoulder.x, idle.rightHand.y - idle.rightShoulder.y);
      const walkRadius = Math.hypot(walk0.rightHand.x - walk0.rightShoulder.x, walk0.rightHand.y - walk0.rightShoulder.y);
      const runDelta = Math.hypot(run0.rightHand.x - idle.rightHand.x, run0.rightHand.y - idle.rightHand.y);
      const walkDelta = Math.hypot(walk0.rightHand.x - idle.rightHand.x, walk0.rightHand.y - idle.rightHand.y);

      expect(walk0.weapon).toMatchObject(walk0.rightHand);
      expect(walk1.weapon).toMatchObject(walk1.rightHand);
      expect(Math.abs(walkRadius - shoulderRadius)).toBeLessThan(0.01);
      expect(Math.hypot(walk0.rightHand.x - walk1.rightHand.x, walk0.rightHand.y - walk1.rightHand.y)).toBeGreaterThan(1);
      expect(runDelta).toBeGreaterThan(walkDelta);
    }
  });
});
