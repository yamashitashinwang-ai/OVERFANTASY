import { describe, expect, it } from 'vitest';
import { facingDirs, playerMountOffsetsForFacing } from '../domain/facing.ts';
import { playerRigDebugPointNames, playerRigPartNames, solvePlayerRigPose } from './player-rig.ts';

describe('segmented player rig structure and layering', () => {
  it('builds a complete part and debug-point pose for every facing direction', () => {
    for (const dir of facingDirs) {
      const solved = solvePlayerRigPose(dir, 'idle');
      for (const part of playerRigPartNames) {
        expect(solved.parts[part]).toEqual(expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          rotation: expect.any(Number),
          scaleX: expect.any(Number),
          scaleY: expect.any(Number),
          depth: expect.any(Number)
        }));
      }
      for (const point of playerRigDebugPointNames) {
        expect(solved.points[point]).toEqual(expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        }));
      }
    }
  });

  it('keeps the weapon visual mount bound to the semantic right hand', () => {
    for (const dir of facingDirs) {
      for (const pose of ['idle', 'walk0', 'walk1', 'run0', 'run1'] as const) {
        const solved = solvePlayerRigPose(dir, pose);
        expect(solved.points.weapon).toEqual(solved.points.rightHand);
      }
    }
  });

  it('raises only the arm attachment chain relative to the torso', () => {
    const liftY = -3;
    const idleHandDrift = Math.sin(Math.PI * 0.35) * 0.35;
    for (const dir of facingDirs) {
      const base = playerMountOffsetsForFacing(dir);
      const solved = solvePlayerRigPose(dir, 'idle', 0).points;

      expect(solved.body).toEqual(base.body);
      expect(solved.foot).toEqual(base.foot);
      expect(solved.rightShoulder.x).toBeCloseTo(base.rightShoulder.x, 5);
      expect(solved.leftShoulder.x).toBeCloseTo(base.leftShoulder.x, 5);
      expect(solved.rightShoulder.y).toBeCloseTo(base.rightShoulder.y + liftY, 5);
      expect(solved.leftShoulder.y).toBeCloseTo(base.leftShoulder.y + liftY, 5);
      expect(solved.rightHand.y).toBeCloseTo(base.rightHand.y + liftY + idleHandDrift, 5);
      expect(solved.leftHand.y).toBeCloseTo(base.leftHand.y + liftY - idleHandDrift, 5);
    }
  });

  it('layers the far arm behind and near arm in front while facing left or right', () => {
    for (const dir of ['nw', 'w', 'sw'] as const) {
      const parts = solvePlayerRigPose(dir, 'idle').parts;
      expect(parts.rightUpperArm.depth).toBeLessThan(parts.torso.depth);
      expect(parts.rightForearm.depth).toBeLessThan(parts.torso.depth);
      expect(parts.rightHand.depth).toBeLessThan(parts.torso.depth);
      expect(parts.leftUpperArm.depth).toBeGreaterThan(parts.torso.depth);
      expect(parts.leftForearm.depth).toBeGreaterThan(parts.torso.depth);
      expect(parts.leftHand.depth).toBeGreaterThan(parts.torso.depth);
    }

    for (const dir of ['ne', 'e', 'se'] as const) {
      const parts = solvePlayerRigPose(dir, 'idle').parts;
      expect(parts.leftUpperArm.depth).toBeLessThan(parts.torso.depth);
      expect(parts.leftForearm.depth).toBeLessThan(parts.torso.depth);
      expect(parts.leftHand.depth).toBeLessThan(parts.torso.depth);
      expect(parts.rightUpperArm.depth).toBeGreaterThan(parts.torso.depth);
      expect(parts.rightForearm.depth).toBeGreaterThan(parts.torso.depth);
      expect(parts.rightHand.depth).toBeGreaterThan(parts.torso.depth);
    }
  });

  it('uses the right hand layer for the held weapon layer', () => {
    for (const dir of facingDirs) {
      const solved = solvePlayerRigPose(dir, 'idle');
      expect(solved.weaponFront).toBe(solved.parts.rightHand.depth > solved.parts.torso.depth);
    }

    for (const dir of ['nw', 'w', 'sw'] as const) {
      expect(solvePlayerRigPose(dir, 'idle').weaponFront).toBe(false);
    }

    for (const dir of ['ne', 'e', 'se'] as const) {
      expect(solvePlayerRigPose(dir, 'idle').weaponFront).toBe(true);
    }
  });
});
