// Tile texture generation. Produces a single packed tileset image for the
// Phaser Tilemap layer by rendering each colored tile to a temporary
// Graphics canvas.

import type Phaser from 'phaser';
import { display as D } from './runtime.ts';
import { drawTileCell } from './placeholder-art.ts';
import DATA from '../data.ts';
import { tile } from '../runtime/constants.ts';

const { colors } = DATA;
const graphicsConfig = (config: object) => config as Phaser.Types.GameObjects.Graphics.Options;

export function ensureTileTextures() {
  if (!D.pScene || D.pScene.textures.exists('tiles')) return;
  D.tileTypeList = Object.keys(colors);
  D.tileIndexMap = Object.fromEntries(D.tileTypeList.map((t, i) => [t, i]));
  const numTiles = D.tileTypeList.length;
  const g = D.pScene.make.graphics(graphicsConfig({ x: 0, y: 0, add: false }));
  D.tileTypeList.forEach((type, i) => {
    drawTileCell(g, type, i * tile, 0, tile, colors[type]);
  });
  g.generateTexture('tiles', numTiles * tile, tile);
  g.destroy();
}
