import { state, runtime } from "../../runtime/state.ts";
import { isPlaying } from "../../runtime/ui-state.ts";
import { display as D } from "../runtime.ts";
import { lastDamageTime, lastDealtTime, tickDebugFps } from "./metrics.ts";

export function syncDebugHud() {
  if (!D.debugHudText?.visible) return;
  const now = performance.now();
  const fps = tickDebugFps(now);
  if (fps !== null) D._debugFps = fps;

  const p = state.player;
  const monsters = state.entities
    .filter(e => e.alive && e.faction === "monster")
    .map(e => ({ d: Math.hypot(e.x - p.x, e.y - p.y), e }))
    .sort((a, b) => a.d - b.d);
  const closest = monsters[0];
  const lastDamageT = lastDamageTime();
  const lastDealtT = lastDealtTime();

  const lines = [
    "=== DEBUG (F2) ===",
    `mode=${state.mode}  scene=${state.scene}`,
    `isPlaying=${isPlaying()}  pSceneRef=${!!runtime.pSceneRef}`,
    `appMode? monsterForm=${p.monsterForm}`,
    `player pos=(${p.x.toFixed(2)},${p.y.toFixed(2)})`,
    `HP ${p.hp}/${p.maxHp}  invuln=${(p.invuln || 0).toFixed(2)}`,
    `stamina=${p.stamina.toFixed(1)}  hitStop=${(runtime.hitStopTimer || 0).toFixed(2)}`,
    `weapon=${p.gear?.weapon}  atk=${p.atk}  def=${p.def}`,
    `attackCD=${(p.attackCooldown || 0).toFixed(2)}`,
    "",
    `MONSTERS NEARBY (${monsters.length}):`,
    ...monsters.slice(0, 3).map(m =>
      `  ${m.d.toFixed(2)}t ${m.e.name} hp=${m.e.hp} cd=${(m.e.cooldown || 0).toFixed(2)} aggro=${(m.e.playerAggro || 0).toFixed(1)}`
    ),
    "",
    `last PLAYER_HURT: ${lastDamageT ? ((now - lastDamageT) / 1000).toFixed(1) + "s ago" : "never"}`,
    `last ENTITY_HIT/DEFEATED: ${lastDealtT ? ((now - lastDealtT) / 1000).toFixed(1) + "s ago" : "never"}`,
    `fps≈${D._debugFps || "?"}`
  ];
  D.debugHudText.setText(lines.join("\n"));

  if (closest && closest.d < 0.9 && !p.monsterForm && (p.invuln || 0) <= 0) {
    const since = now - lastDamageT;
    if (since > 2000) {
      D.debugHudText.setColor("#ff6b6b");
      return;
    }
  }
  D.debugHudText.setColor("#dbe4ea");
}
