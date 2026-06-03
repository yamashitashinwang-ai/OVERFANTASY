import { bus, Events } from '../../runtime/events.ts';
import { state, magicEffects } from '../../runtime/state.ts';
import { applyRaceFinalAmount, raceDamageMultiplier } from '../combat/race.ts';
import { markHitReaction, defeatEntity } from '../combat/damage.ts';
import type { ActorState, MagicCatalogItem, MagicEffectState } from '../types.ts';
import type { MagicSpell } from '../magic-input.ts';
import { magicTargetFilter } from './targets.ts';

export type SpellWithId = MagicCatalogItem & { id: string };

export function damageByMagic(target: ActorState, amount: number, spell: Pick<MagicSpell, 'id'>): number {
  const finalAmount = applyRaceFinalAmount(amount, raceDamageMultiplier("magic"));
  target.hp -= finalAmount;
  target.playerAggro = (target.playerAggro || 0) + finalAmount + 10;
  markHitReaction(target, spell.id === "thunderFlash");
  if (target.hp <= 0) defeatEntity(target);
  return finalAmount;
}

export function startMagicEffect(spell: SpellWithId, x: number, y: number, radius = 0.8) {
  const duration = spell.effectDuration || 0.8;
  const color = spell.color || "#d9d4ff";
  bus.emit(Events.MAGIC_EFFECT_SPAWNED, { spellId: spell.id, x, y, radius, color, duration });
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

export function updateMagicZoneEffect(effect: MagicEffectState, dt: number) {
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
