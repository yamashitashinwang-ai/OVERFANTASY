import type Phaser from 'phaser';
import type { Graphics } from './types.ts';

const graphicsConfig = (config: object) => config as Phaser.Types.GameObjects.Graphics.Options;

export function makeTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: Graphics) => void) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics(graphicsConfig({ x: 0, y: 0, add: false }));
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}
