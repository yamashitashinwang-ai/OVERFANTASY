import { state, runtime } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { directionFromAngle, handOffsetForFacing, isFacingDir } from '../../facing.ts';
import type { AttackEffect, AttackHitZone, Vector2 } from '../../types.ts';
import type { WeaponShapeSpec } from './types.ts';

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
