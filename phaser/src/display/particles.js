// Particle-emitter-driven spell visuals. Replaces the per-frame Graphics
// repainting in effects.js with Phaser's particle system: emit zones, lifespan,
// alpha + scale curves, and automatic cleanup all live in the engine.

import Phaser from 'phaser';
import { display as D } from './runtime.js';
import { hexToInt } from './colors.js';
import { tile } from '../scenes/Game.js';

// ── Particle textures (generated once on first use) ──────────────────────────

let texturesReady = false;

function ensureParticleTextures() {
  if (texturesReady || !D.pScene) return;
  const tex = D.pScene.textures;
  if (!tex.exists('p_dot')) {
    const g = D.pScene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 6);
    g.generateTexture('p_dot', 16, 16);
    g.destroy();
  }
  if (!tex.exists('p_dot_soft')) {
    const g = D.pScene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 3);
    g.generateTexture('p_dot_soft', 16, 16);
    g.destroy();
  }
  if (!tex.exists('p_spark')) {
    const g = D.pScene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(8, 1, 15, 8, 8, 15);
    g.fillTriangle(8, 1, 1, 8, 8, 15);
    g.generateTexture('p_spark', 16, 16);
    g.destroy();
  }
  if (!tex.exists('p_leaf')) {
    const g = D.pScene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    // diamond/leaf shape
    g.fillTriangle(8, 1, 15, 8, 8, 15);
    g.fillTriangle(8, 1, 1, 8, 8, 15);
    g.generateTexture('p_leaf', 16, 16);
    g.destroy();
  }
  texturesReady = true;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scheduleEmitterCleanup(emitter, totalMs) {
  if (!D.pScene) return;
  D.pScene.time.delayedCall(totalMs, () => {
    if (emitter && emitter.scene) emitter.destroy();
  });
}

// ── Spell-specific spawners ──────────────────────────────────────────────────

export function spawnColdParticles(worldX, worldY, radius, durationSec) {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const lifespan = 1100;
  const totalMs = durationSec * 1000;
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_dot_soft', {
    lifespan: { min: 800, max: lifespan },
    speed: { min: 6, max: 18 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 0.85, end: 0 },
    quantity: 2,
    frequency: 35,
    tint: [0xdcf5ff, 0xa9d7ff, 0xffffff],
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.95) }
  });
  emitter.setDepth(9);
  // Stop emitting after duration; leave existing particles to fade naturally.
  D.pScene.time.delayedCall(totalMs, () => emitter.stop && emitter.stop());
  scheduleEmitterCleanup(emitter, totalMs + lifespan + 200);
}

export function spawnThunderParticles(worldX, worldY, radius) {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_spark', {
    lifespan: 320,
    speed: { min: 180, max: 360 },
    scale: { start: 0.9, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [0xffffff, 0xfff4b0, 0xb5e0ff],
    blendMode: Phaser.BlendModes.ADD,
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.3) }
  });
  emitter.setDepth(9);
  emitter.explode(28);
  scheduleEmitterCleanup(emitter, 600);
}

export function spawnLeafCutterParticles(worldX, worldY, radius, durationSec) {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const lifespan = 420;
  const totalMs = durationSec * 1000;
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_leaf', {
    lifespan: { min: 240, max: lifespan },
    speedX: { min: 180, max: 320 },
    speedY: { min: -50, max: 50 },
    scale: { start: 0.7, end: 0.2 },
    alpha: { start: 1, end: 0 },
    rotate: { start: 0, end: 360 },
    tint: [0x9cd870, 0x5fbb50, 0xc7e7a5],
    quantity: 3,
    frequency: 22,
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.4) }
  });
  emitter.setDepth(9);
  D.pScene.time.delayedCall(totalMs, () => emitter.stop && emitter.stop());
  scheduleEmitterCleanup(emitter, totalMs + lifespan + 100);
}

export function spawnFireParticles(worldX, worldY, radius, durationSec, baseColor = '#ff6b3d') {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const lifespan = 480;
  const totalMs = Math.max(120, durationSec * 1000);
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_dot_soft', {
    lifespan: { min: 220, max: lifespan },
    speed: { min: 30, max: 90 },
    scale: { start: 1.0, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [hexToInt(baseColor), 0xffd066, 0xff3019],
    blendMode: Phaser.BlendModes.ADD,
    quantity: 4,
    frequency: 22,
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.6) }
  });
  emitter.setDepth(9);
  // Initial pop:
  emitter.explode(18);
  D.pScene.time.delayedCall(totalMs, () => emitter.stop && emitter.stop());
  scheduleEmitterCleanup(emitter, totalMs + lifespan + 200);
}

export function spawnHealParticles(worldX, worldY, radius) {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_dot_soft', {
    lifespan: 720,
    speed: { min: 20, max: 60 },
    angle: { min: 240, max: 300 },
    scale: { start: 0.7, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [0x9cf0a3, 0xffffff, 0x62c78f],
    blendMode: Phaser.BlendModes.ADD,
    quantity: 3,
    frequency: 40,
    duration: 600,
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.8) }
  });
  emitter.setDepth(9);
  scheduleEmitterCleanup(emitter, 1400);
}

export function spawnGenericMagicBurst(worldX, worldY, radius, colorHex = '#d9d4ff') {
  if (!D.pScene) return;
  ensureParticleTextures();
  const r = radius * tile;
  const emitter = D.pScene.add.particles(worldX, worldY, 'p_dot_soft', {
    lifespan: 520,
    speed: { min: 40, max: 130 },
    scale: { start: 0.7, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [hexToInt(colorHex), 0xffffff],
    blendMode: Phaser.BlendModes.ADD,
    emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, r * 0.5) }
  });
  emitter.setDepth(9);
  emitter.explode(18);
  scheduleEmitterCleanup(emitter, 800);
}

// ── Dispatcher invoked by startMagicEffect ───────────────────────────────────

export function spawnMagicEffect(spellId, x, y, radius, color, durationSec) {
  const wx = x * tile;
  const wy = y * tile;
  switch (spellId) {
    case 'littleCold':       spawnColdParticles(wx, wy, radius, durationSec); return;
    case 'thunderFlash':     spawnThunderParticles(wx, wy, radius); return;
    case 'leafCutter':       spawnLeafCutterParticles(wx, wy, radius, durationSec); return;
    case 'fireball':         spawnFireParticles(wx, wy, radius, durationSec, color); return;
    case 'extremeHealing':   spawnHealParticles(wx, wy, radius); return;
    default:                 spawnGenericMagicBurst(wx, wy, radius, color); return;
  }
}
