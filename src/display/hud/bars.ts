import { state } from "../../runtime/state.ts";
import { clamp, formatNumber } from "../../domain/math.ts";
import { display as D } from "../runtime.ts";

function drawBar(value: number, max: number, barY: number, color: number) {
  const safeMax = Math.max(1, max || 1);
  D.hudBarsGfx.fillStyle(0x111820, 1);
  D.hudBarsGfx.fillRect(104, barY, 180, 9);
  D.hudBarsGfx.fillStyle(color, 1);
  D.hudBarsGfx.fillRect(104, barY, 180 * clamp(value / safeMax, 0, 1), 9);
}

export function syncHudResourceBars() {
  D.hudBarsGfx.clear();
  drawBar(Math.max(0, state.player.hp), state.player.maxHp, 70, 0xe85b5b);
  drawBar(state.player.mp, state.player.maxMp, 86, 0x5aa7ff);
  drawBar(state.player.stamina, 30, 102, state.player.running ? 0xf3c45b : 0x62c78f);
  D.hudBarsGfx.fillStyle(0xdbe4ea, 1);

  D.hudCooldownText.setText(`冷却 攻${state.player.attackCooldown.toFixed(2)}s  闪${state.player.dodgeCooldown.toFixed(2)}s`);
  if (D.hpLabel) D.hpLabel.setText(`生命 ${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`);
  if (D.mpLabel) D.mpLabel.setText(`魔力 ${formatNumber(state.player.mp)}/${state.player.maxMp}`);
  if (D.staminaLabel) D.staminaLabel.setText(`体力 ${state.player.stamina.toFixed(1)}/30`);
}
