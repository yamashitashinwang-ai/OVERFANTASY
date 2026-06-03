import type Phaser from 'phaser';

export type AnyBody = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  center?: { x: number; y: number };
};

export function bodyRect(body: unknown, fallbackX: number, fallbackY: number, fallbackR: number) {
  const b = body as AnyBody | null | undefined;
  const w = b?.width ?? fallbackR * 2;
  const h = b?.height ?? fallbackR * 2;
  return {
    x: b?.x ?? fallbackX - w / 2,
    y: b?.y ?? fallbackY - h / 2,
    w,
    h
  };
}

export function strokeBody(g: Phaser.GameObjects.Graphics, obj: Phaser.GameObjects.GameObject | null | undefined, color: number, r = 8) {
  if (!obj) return;
  const cast = obj as Phaser.GameObjects.GameObject & { x?: number; y?: number; body?: unknown };
  const rect = bodyRect(cast.body, cast.x || 0, cast.y || 0, r);
  g.lineStyle(2, color, 0.9);
  g.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

export function drawMountMarker(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number, radius: number) {
  g.fillStyle(color, 0.95);
  g.fillCircle(x, y, radius);
  g.lineStyle(1, 0x101317, 0.82);
  g.strokeCircle(x, y, radius + 1);
}
