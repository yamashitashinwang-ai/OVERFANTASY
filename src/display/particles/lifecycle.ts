import type Phaser from 'phaser';
import { display as D } from '../runtime.ts';

export function scheduleEmitterCleanup(emitter: Phaser.GameObjects.Particles.ParticleEmitter, totalMs: number) {
  if (!D.pScene) return;
  D.pScene.time.delayedCall(totalMs, () => {
    if (emitter && emitter.scene) emitter.destroy();
  });
}
