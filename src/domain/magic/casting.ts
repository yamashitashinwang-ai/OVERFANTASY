import { state, setPendingMagicCast, getPendingMagicCast } from '../../runtime/state.ts';
import { magicChantTimeScale } from '../../runtime/constants.ts';
import { bus, Events } from '../../runtime/events.ts';
import DATA from '../../data.ts';
import { applyRaceFinalAmount, raceDamageMultiplier } from '../combat/race.ts';
import { log, toast } from '../../runtime/services.ts';
import { interruptPendingMagicCast } from '../magic-casting.ts';
import type { ActorState, PendingMagicCast, PetState, PlayerState } from '../types.ts';
import { knowsMagic } from './knowledge.ts';
import { closestEnemyAtPoint, friendlyAtPoint, magicCastPoint, magicTargetFilter } from './targets.ts';
import { damageByMagic, startMagicEffect } from './effects.ts';
import { awardMagicEffectiveProficiency, tryAwardSurvivalProficiency } from '../proficiency.ts';

const { magicCatalog } = DATA;

export function beginMagicCast(spellId: string) {
  const spell = magicCatalog[spellId];
  if (!spell || !knowsMagic(spellId)) return toast("还没有掌握这个魔法。");
  if (state.player.monsterForm) return toast("魔物化状态下无法稳定组织魔法。");
  if (getPendingMagicCast()) return toast("正在吟唱魔法。");
  const chantTime = (spell.chant ?? 0.5) * magicChantTimeScale;
  if (chantTime <= 0) {
    if (state.player.mp < spell.cost) return toast("MP 不足。");
    state.player.mp = Math.max(0, state.player.mp - spell.cost);
    resolveMagicCast({ spellId, timer: 0, total: 0, cost: spell.cost, spent: spell.cost });
    return;
  }
  if (state.player.mp <= 0) return toast("MP 不足。");
  setPendingMagicCast({ spellId, timer: chantTime, total: chantTime, cost: spell.cost, spent: 0 });
  bus.emit(Events.MAGIC_CAST_BEGIN, { spellId, durationMs: chantTime * 1000, color: spell.color });
  log(`开始吟唱${spell.name}。`);
}

export function updatePendingMagicCast(dt: number) {
  const cast = getPendingMagicCast();
  if (!cast) return;
  const spell = magicCatalog[cast.spellId];
  if (!spell) {
    interruptPendingMagicCast();
    return;
  }
  const total = Math.max(0.001, cast.total || ((spell.chant ?? 0.5) * magicChantTimeScale));
  const cost = cast.cost ?? spell.cost;
  const activeDt = Math.min(Math.max(0, dt), Math.max(0, cast.timer));
  const spent = cast.spent ?? 0;
  const remainingCost = Math.max(0, cost - spent);
  const intendedCost = Math.min(remainingCost, activeDt * cost / total);
  if (intendedCost > 0) {
    const paid = Math.min(state.player.mp, intendedCost);
    state.player.mp = Math.max(0, state.player.mp - paid);
    cast.spent = spent + paid;
    if (paid + 0.0001 < intendedCost) {
      interruptPendingMagicCast('insufficientMp');
      return;
    }
  }
  cast.timer -= dt;
  if (cast.timer > 0) return;

  const finalRemainingCost = Math.max(0, cost - (cast.spent ?? 0));
  if (finalRemainingCost > 0.0001) {
    const paid = Math.min(state.player.mp, finalRemainingCost);
    state.player.mp = Math.max(0, state.player.mp - paid);
    cast.spent = (cast.spent ?? 0) + paid;
    if (paid + 0.0001 < finalRemainingCost) {
      interruptPendingMagicCast('insufficientMp');
      return;
    }
  }

  setPendingMagicCast(null);
  resolveMagicCast(cast);
}

export function resolveMagicCast(cast: PendingMagicCast) {
  const spell = magicCatalog[cast.spellId];
  if (!spell) return;
  bus.emit(Events.MAGIC_CAST_RESOLVE, { spellId: cast.spellId, color: spell.color });
  state.player.mpRegenLock = 1.5;
  const point = magicCastPoint(12.5);
  if (spell.kind === "heal") {
    const target: PetState | ActorState | PlayerState = friendlyAtPoint(point, spell.radius) || state.player;
    const before = target.hp;
    const heal = applyRaceFinalAmount(spell.heal, raceDamageMultiplier("magic"));
    target.hp = Math.min(target.maxHp, target.hp + heal);
    startMagicEffect({ id: cast.spellId, ...spell }, target.x, target.y, spell.radius);
    if (target.hp > before) {
      awardMagicEffectiveProficiency();
      if (target === state.player) tryAwardSurvivalProficiency();
    }
    log(`施放${spell.name}，${target === state.player ? "自己" : target.name}回复${Math.ceil(target.hp - before)}点 HP。`);
    return;
  }
  if (spell.kind === "single") {
    const target = closestEnemyAtPoint(point, spell.radius);
    startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
    if (!target) {
      log(`${spell.name}划过空处。`);
      return;
    }
    const dealt = damageByMagic(target, spell.damage, { id: cast.spellId, ...spell });
    if (dealt > 0) awardMagicEffectiveProficiency();
    log(`施放${spell.name}命中${target.name}，造成${dealt}点伤害。`);
    return;
  }
  if (spell.kind === "zone") {
    const effect = startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
    const activeTargets = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - point.x, e.y - point.y) <= spell.radius);
    if (activeTargets.length > 0) {
      effect.proficiencyAwarded = true;
      awardMagicEffectiveProficiency();
    }
    log(`施放${spell.name}，寒雾在指定位置扩散。`);
    return;
  }
  const affected = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - point.x, e.y - point.y) <= spell.radius);
  let dealt = 0;
  for (const e of [...affected]) dealt = damageByMagic(e, spell.damage, { id: cast.spellId, ...spell });
  startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
  if (affected.length > 0) awardMagicEffectiveProficiency();
  log(`施放${spell.name}，${affected.length}个目标受到${dealt || applyRaceFinalAmount(spell.damage, raceDamageMultiplier("magic"))}点伤害。`);
}
