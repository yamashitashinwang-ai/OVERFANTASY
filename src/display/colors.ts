// Color utilities for Phaser fill/stroke colors. Phaser uses 24-bit integer
// colors (0xRRGGBB) rather than CSS strings, so we convert hex strings once
// per call instead of per-draw.

export function hexToInt(hex: string | null | undefined): number {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return 0xffffff;
  const body = hex.length === 4
    ? hex.slice(1).split('').map((c: string) => c + c).join('')
    : hex.slice(1, 7);
  return parseInt(body, 16);
}

export function brightenColorInt(hex: string | null | undefined, amount = 0.32): number {
  if (!hex || !hex.startsWith('#')) return hexToInt(hex);
  const body = hex.length === 4
    ? hex.slice(1).split('').map((c: string) => c + c).join('')
    : hex.slice(1, 7);
  const n = parseInt(body, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (ch: number) => Math.min(255, Math.round(ch + (255 - ch) * amount));
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}
