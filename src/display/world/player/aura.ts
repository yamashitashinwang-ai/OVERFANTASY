import { display as D } from '../../runtime.ts';
import { state } from '../../../runtime/state.ts';
import { clamp } from '../../../domain/math.ts';

export function syncCorruptionAura() {
  if (!D.corruptionGfx || !D.playerCircle) return;
  D.corruptionGfx.clear();
  const corruption = state.player.corruption || 0;
  if (corruption < 30) return;
  const level = clamp(Math.floor((corruption - 30) / 10) + 1, 1, 8);
  const cx = D.playerCircle.x;
  const cy = D.playerCircle.y;
  for (let i = 0; i < level; i += 1) {
    const radius = state.player.r + 8 + i * 5;
    D.corruptionGfx.fillStyle(0x8f38ff, 0.035 + level * 0.008);
    D.corruptionGfx.fillCircle(cx, cy, radius);
    D.corruptionGfx.lineStyle(1, 0xd59bff, 0.05 + level * 0.01);
    D.corruptionGfx.strokeCircle(cx, cy, radius + 2);
  }
  for (let i = 0; i < level * 3; i += 1) {
    const angle = state.time * (0.7 + i * 0.03) + i * 2.17;
    const radius = state.player.r + 10 + (i % 4) * 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle * 0.82) * radius * 0.72;
    D.corruptionGfx.fillStyle(0xc47dff, 0.08 + level * 0.01);
    D.corruptionGfx.fillCircle(x, y, 2.2 + level * 0.45);
  }
}
