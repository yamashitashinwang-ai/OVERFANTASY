import type { PlayerPose } from './placeholder-art.ts';

export const playerWalkCycleSeconds = 0.628;
export const playerRunCycleSeconds = 0.518;
export const playerIdleBreathCycleSeconds = 1.8;

const cycleSecondsFor = (running: boolean) => running ? playerRunCycleSeconds : playerWalkCycleSeconds;

export function playerCycleProgress(timeSeconds: number, cycleSeconds: number) {
  return ((timeSeconds % cycleSeconds) + cycleSeconds) % cycleSeconds / cycleSeconds;
}

export function playerIdleCycleProgress(timeSeconds: number) {
  return playerCycleProgress(timeSeconds, playerIdleBreathCycleSeconds);
}

export function playerLocomotionCycleProgress(timeSeconds: number, running: boolean) {
  return playerCycleProgress(timeSeconds, cycleSecondsFor(running));
}

export function playerLocomotionPhase(timeSeconds: number, running: boolean): 0 | 1 {
  const phaseSeconds = cycleSecondsFor(running) / 2;
  return (Math.floor(timeSeconds / phaseSeconds) % 2) as 0 | 1;
}

export function playerLocomotionPose(timeSeconds: number, running: boolean): PlayerPose {
  const phase = playerLocomotionPhase(timeSeconds, running);
  if (running) return phase === 0 ? 'run0' : 'run1';
  return phase === 0 ? 'walk0' : 'walk1';
}
