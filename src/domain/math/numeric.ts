export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function formatNumber(value: number | string | null | undefined, digits = 1): string {
  const n = Number(value || 0);
  return n.toFixed(digits).replace(/\.0$/, '');
}
