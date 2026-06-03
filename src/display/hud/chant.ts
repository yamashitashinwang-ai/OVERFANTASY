import DATA from "../../data.ts";
import { H, W } from "../../runtime/constants.ts";
import { getPendingMagicCast } from "../../runtime/state.ts";
import { clamp } from "../../domain/math.ts";
import { hexToInt } from "../colors.ts";
import { display as D } from "../runtime.ts";

const { magicCatalog } = DATA;

export function syncMagicChantBar() {
  const pending = getPendingMagicCast();
  if (pending) {
    const spell = magicCatalog[pending.spellId];
    const progress = clamp(1 - pending.timer / Math.max(0.001, pending.total || pending.timer), 0, 1);
    const barW = W * 0.5;
    const barH = 18;
    const bx = (W - barW) / 2;
    const by = H * 0.8;
    D.chantBarGfx.clear();
    D.chantBarGfx.fillStyle(0x07090b, 0.72);
    D.chantBarGfx.fillRect(bx - 4, by - 28, barW + 8, 50);
    D.chantBarGfx.lineStyle(2, 0xedf3f7, 0.7);
    D.chantBarGfx.strokeRect(bx, by, barW, barH);
    D.chantBarGfx.fillStyle(hexToInt(spell?.color || "#d9d4ff"), 1);
    D.chantBarGfx.fillRect(bx + 2, by + 2, Math.max(0, (barW - 4) * progress), barH - 4);
    D.chantText.setText(`吟唱 ${spell?.name || "魔法"} ${(progress * 100).toFixed(0)}%`);
    D.chantText.setVisible(true);
    D.chantBarGfx.setVisible(true);
  } else if (D.chantBarGfx.visible) {
    D.chantBarGfx.clear();
    D.chantBarGfx.setVisible(false);
    D.chantText.setVisible(false);
  }
}
