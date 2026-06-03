import { state } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { angleBetween } from '../../math.ts';
import type { ActorState, AttackEffect, AttackHitZone } from '../../types.ts';
import type { EntityFilter } from './types.ts';

function targetRadius(e: ActorState): number {
  return (e.r || 0) / tile;
}

function playerForward(e: ActorState, angle: number): number {
  return (e.x - state.player.x) * Math.cos(angle) + (e.y - state.player.y) * Math.sin(angle);
}

function sectorZoneScore(e: ActorState, zone: AttackHitZone): number {
  const radius = targetRadius(e);
  if (playerForward(e, zone.angle) <= Math.max(0.04, radius * 0.12)) return Infinity;
  const dx = e.x - zone.x;
  const dy = e.y - zone.y;
  const d = Math.hypot(dx, dy);
  if (d > (zone.reach || 0) + radius) return Infinity;
  const angularBuffer = Math.asin(Math.min(1, radius / Math.max(d, 0.01)));
  const targetAngle = Math.atan2(dy, dx);
  return angleBetween(targetAngle, zone.angle) <= (zone.halfAngle || 0) + angularBuffer
    ? d + (zone.role === 'main' ? 0.08 : 0)
    : Infinity;
}

function lineZoneScore(e: ActorState, zone: AttackHitZone): number {
  const radius = targetRadius(e);
  const dirX = Math.cos(zone.angle);
  const dirY = Math.sin(zone.angle);
  if (playerForward(e, zone.angle) <= Math.max(0.04, radius * 0.12)) return Infinity;
  const dx = e.x - zone.x;
  const dy = e.y - zone.y;
  const forward = dx * dirX + dy * dirY;
  const side = Math.abs(dx * -dirY + dy * dirX);
  if (forward < -radius * 0.1 || forward > (zone.reach || 0) + radius) return Infinity;
  return side <= (zone.halfWidth || 0) + radius ? forward + side * 0.35 + 0.08 : Infinity;
}

function circleZoneScore(e: ActorState, zone: AttackHitZone): number {
  const radius = targetRadius(e);
  if (playerForward(e, zone.angle) <= Math.max(0.04, radius * 0.12)) return Infinity;
  const d = Math.hypot(e.x - zone.x, e.y - zone.y);
  return d <= (zone.radius || 0) + radius ? d + 0.08 : Infinity;
}

function zoneTargetScore(e: ActorState, zone: AttackHitZone): number {
  if (zone.shape === 'sector') return sectorZoneScore(e, zone);
  if (zone.shape === 'line') return lineZoneScore(e, zone);
  if (zone.shape === 'circle') return circleZoneScore(e, zone);
  return Infinity;
}

function legacyAttackTargetScore(e: ActorState, spec: AttackEffect): number {
  const p = state.player;
  const dx = e.x - p.x;
  const dy = e.y - p.y;
  const tr = targetRadius(e);
  const d = Math.hypot(dx, dy);
  const dirX = Math.cos(spec.angle);
  const dirY = Math.sin(spec.angle);
  if ((spec.shape === "sector" || spec.shape === "claw") && d <= tr + (p.r / tile) * 0.65) return d;
  if (spec.shape === "sector" || spec.shape === "claw") {
    if (d > spec.reach + tr) return Infinity;
    const targetAngle = Math.atan2(dy, dx);
    const angularBuffer = Math.asin(Math.min(1, tr / Math.max(d, 0.01)));
    return angleBetween(targetAngle, spec.angle) <= spec.halfAngle + angularBuffer ? d : Infinity;
  }
  if (spec.shape === "line") {
    const forward = dx * dirX + dy * dirY;
    const side = Math.abs(dx * -dirY + dy * dirX);
    if (forward < -tr || forward > spec.reach + tr) return Infinity;
    return side <= spec.halfWidth + tr ? forward + side * 0.35 : Infinity;
  }
  if (spec.shape === "impact") {
    const cx = p.x + dirX * spec.centerDist;
    const cy = p.y + dirY * spec.centerDist;
    const impactD = Math.hypot(e.x - cx, e.y - cy);
    return impactD <= spec.radius + tr ? impactD : Infinity;
  }
  return Infinity;
}

export function attackTargetScore(e: ActorState, spec: AttackEffect): number {
  if (spec.zones) {
    let best = Infinity;
    for (const zone of spec.zones) best = Math.min(best, zoneTargetScore(e, zone));
    return best;
  }
  return legacyAttackTargetScore(e, spec);
}

export function nearestAttackShapeTarget(spec: AttackEffect, filter: EntityFilter = () => true): ActorState | null {
  let best: ActorState | null = null;
  let bestScore = Infinity;
  for (const e of state.entities) {
    if (!e.alive || !filter(e)) continue;
    const score = attackTargetScore(e, spec);
    if (score < bestScore) {
      best = e;
      bestScore = score;
    }
  }
  return best;
}
