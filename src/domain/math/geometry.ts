import type { Vector2 } from '../types.ts';
import { clamp } from './numeric.ts';

interface RectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function dist(a: Vector2, b: Vector2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Normalise a 2D vector. `fallback` is used when the vector length is ~0.
 * Default fallback is (1, 0).
 */
export function normalize(dx: number, dy: number, fallback: Vector2 = { x: 1, y: 0 }): Vector2 {
  const len = Math.hypot(dx, dy);
  if (len < 0.0001) return { x: fallback.x, y: fallback.y };
  return { x: dx / len, y: dy / len };
}

/** Smallest absolute angular difference in radians, in [0, π]. */
export function angleBetween(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** A -> B segment to point P distance. */
export function segmentPointDistance(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy || 0.0001;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

export function circleHitsRect(x: number, y: number, radius: number, rect: RectLike): boolean {
  const closestX = clamp(x, rect.x, rect.x + rect.w);
  const closestY = clamp(y, rect.y, rect.y + rect.h);
  return Math.hypot(x - closestX, y - closestY) < radius;
}
