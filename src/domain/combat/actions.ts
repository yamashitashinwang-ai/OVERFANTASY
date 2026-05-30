// Combat — player verbs (attack/defend/dodge) + per-frame combat feedback
// ticker. Delegates to targeting + bow + damage modules.

import {
  state, magicEffects,
  getAttackEffect, setAttackEffect,
  getBowCharge, setBowCharge,
  getPendingMagicCast, setPendingMagicCast,
  getHitStopTimer, setHitStopTimer
} from '../../runtime/state.ts';
import { currentWeapon, gearModList, refreshCombatStats } from './weapon.ts';
import { raceDamageMultiplier, applyRaceFinalAmount } from './race.ts';
import { markHitReaction, defeatEntity } from './damage.ts';
import {
  nearestAttackShapeTarget, attackSpecForWeapon, attackEntityFilter,
  startAttackEffect, canUseWorldActions, bodyGap
} from './targeting.ts';
import { isBowWeapon, fireArrow, updateFlyingArrows } from './bow.ts';
import { resolveMagicCast, updateMagicZoneEffect } from '../magic.ts';
import { playerAimAngle } from '../../scenes/game-scene-helpers.ts';
import { log, toast } from '../../runtime/services.ts';
import { log as dlog, NS } from '../../runtime/log.ts';
import { triggerPlayerAttackPlaceholder } from '../../display/animations.ts';
import type { GearMod } from '../types.ts';

export function playerAttack() {
  if (getHitStopTimer() > 0) {
    dlog(NS.COMBAT_PLAYER_ATTACK, 'blocked by hitStop=%s', getHitStopTimer().toFixed(2));
    return;
  }
  refreshCombatStats();
  const weapon = currentWeapon();
  dlog(NS.COMBAT_PLAYER_ATTACK, 'fired weapon=%s type=%s stamina=%s cd=%s',
    weapon?.name, weapon?.type, state.player.stamina.toFixed(1), state.player.attackCooldown.toFixed(2));
  if (isBowWeapon(weapon)) {
    if ((state.player.arrows || 0) <= 0) return toast("没有箭。");
    fireArrow(0.08, state.player.attackCooldown > 0);
    return;
  }
  const rushedAttack = state.player.attackCooldown > 0;
  if (state.player.stamina < weapon.stamina) {
    dlog(NS.COMBAT_PLAYER_ATTACK, 'aborted: low stamina %s < %s', state.player.stamina.toFixed(1), weapon.stamina);
    toast("体力不足，攻击会失手。");
    return;
  }
  const spec = attackSpecForWeapon(weapon, playerAimAngle());
  state.player.blockTimer = 0;
  state.player.attackCooldown = weapon.cooldown;
  state.player.stamina = Math.max(0, state.player.stamina - weapon.stamina);
  startAttackEffect(weapon, spec);
  triggerPlayerAttackPlaceholder(
    weapon.type === "匕首" ? 'attack_dagger' :
      weapon.type === "长枪" ? 'attack_spear' :
        weapon.type === "锤" ? 'attack_hammer' : 'attack_sword'
  );
  const target = nearestAttackShapeTarget(spec, attackEntityFilter);
  if (!target) {
    const blockedMonster = state.player.monsterForm && nearestAttackShapeTarget(spec, () => true)?.faction === "monster";
    dlog(NS.COMBAT_PLAYER_ATTACK, 'whiffed (no target in arc) monsterFormBlock=%s', blockedMonster);
    toast(blockedMonster ? "魔物化状态下无法攻击魔物势力。靠近白石祠可以恢复。" : "攻击挥空了。");
    return;
  }
  if (state.player.monsterForm && target.faction === "monster") {
    dlog(NS.COMBAT_PLAYER_ATTACK, 'blocked: monsterForm can\'t attack monster faction (target=%s)', target.name);
    toast("魔物化状态下无法攻击魔物势力。靠近白石祠可以恢复。 ");
    return;
  }
  const guardCut = target.guard && weapon.type !== "锤" ? 0.72 : 1;
  const variance = weapon.type === "匕首" ? 2 : 4;
  const closeBonus = (weapon.type === "匕首" || weapon.type.includes("剑")) && bodyGap(state.player, target) <= 0.05 ? 1.3 : 1;
  const cooldownCut = rushedAttack ? 0.4 : 1;
  const critical = Math.random() < 0.05;
  const baseDmg = Math.ceil((state.player.atk + Math.floor(Math.random() * variance)) * guardCut * closeBonus * cooldownCut * (critical ? 1.2 : 1));
  const dmg = applyRaceFinalAmount(baseDmg, raceDamageMultiplier("weapon", weapon));
  const tgtHpBefore = target.hp;
  target.hp -= dmg;
  target.playerAggro = (target.playerAggro || 0) + dmg + 8;
  dlog(NS.COMBAT_ENTITY_HIT, 'hit %s hp %d->%d  dmg=%d crit=%s rushed=%s',
    target.name, tgtHpBefore, target.hp, dmg, critical, rushedAttack);
  getAttackEffect().hit = true;
  getAttackEffect().critical = critical;
  markHitReaction(target, critical);
  if (critical) setHitStopTimer(Math.max(getHitStopTimer(), 0.08));
  const weaponMods = gearModList(state.player.gear.weapon);
  const slowMod = weaponMods.reduce<GearMod>((best, mod) => (mod.slowOnHit || 0) > (best.slowOnHit || 0) ? mod : best, {});
  if (slowMod.slowOnHit) {
    target.slowTimer = Math.max(target.slowTimer || 0, slowMod.duration || 2.6);
    target.slowPower = Math.max(target.slowPower || 0, slowMod.slowOnHit);
  }
  const aoeMod = weaponMods.reduce<GearMod>((best, mod) => (mod.aoeSlowOnHit || 0) > (best.aoeSlowOnHit || 0) ? mod : best, {});
  if (aoeMod.aoeSlowOnHit) {
    let affected = 0;
    for (const e of state.entities) {
      if (!e.alive || e === target) continue;
      if (Math.hypot(e.x - target.x, e.y - target.y) <= (aoeMod.radius || 3.2)) {
        e.slowTimer = Math.max(e.slowTimer || 0, aoeMod.duration || 4.0);
        e.slowPower = Math.max(e.slowPower || 0, aoeMod.aoeSlowOnHit);
        affected += 1;
      }
    }
    target.slowTimer = Math.max(target.slowTimer || 0, aoeMod.duration || 4.0);
    target.slowPower = Math.max(target.slowPower || 0, aoeMod.aoeSlowOnHit);
    if (affected > 0) log(`凝胶爆弹扩散，周围${affected}个生物被减速。`);
  }
  log(`${weapon.type}攻击${target.name}，造成${dmg}点伤害${critical ? "，暴击" : ""}${rushedAttack ? "，攻击间隔未到只发挥四成威力" : ""}${closeBonus > 1 ? "，贴身命中要害" : ""}${target.guard && weapon.type !== "锤" ? "，但它的防御抵消了一部分" : ""}。`);
  if (target.hp <= 0) defeatEntity(target);
}

export function playerDefend() {
  if (state.player.monsterForm) {
    dlog(NS.COMBAT_BLOCK, 'aborted: monsterForm');
    toast("魔物化状态更适合突进，不能稳定防御。");
    return;
  }
  if (state.player.stamina < 2) {
    dlog(NS.COMBAT_BLOCK, 'aborted: low stamina %s', state.player.stamina.toFixed(1));
    toast("体力不足，架势撑不起来。");
    return;
  }
  state.player.stamina = Math.max(0, state.player.stamina - 2);
  state.player.blockTimer = 0.95;
  state.player.attackCooldown = Math.max(state.player.attackCooldown, 0.25);
  dlog(NS.COMBAT_BLOCK, 'engaged stamina=%s', state.player.stamina.toFixed(1));
  log("进入防御架势，短时间内受到的伤害会明显降低。");
}

export function playerDodge() {
  const cooldownCut = state.player.gear.feet === "travelBoots" ? 0.82 : 1;
  if (state.player.dodgeCooldown > 0) {
    toast("闪避还没缓过来。");
    return;
  }
  if (state.player.stamina < 6) {
    toast("体力不足，闪避会变成踉跄。");
    return;
  }
  state.player.stamina = Math.max(0, state.player.stamina - 6);
  state.player.dodgeTimer = 0.28;
  state.player.dodgeCooldown = 1.15 * cooldownCut;
  state.player.invuln = Math.max(state.player.invuln, 0.34);
  state.player.blockTimer = 0;
  log("闪避！短时间内不会受到伤害，移动速度提升。");
}

export function updateCombatFeedback(dt: number) {
  if (getBowCharge() && (!canUseWorldActions() || !isBowWeapon() || (state.player.arrows || 0) <= 0)) setBowCharge(null);
  if (getBowCharge()) getBowCharge().time += dt;
  updateFlyingArrows(dt);
  if (getAttackEffect()) {
    getAttackEffect().time += dt;
    if (getAttackEffect().time >= getAttackEffect().duration) setAttackEffect(null);
  }
  if (getPendingMagicCast()) {
    getPendingMagicCast().timer -= dt;
    if (getPendingMagicCast().timer <= 0) {
      const cast = getPendingMagicCast();
      setPendingMagicCast(null);
      resolveMagicCast(cast);
    }
  }
  for (let i = magicEffects.length - 1; i >= 0; i -= 1) {
    updateMagicZoneEffect(magicEffects[i], dt);
    magicEffects[i].time += dt;
    if (magicEffects[i].time >= magicEffects[i].duration) magicEffects.splice(i, 1);
  }
  // Hit-feedback animations now live in the Phaser tween manager (see
  // display/animations.js) and self-dispose, so no manual loop is needed here.
}
