import type Phaser from 'phaser';

export const resetBody = (body: Phaser.GameObjects.GameObject['body'] | null | undefined, x: number, y: number) => {
  (body as { reset?: (nextX: number, nextY: number) => void } | null)?.reset?.(x, y);
};
