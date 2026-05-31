import { describe, expect, it } from 'vitest';
import {
  playerLocomotionCycleProgress,
  playerLocomotionPose,
  playerRunCycleSeconds,
  playerWalkCycleSeconds
} from './player-animation-timing.ts';

describe('player locomotion animation timing', () => {
  it('uses 0.628s as one full walk joint cycle', () => {
    expect(playerLocomotionPose(0, false)).toBe('walk0');
    expect(playerLocomotionPose(playerWalkCycleSeconds / 2, false)).toBe('walk1');
    expect(playerLocomotionPose(playerWalkCycleSeconds, false)).toBe('walk0');
    expect(playerLocomotionCycleProgress(0, false)).toBe(0);
    expect(playerLocomotionCycleProgress(playerWalkCycleSeconds / 2, false)).toBeCloseTo(0.5);
    expect(playerLocomotionCycleProgress(playerWalkCycleSeconds, false)).toBe(0);
  });

  it('uses 0.518s as one full run joint cycle', () => {
    expect(playerLocomotionPose(0, true)).toBe('run0');
    expect(playerLocomotionPose(playerRunCycleSeconds / 2, true)).toBe('run1');
    expect(playerLocomotionPose(playerRunCycleSeconds, true)).toBe('run0');
    expect(playerLocomotionCycleProgress(0, true)).toBe(0);
    expect(playerLocomotionCycleProgress(playerRunCycleSeconds / 2, true)).toBeCloseTo(0.5);
    expect(playerLocomotionCycleProgress(playerRunCycleSeconds, true)).toBe(0);
  });
});
