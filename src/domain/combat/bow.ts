// Combat — bow + arrow flight. Charge timer is read via getBowCharge() /
// setBowCharge() so combat code does not depend on the runtime object shape.

import {
  state, flyingArrows, getBowCharge, setBowCharge,
  getHitStopTimer, setHitStopTimer
} from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import { clamp, segmentPointDistance } from '../math.ts';
import { currentWeapon } from './weapon.ts';
import { raceDamageMultiplier, applyRaceFinalAmount } from './race.ts';
import { canUseWorldActions, attackEntityFilter } from './targeting.ts';
import { markHitReaction, defeatEntity } from './damage.ts';
import { addArrowPickup, dropEmbeddedArrows } from './arrows.ts';
import { playerAimAngle } from '../../scenes/game-scene-helpers.ts';
import { log, toast } from '../../runtime/services.ts';
import { renderStats } from '../../ui/stats.ts';
import type { ActorState, ArrowProjectile, GearCatalogItem } from '../types.ts';

export { addArrowPickup, dropEmbeddedArrows };

export function isBowWeapon(weapon: GearCatalogItem = currentWeapon()): boolean {
  return weapon?.type === '弓';
}

export function bowChargeProgress(): number {
  return clamp((getBowCharge()?.time || 0) / 1.25, 0, 1);
}

export function bowShotStats(weapon: GearCatalogItem, charge: number) {
  const minRange = 3.5;
  const maxRange = weapon.range || 10;
  return {
    range: minRange + (maxRange - minRange) * charge,
    speed: 7 + 9 * charge,
    damageScale: 0.55 + 0.75 * charge
  };
}

export function beginBowCharge(): boolean {
  if (!canUseWorldActions() || getHitStopTimer() > 0 || getBowCharge()) return false;
  const weapon = currentWeapon();
  if (!isBowWeapon(weapon)) return false;
  if ((state.player.arrows || 0) <= 0) {
    toast("没有箭。");
    return true;
  }
  if (state.player.stamina < weapon.stamina) {
    toast("体力不足，拉不开弓。");
    return true;
  }
  setBowCharge({ time: 0, rushed: state.player.attackCooldown > 0 });
  state.player.blockTimer = 0;
  return true;
}

export function releaseBowCharge(): boolean {
  if (!getBowCharge()) return false;
  if (!canUseWorldActions()) {
    setBowCharge(null);
    return true;
  }
  const charge = bowChargeProgress();
  const rushed = getBowCharge().rushed;
  setBowCharge(null);
  fireArrow(charge, rushed);
  return true;
}

export function fireArrow(charge: number, rushedAttack = false) {
  const weapon = currentWeapon();
  if (!isBowWeapon(weapon)) return;
  if ((state.player.arrows || 0) <= 0) {
    toast("没有箭。");
    return;
  }
  if (state.player.stamina < weapon.stamina) {
    toast("体力不足，箭射偏了。");
    return;
  }
  state.player.arrows -= 1;
  state.player.stamina = Math.max(0, state.player.stamina - weapon.stamina);
  state.player.attackCooldown = weapon.cooldown;
  const angle = playerAimAngle();
  const stats = bowShotStats(weapon, clamp(charge, 0, 1));
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  flyingArrows.push({
    x: state.player.x,
    y: state.player.y,
    startX: state.player.x,
    startY: state.player.y,
    endX: state.player.x + ux * stats.range,
    endY: state.player.y + uy * stats.range,
    vx: ux * stats.speed,
    vy: uy * stats.speed,
    speed: stats.speed,
    angle,
    range: stats.range,
    traveled: 0,
    damageScale: stats.damageScale * (rushedAttack ? 0.4 : 1),
    weaponAtk: weapon.atk || 0
  });
  log(`射出一支箭${rushedAttack ? "，攻击间隔未到只发挥四成威力" : ""}。`);
  renderStats();
}

export function resolveArrowHit(arrow: ArrowProjectile, target: ActorState) {
  const critical = Math.random() < 0.05;
  const variance = 3;
  const baseDmg = Math.max(1, Math.ceil((state.player.atk + Math.floor(Math.random() * variance)) * arrow.damageScale * (critical ? 1.2 : 1)));
  const dmg = applyRaceFinalAmount(baseDmg, raceDamageMultiplier("bow"));
  target.hp -= dmg;
  target.arrowHits = (target.arrowHits || 0) + 1;
  target.playerAggro = (target.playerAggro || 0) + dmg + 8;
  markHitReaction(target, critical);
  if (critical) setHitStopTimer(Math.max(getHitStopTimer(), 0.08));
  log(`弓箭命中${target.name}，造成${dmg}点伤害${critical ? "，暴击" : ""}。`);
  if (target.hp <= 0) defeatEntity(target);
}

export function updateFlyingArrows(dt: number) {
  for (let i = flyingArrows.length - 1; i >= 0; i -= 1) {
    const arrow = flyingArrows[i];
    const oldX = arrow.x;
    const oldY = arrow.y;
    const step = Math.min(arrow.speed * dt, arrow.range - arrow.traveled);
    arrow.x += Math.cos(arrow.angle) * step;
    arrow.y += Math.sin(arrow.angle) * step;
    arrow.traveled += step;
    let hit: ActorState | null = null;
    let best = Infinity;
    for (const e of state.entities) {
      if (!e.alive || !attackEntityFilter(e)) continue;
      const threshold = (e.r || 8) / tile + 0.08;
      const d = segmentPointDistance(oldX, oldY, arrow.x, arrow.y, e.x, e.y);
      if (d <= threshold && d < best) {
        hit = e;
        best = d;
      }
    }
    if (hit) {
      resolveArrowHit(arrow, hit);
      flyingArrows.splice(i, 1);
      continue;
    }
    if (arrow.traveled >= arrow.range - 0.001) {
      addArrowPickup(arrow.endX, arrow.endY);
      flyingArrows.splice(i, 1);
    }
  }
}
