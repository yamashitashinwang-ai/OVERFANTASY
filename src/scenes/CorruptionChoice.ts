import Phaser from 'phaser';
import { W, H } from '../runtime/constants.ts';
import { acceptMonsterFate, chooseSuppressCorruption } from '../domain/corruption.ts';
import { uiState } from '../runtime/ui-state.ts';

const textStyle = {
  fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
  color: '#edf3f7'
};

export class CorruptionChoiceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CorruptionChoiceScene' });
  }

  create() {
    uiState.corruptionChoiceOpen = true;
    this.cameras.main.setBackgroundColor('rgba(5, 3, 9, 0.72)');
    this.add.rectangle(W / 2, H / 2, W, H, 0x050309, 0.76);
    this.add.rectangle(W / 2, H / 2, 520, 260, 0x100817, 0.96)
      .setStrokeStyle(2, 0x7f54b8, 0.9);
    this.add.text(W / 2, H / 2 - 84, '魔化值已经抵达临界点', {
      ...textStyle,
      fontSize: '26px'
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 40, '血脉深处传来召唤。你必须现在做出选择。', {
      ...textStyle,
      fontSize: '15px',
      color: '#d8c8ff'
    }).setOrigin(0.5);

    this.addButton(W / 2 - 130, H / 2 + 58, '我能忍受...', () => chooseSuppressCorruption());
    this.addButton(W / 2 + 130, H / 2 + 58, '我接受命运！', () => acceptMonsterFate());

    this.input.keyboard?.on('keydown-ONE', () => chooseSuppressCorruption());
    this.input.keyboard?.on('keydown-TWO', () => acceptMonsterFate());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ONE');
      this.input.keyboard?.off('keydown-TWO');
    });
  }

  private addButton(x: number, y: number, label: string, action: () => void) {
    const rect = this.add.rectangle(x, y, 190, 54, 0x231032, 1)
      .setStrokeStyle(2, 0xb986ff, 0.88)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      ...textStyle,
      fontSize: '18px'
    }).setOrigin(0.5);
    rect.on('pointerover', () => rect.setFillStyle(0x3a1854, 1));
    rect.on('pointerout', () => rect.setFillStyle(0x231032, 1));
    rect.on('pointerdown', action);
    text.setInteractive({ useHandCursor: true });
    text.on('pointerdown', action);
  }
}
