import type { RigPoint } from "../types.ts";

export function add(a: RigPoint, b: RigPoint, scale = 1): RigPoint {
  return { x: a.x + b.x * scale, y: a.y + b.y * scale };
}

export function sub(a: RigPoint, b: RigPoint): RigPoint {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function normalize(v: RigPoint, fallback: RigPoint): RigPoint {
  const len = Math.hypot(v.x, v.y);
  if (len < 0.001) return fallback;
  return { x: v.x / len, y: v.y / len };
}

export function mid(a: RigPoint, b: RigPoint): RigPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function smoothPositiveHalfWave(value: number) {
  return value > 0 ? value * value : 0;
}

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(value: number) {
  const t = clamp01(value);
  return 1 - (1 - t) ** 3;
}

export function mixPoint(a: RigPoint, b: RigPoint, t: number): RigPoint {
  const clamped = clamp01(t);
  return {
    x: a.x + (b.x - a.x) * clamped,
    y: a.y + (b.y - a.y) * clamped
  };
}
