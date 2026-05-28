// Pure math + vector helpers. Engine-agnostic, no game state, no DOM.

import type { Vector2 } from './types.ts';

interface RectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function formatNumber(value: number | string | null | undefined, digits = 1): string {
  const n = Number(value || 0);
  return n.toFixed(digits).replace(/\.0$/, '');
}

export function dist(a: Vector2, b: Vector2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function choice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
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

/** A → B segment to point P distance. */
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

export function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function replaceObject<T extends object>(target: T, source: T) {
  const writableTarget = target as Record<string, unknown>;
  for (const key of Object.keys(target)) delete writableTarget[key];
  Object.assign(target, clonePlain(source));
}

export function escapeHtml(value: unknown): string {
  const replacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(value).replace(/[&<>"']/g, ch => replacements[ch]);
}
