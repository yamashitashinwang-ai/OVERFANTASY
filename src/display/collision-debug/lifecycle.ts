import type Phaser from 'phaser';
import { display as D } from '../runtime.ts';
import { currentPlayerMagicCastDebugLabel } from '../animations.ts';
import { drawCollisionDebugOverlay } from './world-overlays.ts';

export function initCollisionDebug(scene: Phaser.Scene) {
  D.collisionDebugGfx = scene.add.graphics().setDepth(94).setVisible(false);
  D.collisionDebugText = scene.add.text(24, 148, '', {
    fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
    fontSize: '13px',
    color: '#dbe4ea',
    backgroundColor: '#07090b99',
    padding: { x: 6, y: 4 }
  }).setScrollFactor(0).setDepth(95).setVisible(false);
  scene.input.keyboard.on('keydown-F4', () => {
    D.collisionDebugEnabled = !D.collisionDebugEnabled;
    D.collisionDebugGfx?.setVisible(D.collisionDebugEnabled);
    D.collisionDebugText?.setVisible(D.collisionDebugEnabled);
    if (!D.collisionDebugEnabled) {
      D.collisionDebugGfx?.clear();
      D.collisionDebugText?.setText('');
    }
  });
}

export function syncCollisionDebug() {
  const g = D.collisionDebugGfx;
  if (!g) return;
  g.clear();
  g.setVisible(D.collisionDebugEnabled);
  D.collisionDebugText?.setVisible(D.collisionDebugEnabled);
  D.collisionDebugText?.setText(D.collisionDebugEnabled ? currentPlayerMagicCastDebugLabel() : '');
  if (!D.collisionDebugEnabled) return;
  drawCollisionDebugOverlay(g);
}
