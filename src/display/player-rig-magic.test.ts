import { describe, expect, it } from 'vitest';
import { facingDirs } from '../domain/facing.ts';
import { solvePlayerRigPose } from './player-rig.ts';

describe('segmented player rig magic-casting overlay', () => {
  it('overlays magic casting on the left hand without moving the right-hand weapon mount', () => {
    for (const dir of facingDirs) {
      const base = solvePlayerRigPose(dir, 'walk0', 0.25).points;
      const casting = solvePlayerRigPose(dir, 'walk0', 0.25, { stage: 'charge', progress: 1 }).points;

      expect(casting.leftHand.y).toBeLessThan(base.leftHand.y);
      expect(casting.rightHand.x).toBeCloseTo(base.rightHand.x, 5);
      expect(casting.rightHand.y).toBeCloseTo(base.rightHand.y, 5);
      expect(casting.weapon).toEqual(casting.rightHand);
    }
  });

  it('keeps locomotion legs intact while magic casting overlays the left arm', () => {
    const walking = solvePlayerRigPose('s', 'walk0', 0.25).points;
    const casting = solvePlayerRigPose('s', 'walk0', 0.25, { stage: 'charge', progress: 1 }).points;

    expect(casting.rightFoot).toEqual(walking.rightFoot);
    expect(casting.leftFoot).toEqual(walking.leftFoot);
    expect(casting.body).toEqual(walking.body);
    expect(casting.leftHand).not.toEqual(walking.leftHand);
  });

  it('keeps walk/run locomotion under the magic release overlay', () => {
    for (const pose of ['walk0', 'walk1', 'run0', 'run1'] as const) {
      const moving = solvePlayerRigPose('s', pose, 0.33).points;
      const releasing = solvePlayerRigPose('s', pose, 0.33, { stage: 'release', progress: 0.5 }).points;
      const released = solvePlayerRigPose('s', pose, 0.33, { stage: 'release', progress: 1 }).points;

      expect(releasing.body).toEqual(moving.body);
      expect(releasing.rightFoot).toEqual(moving.rightFoot);
      expect(releasing.leftFoot).toEqual(moving.leftFoot);
      expect(releasing.rightHand).toEqual(moving.rightHand);
      expect(releasing.weapon).toEqual(moving.weapon);
      expect(releasing.leftHand).not.toEqual(moving.leftHand);
      expect(released.leftHand.x).toBeCloseTo(moving.leftHand.x, 5);
      expect(released.leftHand.y).toBeCloseTo(moving.leftHand.y, 5);
    }
  });

  it('moves the magic casting left hand downward during release', () => {
    const charge = solvePlayerRigPose('s', 'idle', 0, { stage: 'charge', progress: 1 }).points;
    const release = solvePlayerRigPose('s', 'idle', 0, { stage: 'release', progress: 1 }).points;

    expect(release.leftHand.y).toBeGreaterThan(charge.leftHand.y);
    expect(release.weapon).toEqual(release.rightHand);
  });
});
