// Pure utility compatibility facade. Numeric, random, geometry, clone, and HTML
// helpers live under `domain/math/` by responsibility.

export { clamp, formatNumber } from './math/numeric.ts';
export { rand, choice } from './math/random.ts';
export { dist, normalize, angleBetween, segmentPointDistance, circleHitsRect } from './math/geometry.ts';
export { clonePlain, replaceObject } from './math/objects.ts';
export { escapeHtml } from './math/html.ts';
