// Tile texture generation. Produces a single packed tileset image for the
// Phaser Tilemap layer by rendering each colored tile to a temporary
// Graphics canvas.

import { display as D } from './runtime.js';
import { hexToInt } from './colors.js';
import { colors, tile } from '../scenes/Game.js';

export function ensureTileTextures() {
  if (!D.pScene || D.pScene.textures.exists('tiles')) return;
  D.tileTypeList = Object.keys(colors);
  D.tileIndexMap = Object.fromEntries(D.tileTypeList.map((t, i) => [t, i]));
  const numTiles = D.tileTypeList.length;
  const g = D.pScene.make.graphics({ x: 0, y: 0, add: false });
  D.tileTypeList.forEach((type, i) => {
    g.fillStyle(hexToInt(colors[type]), 1);
    g.fillRect(i * tile, 0, tile, tile);
    g.lineStyle(1, 0x000000, 0.11);
    g.strokeRect(i * tile + 0.5, 0.5, tile - 1, tile - 1);
  });
  g.generateTexture('tiles', numTiles * tile, tile);
  g.destroy();
}
