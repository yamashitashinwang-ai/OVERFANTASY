// Magic — spell knowledge, MP regen, casting orchestration. The spell-name
// fuzzy matcher lives in domain/magic-input.js; this module owns the runtime
// flow: clue → learn → cast → resolve → tick.

import { state, magicChantTimeScale } from '../scenes/Game.js';
import DATA from '../data.js';
import { magicByInput, forbiddenMagicByInput, isNearMagicName, magicList } from './magic-input.js';
import { applyRaceFinalAmount, raceDamageMultiplier } from './combat/race.js';
import { spawnMagicEffect } from '../display/particles.js';
import {
  // facades still hosted in Game.js (DOM + scene wiring)
  log, toast, autoSave,
  setPendingMagicCast,
  closeMagicPanel, renderStats,
  getAimWorld
} from '../scenes/Game.js';
import { currentPetScene } from './world.js';
import { markHitReaction, defeatEntity } from './combat/damage.js';
import { magicEffects } from '../scenes/Game.js';

const { magicCatalog } = DATA;

export function knowsMagic(spellId) {
  return state.player.magicKnown.includes(spellId);
}

export function hasMagicClue(spellId) {
  return !!state.player.magicClues[spellId];
}

export function addMagicClue(spellId, message) {
  const spell = magicCatalog[spellId];
  if (!spell || hasMagicClue(spellId)) return false;
  state.player.magicClues[spellId] = true;
  log(message || spell.clueLine || `你得到了一点关于${spell.name}的线索。`);
  autoSave();
  return true;
}

export function shareMagicRumor(npc) {
  const unknown = magicList().filter(spell => !hasMagicClue(spell.id));
  if (!unknown.length) return;
  const spell = unknown[0];
  addMagicClue(spell.id, `${npc.name}提到「${spell.aliases[0]}」：${spell.clueLine}`);
}

export function learnMagicFromInput(input) {
  const forbidden = forbiddenMagicByInput(input);
  if (forbidden) {
    log(forbidden.message);
    return;
  }
  const spell = magicByInput(input);
  if (!spell) {
    log(isNearMagicName(input) ? "这个词语似乎接近某种魔法，但还不完整。" : "什么都没有发生。");
    return;
  }
  if (knowsMagic(spell.id)) {
    log("你已经掌握了这个魔法。");
    return;
  }
  if (!hasMagicClue(spell.id)) {
    log("文字发出微光，你似乎是个天才。但魔法无法成形，你还缺少某种理解。");
    return;
  }
  state.player.magicKnown.push(spell.id);
  log(`魔法回应了你。你学会了${spell.name}。`);
  autoSave();
}

export function magicTargetFilter(e) {
  if (!e.alive) return false;
  if (state.player.monsterForm) return e.faction !== "monster" && e.kind !== "animal";
  return e.faction === "monster";
}

export function hostileToPlayer(e) {
  return !!e?.alive && magicTargetFilter(e);
}

export function playerHasEnemyAggro() {
  return state.entities.some(e => hostileToPlayer(e) && (e.playerAggro || 0) > 0.01);
}

export function updateMpRegen(dt) {
  const p = state.player;
  if (p.mpRegenLock > 0 || p.mp >= p.maxMp) {
    p.mp = Math.min(p.maxMp, p.mp);
    return;
  }
  const inCombat = playerHasEnemyAggro();
  const rate = inCombat ? (0.3 + p.maxMp * 0.02) : (1 + p.maxMp * 0.05);
  p.mp = Math.min(p.maxMp, p.mp + rate * dt);
}

export function magicCastPoint(maxRange = 12.5) {
  const p = state.player;
  const aimWorld = getAimWorld();
  // Fallback uses aim direction × maxRange when no pointer worldX/Y is captured.
  const raw = aimWorld || { x: p.x + maxRange, y: p.y };
  const dx = raw.x - p.x;
  const dy = raw.y - p.y;
  const d = Math.hypot(dx, dy);
  if (d <= maxRange) return { x: raw.x, y: raw.y };
  return { x: p.x + (dx / d) * maxRange, y: p.y + (dy / d) * maxRange };
}

export function closestEnemyAtPoint(point, radius) {
  let best = null;
  let bestD = Infinity;
  for (const e of state.entities) {
    if (!magicTargetFilter(e)) continue;
    const d = Math.hypot(e.x - point.x, e.y - point.y);
    if (d <= radius && d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

export function friendlyAtPoint(point, radius) {
  const pets = state.pets
    .filter(pet => !pet.lost && !pet.injured && pet.alive && currentPetScene() === (pet.scene || currentPetScene()))
    .map(pet => ({ target: pet, d: Math.hypot(pet.x - point.x, pet.y - point.y) }))
    .filter(item => item.d <= radius)
    .sort((a, b) => a.d - b.d);
  if (pets[0]) return pets[0].target;
  const npc = state.entities
    .filter(e => e.alive && (e.kind === "npc" || e.kind === "friendly"))
    .map(e => ({ target: e, d: Math.hypot(e.x - point.x, e.y - point.y) }))
    .filter(item => item.d <= radius)
    .sort((a, b) => a.d - b.d)[0];
  return npc?.target || null;
}

export function damageByMagic(target, amount, spell) {
  const finalAmount = applyRaceFinalAmount(amount, raceDamageMultiplier("magic"));
  target.hp -= finalAmount;
  target.playerAggro = (target.playerAggro || 0) + finalAmount + 10;
  markHitReaction(target, spell.id === "thunderFlash");
  if (target.hp <= 0) defeatEntity(target);
  return finalAmount;
}

export function startMagicEffect(spell, x, y, radius = 0.8) {
  const duration = spell.effectDuration || 0.8;
  const color = spell.color || "#d9d4ff";
  // Visuals: Phaser particle emitters now own the eye-candy. We keep the
  // logical entry in magicEffects so zone tick damage (updateMagicZoneEffect)
  // can still iterate it.
  spawnMagicEffect(spell.id, x, y, radius, color, duration);
  magicEffects.push({
    spellId: spell.id,
    name: spell.name,
    kind: spell.kind,
    x,
    y,
    radius,
    color,
    time: 0,
    duration,
    tickTimer: 0,
    damagePerSecond: spell.damagePerSecond || 0,
    slowPower: spell.slowPower || 0
  });
}

export function beginMagicCast(spellId) {
  const spell = magicCatalog[spellId];
  if (!spell || !knowsMagic(spellId)) return toast("还没有掌握这个魔法。");
  if (state.player.monsterForm) return toast("魔物化状态下无法稳定组织魔法。");
  if (state.player.mp < spell.cost) return toast("MP 不足。");
  state.player.mp -= spell.cost;
  const chantTime = (spell.chant || 0.5) * magicChantTimeScale;
  setPendingMagicCast({ spellId, timer: chantTime, total: chantTime });
  log(`开始吟唱${spell.name}。`);
  closeMagicPanel();
  renderStats();
}

export function resolveMagicCast(cast) {
  const spell = magicCatalog[cast.spellId];
  if (!spell) return;
  state.player.mpRegenLock = 1.5;
  const point = magicCastPoint(12.5);
  if (spell.kind === "heal") {
    const target = friendlyAtPoint(point, spell.radius) || state.player;
    const before = target.hp;
    const heal = applyRaceFinalAmount(spell.heal, raceDamageMultiplier("magic"));
    target.hp = Math.min(target.maxHp, target.hp + heal);
    startMagicEffect({ id: cast.spellId, ...spell }, target.x, target.y, spell.radius);
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
    log(`施放${spell.name}命中${target.name}，造成${dealt}点伤害。`);
    return;
  }
  if (spell.kind === "zone") {
    startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
    log(`施放${spell.name}，寒雾在指定位置扩散。`);
    return;
  }
  const affected = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - point.x, e.y - point.y) <= spell.radius);
  let dealt = 0;
  for (const e of [...affected]) dealt = damageByMagic(e, spell.damage, { id: cast.spellId, ...spell });
  startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
  log(`施放${spell.name}，${affected.length}个目标受到${dealt || applyRaceFinalAmount(spell.damage, raceDamageMultiplier("magic"))}点伤害。`);
}

export function updateMagicZoneEffect(effect, dt) {
  if (effect.kind !== "zone") return;
  effect.tickTimer += dt;
  const targets = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - effect.x, e.y - effect.y) <= effect.radius);
  for (const e of targets) {
    e.slowTimer = Math.max(e.slowTimer || 0, 0.25);
    e.slowPower = Math.max(e.slowPower || 0, effect.slowPower || 0.2);
  }
  while (effect.tickTimer >= 1) {
    effect.tickTimer -= 1;
    for (const e of [...targets]) {
      if (e.alive) damageByMagic(e, effect.damagePerSecond || 1, { id: effect.spellId });
    }
  }
}
