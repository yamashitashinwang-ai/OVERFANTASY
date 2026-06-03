import { afterEach, describe, expect, it } from 'vitest';
import { fakeScene, importParticlesWithScene, resetParticleDisplay } from './particles.test-fixtures.ts';

describe('display particle facade', () => {
  afterEach(async () => {
    await resetParticleDisplay();
  });

  it('ignores magic particle requests while no Phaser scene is available', async () => {
    const { particles } = await importParticlesWithScene(null);

    expect(() => particles.spawnMagicEffect('fireball', 2, 3, 1, '#ff6b3d', 0.5)).not.toThrow();
  });

  it('dispatches fireball effects with tile-scaled world coordinates and burst cleanup', async () => {
    const { scene, emitters } = fakeScene();
    const { particles } = await importParticlesWithScene(scene);

    particles.spawnMagicEffect('fireball', 2, 3, 1.25, '#33aaff', 0.5);

    expect(scene.generatedTextures).toEqual(['p_dot', 'p_dot_soft', 'p_spark', 'p_leaf']);
    expect(scene.add.particles).toHaveBeenCalledTimes(1);
    const [worldX, worldY, texture, config] = scene.add.particles.mock.calls[0];
    expect(worldX).toBe(64);
    expect(worldY).toBe(96);
    expect(texture).toBe('p_dot_soft');
    expect(config.blendMode).toBe('ADD');
    expect(config.tint[0]).toBe(0x33aaff);
    expect(config.emitZone.source.radius).toBeCloseTo(24);
    expect(emitters[0].setDepth).toHaveBeenCalledWith(9);
    expect(emitters[0].explode).toHaveBeenCalledWith(18);
    expect(scene.delayedCallbacks.map(item => item.ms)).toEqual([500, 1180]);

    scene.delayedCallbacks[0].callback();
    scene.delayedCallbacks[1].callback();

    expect(emitters[0].stop).toHaveBeenCalledTimes(1);
    expect(emitters[0].destroy).toHaveBeenCalledTimes(1);
  });

  it('spawns magic particles from runtime magic effect events', async () => {
    const { scene } = fakeScene();
    await importParticlesWithScene(scene);
    const { bus, Events } = await import('../runtime/events.ts');

    bus.emit(Events.MAGIC_EFFECT_SPAWNED, {
      spellId: 'fireball',
      x: 2,
      y: 3,
      radius: 1.25,
      color: '#33aaff',
      duration: 0.5
    });

    expect(scene.add.particles).toHaveBeenCalledTimes(1);
    const [worldX, worldY, texture, config] = scene.add.particles.mock.calls[0];
    expect(worldX).toBe(64);
    expect(worldY).toBe(96);
    expect(texture).toBe('p_dot_soft');
    expect(config.tint[0]).toBe(0x33aaff);
  });

  it('dispatches thunder effects to the spark burst spawner', async () => {
    const { scene, emitters } = fakeScene();
    const { particles } = await importParticlesWithScene(scene);

    particles.spawnMagicEffect('thunderFlash', 1, 2, 1, '#ffffff', 1);

    const [worldX, worldY, texture, config] = scene.add.particles.mock.calls[0];
    expect(worldX).toBe(32);
    expect(worldY).toBe(64);
    expect(texture).toBe('p_spark');
    expect(config.blendMode).toBe('ADD');
    expect(config.emitZone.source.radius).toBeCloseTo(9.6);
    expect(emitters[0].explode).toHaveBeenCalledWith(28);
    expect(scene.delayedCallbacks[0].ms).toBe(600);
  });

  it('routes unknown spell ids through the generic magic burst', async () => {
    const { scene, emitters } = fakeScene();
    const { particles } = await importParticlesWithScene(scene);

    particles.spawnMagicEffect('unknownSpell', 4, 5, 0.5, '#d9d4ff', 0.75);

    const [worldX, worldY, texture, config] = scene.add.particles.mock.calls[0];
    expect(worldX).toBe(128);
    expect(worldY).toBe(160);
    expect(texture).toBe('p_dot_soft');
    expect(config.tint).toEqual([0xd9d4ff, 0xffffff]);
    expect(config.emitZone.source.radius).toBe(8);
    expect(emitters[0].explode).toHaveBeenCalledWith(18);
    expect(scene.delayedCallbacks[0].ms).toBe(800);
  });
});
