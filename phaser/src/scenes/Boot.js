import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    // GameScene initialises core gameplay resources (display, state, physics);
    // it then launches MenuScene as an overlay + pauses itself until the
    // player chooses New Game / Continue (mirrors PauseScene's pattern).
    this.scene.start('GameScene');
  }
}
