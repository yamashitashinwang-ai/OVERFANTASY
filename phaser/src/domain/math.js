// Pure math + vector helpers. Engine-agnostic, no game state, no DOM.

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function formatNumber(value, digits = 1) {
  const n = Number(value || 0);
  return n.toFixed(digits).replace(/\.0$/, '');
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Normalise a 2D vector. `fallback` is used when the vector length is ~0.
 * Default fallback is (1, 0).
 */
export function normalize(dx, dy, fallback = { x: 1, y: 0 }) {
  const len = Math.hypot(dx, dy);
  if (len < 0.0001) return { x: fallback.x, y: fallback.y };
  return { x: dx / len, y: dy / len };
}

/** Smallest absolute angular difference in radians, in [0, π]. */
export function angleBetween(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** A → B segment to point P distance. */
export function segmentPointDistance(ax, ay, bx, by, px, py) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy || 0.0001;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

export function circleHitsRect(x, y, radius, rect) {
  const closestX = clamp(x, rect.x, rect.x + rect.w);
  const closestY = clamp(y, rect.y, rect.y + rect.h);
  return Math.hypot(x - closestX, y - closestY) < radius;
}

export function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export function replaceObject(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, clonePlain(source));
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}
