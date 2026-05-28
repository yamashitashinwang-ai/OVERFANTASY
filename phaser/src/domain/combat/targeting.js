// Combat — target search + attack-shape geometry. Pure logic over state +
// weapon spec. No physics, no DOM.

import { state, tile } from '../../scenes/Game.js';
import { angleBetween, dist } from '../math.js';
import { uiState, isPlaying } from '../../runtime/ui-state.js';
import { currentWeapon } from './weapon.js';
import {
  getAttackEffect, setAttackEffect
} from '../../scenes/Game.js';

export function nearestEntity(range = 1.3, filter = () => true) {
  let best = null;
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

export function bodyGap(a, b) {
  const radiusA = (a.r || 0) / tile;
  const radiusB = (b.r || 0) / tile;
  return Math.max(0, dist(a, b) - radiusA - radiusB);
}

export function nearestAttackTarget(range, filter = () => true) {
  let best = null;
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

export function attackSpecForWeapon(weapon, angle) {
  const playerRadius = state.player.r / tile;
  if (weapon.type === "匕首") {
    return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: 0.86, duration: 0.13, color: "#eaf7ff", lineWidth: 3 };
  }
  if (weapon.type.includes("剑")) {
    return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: weapon.name === "剑的概念" ? 1.16 : 1.02, duration: weapon.name === "剑的概念" ? 0.2 : 0.17, color: weapon.name === "剑的概念" ? "#fff4b0" : "#dbe4ea", lineWidth: weapon.name === "剑的概念" ? 5 : 4 };
  }
  if (weapon.type === "长枪") {
    return { shape: "line", effect: "thrust", angle, reach: weapon.range + playerRadius, halfWidth: 0.28, duration: 0.16, color: "#dbe4ea", lineWidth: 4 };
  }
  if (weapon.type === "锤") {
    const radius = Math.max(0.9, weapon.range * 0.85);
    return { shape: "impact", effect: "hammer", angle, centerDist: radius * 0.72, radius, duration: 0.22, color: "#f3c45b", lineWidth: 5 };
  }
  if (weapon.type === "魔物") {
    return { shape: "sector", effect: "claw", angle, reach: Math.min(weapon.range, 0.92) + playerRadius, halfAngle: Math.PI / 2, duration: 0.14, color: "#d986ff", lineWidth: 3 };
  }
  return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: 0.95, duration: 0.16, color: "#dbe4ea", lineWidth: 3 };
}

export function attackTargetScore(e, spec) {
  const p = state.player;
  const dx = e.x - p.x;
  const dy = e.y - p.y;
  const targetRadius = (e.r || 0) / tile;
  const d = Math.hypot(dx, dy);
  const dirX = Math.cos(spec.angle);
  const dirY = Math.sin(spec.angle);
  if ((spec.shape === "sector" || spec.shape === "claw") && d <= targetRadius + (p.r / tile) * 0.65) return d;
  if (spec.shape === "sector" || spec.shape === "claw") {
    if (d > spec.reach + targetRadius) return Infinity;
    const targetAngle = Math.atan2(dy, dx);
    const angularBuffer = Math.asin(Math.min(1, targetRadius / Math.max(d, 0.01)));
    return angleBetween(targetAngle, spec.angle) <= spec.halfAngle + angularBuffer ? d : Infinity;
  }
  if (spec.shape === "line") {
    const forward = dx * dirX + dy * dirY;
    const side = Math.abs(dx * -dirY + dy * dirX);
    if (forward < -targetRadius || forward > spec.reach + targetRadius) return Infinity;
    return side <= spec.halfWidth + targetRadius ? forward + side * 0.35 : Infinity;
  }
  if (spec.shape === "impact") {
    const cx = p.x + dirX * spec.centerDist;
    const cy = p.y + dirY * spec.centerDist;
    const impactD = Math.hypot(e.x - cx, e.y - cy);
    return impactD <= spec.radius + targetRadius ? impactD : Infinity;
  }
  return Infinity;
}

export function nearestAttackShapeTarget(spec, filter = () => true) {
  let best = null;
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

export function startAttackEffect(weapon, spec, hit = false, critical = false) {
  setAttackEffect({ ...spec, weaponType: weapon.type, weaponName: weapon.name, time: 0, hit, critical });
}

export function attackEntityFilter(e) {
  if (state.player.monsterForm) return e.faction !== "monster";
  return true;
}

export function canUseWorldActions() {
  return isPlaying() && !uiState.backpackOpen && !uiState.questOpen
    && !uiState.shopOpen && !uiState.forgeOpen && !uiState.magicOpen;
}
