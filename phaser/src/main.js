import Phaser from 'phaser';
import { BootScene } from './scenes/Boot.js';
import { GameScene } from './scenes/Game.js';
import { PauseScene } from './scenes/Pause.js';
import { MenuScene } from './scenes/Menu.js';
import {
  BackpackScene, QuestScene, ShopScene, ForgeScene, MagicScene
} from './scenes/PanelScenes.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#07090b',
  scene: [
    BootScene, MenuScene, GameScene, PauseScene,
    BackpackScene, QuestScene, ShopScene, ForgeScene, MagicScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  input: {
    mouse: {
      preventDefaultDown: false,
      preventDefaultUp: false,
      preventDefaultMove: false,
      preventDefaultWheel: false
    }
  }
};

new Phaser.Game(config);
