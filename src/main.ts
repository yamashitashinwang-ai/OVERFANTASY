import Phaser from 'phaser';
import { BootScene } from './scenes/Boot.ts';
import { GameScene } from './scenes/Game.ts';
import { PauseScene } from './scenes/Pause.ts';
import { MenuScene } from './scenes/Menu.ts';
import {
  BackpackScene, QuestScene, ShopScene, ForgeScene, MagicScene
} from './scenes/PanelScenes.ts';

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
