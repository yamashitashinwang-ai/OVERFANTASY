import Phaser from 'phaser';
import { display as D } from '../runtime.ts';

let texturesReady = false;
const graphicsConfig = (config: object) => config as Phaser.Types.GameObjects.Graphics.Options;

export function ensureParticleTextures() {
  if (texturesReady || !D.pScene) return;
  const textures = D.pScene.textures;
  if (!textures.exists('p_dot')) {
    const graphics = D.pScene.make.graphics(graphicsConfig({ add: false }));
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 6);
    graphics.generateTexture('p_dot', 16, 16);
    graphics.destroy();
  }
  if (!textures.exists('p_dot_soft')) {
    const graphics = D.pScene.make.graphics(graphicsConfig({ add: false }));
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(8, 8, 8);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 3);
    graphics.generateTexture('p_dot_soft', 16, 16);
    graphics.destroy();
  }
  if (!textures.exists('p_spark')) {
    const graphics = D.pScene.make.graphics(graphicsConfig({ add: false }));
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(8, 1, 15, 8, 8, 15);
    graphics.fillTriangle(8, 1, 1, 8, 8, 15);
    graphics.generateTexture('p_spark', 16, 16);
    graphics.destroy();
  }
  if (!textures.exists('p_leaf')) {
    const graphics = D.pScene.make.graphics(graphicsConfig({ add: false }));
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(8, 1, 15, 8, 8, 15);
    graphics.fillTriangle(8, 1, 1, 8, 8, 15);
    graphics.generateTexture('p_leaf', 16, 16);
    graphics.destroy();
  }
  texturesReady = true;
}
