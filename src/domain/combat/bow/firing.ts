import { bus, Events } from "../../../runtime/events.ts";
import { flyingArrows, state } from "../../../runtime/state.ts";
import { log, toast } from "../../../runtime/services.ts";
import { playerAimAngle } from "../../../runtime/input.ts";
import { clamp } from "../../math.ts";
import { currentWeapon } from "../weapon.ts";
import { publishPlayerAttackStarted } from "../visual-events.ts";
import { bowProjectileOrigin } from "../bow-trajectory.ts";
import { bowShotStats, isBowWeapon } from "./stats.ts";

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
  publishPlayerAttackStarted("attack_bow");
  const angle = playerAimAngle();
  const stats = bowShotStats(weapon, clamp(charge, 0, 1));
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const origin = bowProjectileOrigin(angle);
  flyingArrows.push({
    x: origin.x,
    y: origin.y,
    startX: origin.x,
    startY: origin.y,
    endX: origin.x + ux * stats.range,
    endY: origin.y + uy * stats.range,
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
  bus.emit(Events.PLAYER_STATS);
}
