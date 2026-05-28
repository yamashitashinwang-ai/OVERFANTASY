// Unit tests for pure math/geometry helpers — no Phaser, no DOM.
// Run with: npm run test:unit
import { describe, it, expect } from 'vitest';
import {
  clamp, dist, rand, choice, normalize, angleBetween,
  formatNumber, escapeHtml, segmentPointDistance, circleHitsRect
} from './math.js';

describe('clamp', () => {
  it('returns the value when within range', () => expect(clamp(5, 0, 10)).toBe(5));
  it('clamps to min when below', () => expect(clamp(-5, 0, 10)).toBe(0));
  it('clamps to max when above', () => expect(clamp(15, 0, 10)).toBe(10));
});

describe('dist', () => {
  it('computes Euclidean distance between two points', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
  it('returns 0 for identical points', () => {
    expect(dist({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
});

describe('normalize', () => {
  it('returns a unit vector', () => {
    const v = normalize(3, 4);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(1, 5);
  });
  it('falls back when dx=dy=0', () => {
    const fallback = { x: 1, y: 0 };
    expect(normalize(0, 0, fallback)).toEqual(fallback);
  });
});

describe('angleBetween', () => {
  it('returns 0 for same angle', () => expect(angleBetween(0, 0)).toBe(0));
  it('returns π for opposite angles', () => expect(angleBetween(0, Math.PI)).toBeCloseTo(Math.PI));
  it('handles wraparound', () => expect(angleBetween(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(0.2, 5));
});

describe('rand + choice', () => {
  it('rand stays within range', () => {
    for (let i = 0; i < 100; i++) {
      const v = rand(1, 5);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
  it('choice returns one of the elements', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(choice(arr));
    }
  });
});

describe('formatNumber', () => {
  it('rounds positive numbers to 1 digit by default', () => expect(formatNumber(3.456)).toBe('3.5'));
  it('strips trailing zeros and decimal', () => expect(formatNumber(3.0)).toBe('3'));
});

describe('escapeHtml', () => {
  it('escapes ampersand + angle brackets', () => {
    expect(escapeHtml('<b>&"</b>')).toBe('&lt;b&gt;&amp;&quot;&lt;/b&gt;');
  });
  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('segmentPointDistance', () => {
  it('returns distance from point to nearest point on segment', () => {
    // Segment along x-axis from (0,0) to (10,0); point (5,3) is 3 away
    expect(segmentPointDistance(0, 0, 10, 0, 5, 3)).toBe(3);
  });
  it('clamps to endpoint when beyond segment', () => {
    expect(segmentPointDistance(0, 0, 10, 0, 15, 0)).toBe(5);
  });
});

describe('circleHitsRect', () => {
  it('returns true when circle overlaps rect', () => {
    expect(circleHitsRect(5, 5, 2, { x: 0, y: 0, w: 10, h: 10 })).toBe(true);
  });
  it('returns false when far away', () => {
    expect(circleHitsRect(100, 100, 1, { x: 0, y: 0, w: 10, h: 10 })).toBe(false);
  });
  it('returns true when circle just touches rect edge', () => {
    expect(circleHitsRect(12, 5, 2.5, { x: 0, y: 0, w: 10, h: 10 })).toBe(true);
  });
});
