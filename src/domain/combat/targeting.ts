// Combat — target search + attack-shape geometry. Pure logic over state +
// weapon spec. No physics, no DOM.

import { state, runtime, setAttackEffect } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { angleBetween, dist } from '../math.ts';
import { uiState, isPlaying } from '../../runtime/ui-state.ts';
import { hasCorruptionControlLock } from '../corruption.ts';
import { directionFromAngle, handOffsetForFacing, isFacingDir } from '../facing.ts';
import type { ActorState, AttackEffect, AttackHitZone, GearCatalogItem, Vector2 } from '../types.ts';

type EntityFilter = (entity: ActorState) => boolean;

interface WeaponShapeSpec {
  name: string;
  type?: string;
  range?: number;
}

export function nearestEntity(range = 1.3, filter: EntityFilter = () => true): ActorState | null {
  let best: ActorState | null = null;
  let bestD = Infinity;
  for (const e of state.entities) {
    if (!e.alive || !filter(e)) continue;
    const d = dist(state.player, e);
    if (d < range && d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

export function bodyGap(a: Vector2 & { r?: number }, b: Vector2 & { r?: number }): number {
  const radiusA = (a.r || 0) / tile;
  const radiusB = (b.r || 0) / tile;
  return Math.max(0, dist(a, b) - radiusA - radiusB);
}

export function nearestAttackTarget(range: number, filter: EntityFilter = () => true): ActorState | null {
  let best: ActorState | null = null;
  let bestGap = Infinity;
  for (const e of state.entities) {
    if (!e.alive || !filter(e)) continue;
    const gap = bodyGap(state.player, e);
    if (gap <= range && gap < bestGap) {
      best = e;
      bestGap = gap;
    }
  }
  return best;
}

function combatHandAnchor(angle: number): Vector2 {
  const facing = isFacingDir(runtime.facingDirection) ? runtime.facingDirection : directionFromAngle(angle);
  const offset = handOffsetForFacing(facing);
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  const sideX = -dirY;
  const sideY = dirX;
  const playerRadius = state.player.r / tile;
  let forward = (offset.x / tile) * dirX + (offset.y / tile) * dirY;
  let side = (offset.x / tile) * sideX + (offset.y / tile) * sideY;
  const minForward = (state.player.r / tile) * 0.55;
  if (forward < minForward) {
    forward = minForward;
  }
  const maxSide = playerRadius * 0.65;
  side = Math.max(-maxSide, Math.min(maxSide, side));
  const ox = dirX * forward + sideX * side;
  const oy = dirY * forward + sideY * side;
  return { x: state.player.x + ox, y: state.player.y + oy };
}

function closeSector(angle: number, reach: number, halfAngle: number): AttackHitZone {
  return { shape: 'sector', role: 'close', x: state.player.x, y: state.player.y, angle, reach, halfAngle };
}

function handSector(hand: Vector2, angle: number, reach: number, halfAngle: number): AttackHitZone {
  return { shape: 'sector', role: 'main', x: hand.x, y: hand.y, angle, reach, halfAngle };
}

function handLine(hand: Vector2, angle: number, reach: number, halfWidth: number): AttackHitZone {
  return { shape: 'line', role: 'main', x: hand.x, y: hand.y, angle, reach, halfWidth };
}

function impactCircle(hand: Vector2, angle: number, centerDist: number, radius: number): AttackHitZone {
  return {
    shape: 'circle',
    role: 'main',
    x: hand.x + Math.cos(angle) * centerDist,
    y: hand.y + Math.sin(angle) * centerDist,
    angle,
    radius
  };
}

export function attackSpecForWeapon(weapon: WeaponShapeSpec, angle: number): AttackEffect {
  const playerRadius = state.player.r / tile;
  const weaponType = weapon.type || '';
  const weaponRange = weapon.range || 1.2;
  const hand = combatHandAnchor(angle);
  const common = { handX: hand.x, handY: hand.y };
  if (weaponType === "弓") {
    return { shape: "projectile", effect: "projectile", angle, duration: 0, ...common, zones: [] };
  }
  if (weaponType === "匕首") {
    return {
      shape: "sector", effect: "slash", angle, reach: weaponRange, halfAngle: 0.68,
      duration: 0.13, color: "#eaf7ff", lineWidth: 3, ...common,
      zones: [
        closeSector(angle, playerRadius + 0.42, 1.22),
        handSector(hand, angle, weaponRange, 0.68)
      ]
    };
  }
  if (weaponType.includes("剑")) {
    const halfAngle = weapon.name === "剑的概念" ? 1.16 : 1.02;
    return {
      shape: "sector", effect: "slash", angle, reach: weaponRange, halfAngle,
      duration: weapon.name === "剑的概念" ? 0.2 : 0.17,
      color: weapon.name === "剑的概念" ? "#fff4b0" : "#dbe4ea",
      lineWidth: weapon.name === "剑的概念" ? 5 : 4,
      ...common,
      zones: [
        closeSector(angle, playerRadius + 0.52, Math.PI / 2),
        handSector(hand, angle, weaponRange, halfAngle)
      ]
    };
  }
  if (weaponType === "长枪") {
    const spearHalfWidth = 0.3;
    return {
      shape: "line", effect: "thrust", angle, reach: weaponRange, halfWidth: spearHalfWidth,
      duration: 0.16, color: "#dbe4ea", lineWidth: 4, ...common,
      zones: [
        closeSector(angle, playerRadius + 0.24, 0.58),
        handLine(hand, angle, weaponRange, spearHalfWidth)
      ]
    };
  }
  if (weaponType === "锤") {
    const radius = Math.max(0.9, weaponRange * 0.85);
    const centerDist = radius * 0.72;
    return {
      shape: "impact", effect: "hammer", angle, centerDist, radius,
      duration: 0.22, color: "#f3c45b", lineWidth: 5, ...common,
      zones: [
        closeSector(angle, playerRadius + 0.5, Math.PI / 2),
        impactCircle(hand, angle, centerDist, radius)
      ]
    };
  }
  if (weaponType === "魔物") {
    const reach = Math.min(weaponRange, 0.98);
    return {
      shape: "sector", effect: "claw", angle, reach, halfAngle: Math.PI / 2,
      duration: 0.14, color: "#d986ff", lineWidth: 3, ...common,
      zones: [
        closeSector(angle, playerRadius + 0.48, Math.PI / 2),
        handSector(hand, angle, reach, Math.PI / 2)
      ]
    };
  }
  return {
    shape: "sector", effect: "slash", angle, reach: weaponRange, halfAngle: 0.95,
    duration: 0.16, color: "#dbe4ea", lineWidth: 3, ...common,
    zones: [
      closeSector(angle, playerRadius + 0.48, Math.PI / 2),
      handSector(hand, angle, weaponRange, 0.95)
    ]
  };
}

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

export function startAttackEffect(weapon: GearCatalogItem, spec: AttackEffect, hit = false, critical = false) {
  setAttackEffect({ ...spec, weaponType: weapon.type, weaponName: weapon.name, time: 0, hit, critical });
}

export function attackEntityFilter(e: ActorState): boolean {
  if (state.player.monsterForm) return e.faction !== "monster";
  return true;
}

export function canUseWorldActions() {
  return isPlaying() && !uiState.backpackOpen && !uiState.questOpen
    && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen
    && !hasCorruptionControlLock();
}
