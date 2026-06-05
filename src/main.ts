import Phaser from 'phaser';
import { BootScene } from './scenes/Boot.ts';
import { GameScene } from './scenes/Game.ts';
import { PauseScene } from './scenes/Pause.ts';
import { MenuScene } from './scenes/Menu.ts';
import { CorruptionChoiceScene } from './scenes/CorruptionChoice.ts';
import {
  BackpackScene, QuestScene, ShopScene, ForgeScene, MagicScene, CharacterScene, CareerScene
} from './scenes/PanelScenes.ts';

const config = {
  type: Phaser.AUTO,
  scale: {
    parent: 'game-container',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 640
  },
  backgroundColor: '#07090b',
  scene: [
    BootScene, MenuScene, GameScene, PauseScene,
    CorruptionChoiceScene,
    BackpackScene, QuestScene, ShopScene, ForgeScene, MagicScene, CharacterScene, CareerScene
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
