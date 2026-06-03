import { state } from "../../../runtime/state.ts";
import { log, toast } from "../../../runtime/services.ts";
import { log as dlog, NS } from "../../../runtime/log.ts";
import { interruptPendingMagicCast } from "../../magic-casting.ts";

export function playerDefend() {
  if (state.player.monsterForm) {
    dlog(NS.COMBAT_BLOCK, "aborted: monsterForm");
    toast("魔物化状态更适合突进，不能稳定防御。");
    return;
  }
  if (state.player.stamina < 2) {
    dlog(NS.COMBAT_BLOCK, "aborted: low stamina %s", state.player.stamina.toFixed(1));
    toast("体力不足，架势撑不起来。");
    return;
  }
  interruptPendingMagicCast("block");
  state.player.stamina = Math.max(0, state.player.stamina - 2);
  state.player.blockTimer = 0.95;
  state.player.attackCooldown = Math.max(state.player.attackCooldown, 0.25);
  dlog(NS.COMBAT_BLOCK, "engaged stamina=%s", state.player.stamina.toFixed(1));
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
  interruptPendingMagicCast("dodge");
  state.player.stamina = Math.max(0, state.player.stamina - 6);
  state.player.dodgeTimer = 0.28;
  state.player.dodgeCooldown = 1.15 * cooldownCut;
  state.player.invuln = Math.max(state.player.invuln, 0.34);
  state.player.blockTimer = 0;
  log("闪避！短时间内不会受到伤害，移动速度提升。");
}
