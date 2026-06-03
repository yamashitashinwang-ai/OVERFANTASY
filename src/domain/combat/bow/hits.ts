import {
  state,
  getHitStopTimer,
  setHitStopTimer
} from "../../../runtime/state.ts";
import { log } from "../../../runtime/services.ts";
import { raceDamageMultiplier, applyRaceFinalAmount } from "../race.ts";
import { markHitReaction, defeatEntity } from "../damage.ts";
import type { ActorState, ArrowProjectile } from "../../types.ts";

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
