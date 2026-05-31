import { describe, expect, it } from 'vitest';
import { facingDirs, handOffsetForFacing } from '../domain/facing.ts';
import {
  playerRigDebugPointNames,
  playerRigPartNames,
  solvePlayerRigPose
} from './player-rig.ts';

describe('segmented player rig pose solver', () => {
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

  it('moves the right hand and weapon more strongly while running than walking', () => {
    for (const dir of facingDirs) {
      const idle = solvePlayerRigPose(dir, 'idle').points.rightHand;
      const walk = solvePlayerRigPose(dir, 'walk0', 0.25).points.rightHand;
      const run = solvePlayerRigPose(dir, 'run0', 0.25).points.rightHand;
      const walkDelta = Math.hypot(walk.x - idle.x, walk.y - idle.y);
      const runDelta = Math.hypot(run.x - idle.x, run.y - idle.y);
      expect(runDelta).toBeGreaterThan(walkDelta);
    }
  });

  it('returns to the same joint positions at the end of a full locomotion cycle', () => {
    for (const dir of facingDirs) {
      const start = solvePlayerRigPose(dir, 'walk0', 0).points;
      const end = solvePlayerRigPose(dir, 'walk0', 1).points;
      expect(end.rightHand.x).toBeCloseTo(start.rightHand.x, 5);
      expect(end.rightHand.y).toBeCloseTo(start.rightHand.y, 5);
      expect(end.leftFoot.x).toBeCloseTo(start.leftFoot.x, 5);
      expect(end.leftFoot.y).toBeCloseTo(start.leftFoot.y, 5);
    }
  });

  it('keeps opposite arm and leg swing during south-facing walk', () => {
    const neutral = solvePlayerRigPose('s', 'walk0', 0).points;
    const quarter = solvePlayerRigPose('s', 'walk0', 0.25).points;
    const threeQuarter = solvePlayerRigPose('s', 'walk1', 0.75).points;

    expect(quarter.rightFoot.y).toBeGreaterThan(neutral.rightFoot.y);
    expect(quarter.leftHand.y).toBeGreaterThan(neutral.leftHand.y);
    expect(quarter.rightHand.y).toBeLessThan(neutral.rightHand.y);
    expect(threeQuarter.leftFoot.y).toBeGreaterThan(neutral.leftFoot.y);
    expect(threeQuarter.rightHand.y).toBeGreaterThan(neutral.rightHand.y);
    expect(threeQuarter.leftHand.y).toBeLessThan(neutral.leftHand.y);
  });

  it('keeps the non-lifting foot stable while the torso bobs during locomotion', () => {
    const neutral = solvePlayerRigPose('e', 'walk0', 0).points;
    const quarter = solvePlayerRigPose('e', 'walk0', 0.25).points;
    const threeQuarter = solvePlayerRigPose('e', 'walk1', 0.75).points;

    expect(quarter.body.y).toBeLessThan(neutral.body.y);
    expect(threeQuarter.body.y).toBeLessThan(neutral.body.y);
    expect(quarter.leftFoot.y).toBeCloseTo(neutral.leftFoot.y, 5);
    expect(quarter.rightFoot.y).toBeLessThan(neutral.rightFoot.y);
    expect(threeQuarter.rightFoot.y).toBeCloseTo(neutral.rightFoot.y, 5);
    expect(threeQuarter.leftFoot.y).toBeLessThan(neutral.leftFoot.y);
  });

  it('eases walk foot lift at contact points instead of popping off the ground', () => {
    const start = solvePlayerRigPose('e', 'walk0', 0).points;
    const afterStart = solvePlayerRigPose('e', 'walk0', 0.001).points;
    const middle = solvePlayerRigPose('e', 'walk0', 0.5).points;
    const afterMiddle = solvePlayerRigPose('e', 'walk1', 0.501).points;

    expect(afterStart.rightFoot.y).toBeCloseTo(start.rightFoot.y, 3);
    expect(afterStart.leftFoot.y).toBeCloseTo(start.leftFoot.y, 3);
    expect(afterMiddle.rightFoot.y).toBeCloseTo(middle.rightFoot.y, 3);
    expect(afterMiddle.leftFoot.y).toBeCloseTo(middle.leftFoot.y, 3);
  });

  it('adds idle breathing without moving the foot anchor', () => {
    const start = solvePlayerRigPose('s', 'idle', 0).points;
    const breath = solvePlayerRigPose('s', 'idle', 0.25).points;
    expect(breath.body.y).toBeLessThan(start.body.y);
    expect(breath.head.y).toBeLessThan(start.head.y);
    expect(breath.foot).toEqual(start.foot);
  });

  it('keeps hips, knees, and feet still during idle breathing', () => {
    for (const dir of facingDirs) {
      const start = solvePlayerRigPose(dir, 'idle', 0).points;
      const breath = solvePlayerRigPose(dir, 'idle', 0.25).points;
      for (const point of ['rightHip', 'leftHip', 'rightKnee', 'leftKnee', 'rightFoot', 'leftFoot'] as const) {
        expect(breath[point].x).toBeCloseTo(start[point].x, 5);
        expect(breath[point].y).toBeCloseTo(start[point].y, 5);
      }
    }
  });

  it('keeps combat hand offsets separate from the animated visual hand mount', () => {
    const visualRightHand = solvePlayerRigPose('s', 'walk0', 0.25).points.rightHand;
    expect(handOffsetForFacing('s')).toEqual({ x: 8, y: -16, front: true });
    expect(handOffsetForFacing('s')).not.toMatchObject(visualRightHand);
  });
});
