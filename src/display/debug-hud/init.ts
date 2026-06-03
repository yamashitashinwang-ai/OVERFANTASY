import type Phaser from "phaser";
import { W } from "../../runtime/constants.ts";
import { dumpLogs } from "../../runtime/log.ts";
import { display as D } from "../runtime.ts";

export function initDebugHud(scene: Phaser.Scene) {
  D.debugHudBg = scene.add.rectangle(W - 16, 152, 320, 220, 0x07090b, 0.78)
    .setOrigin(1, 0).setScrollFactor(0).setDepth(90).setVisible(false);
  D.debugHudText = scene.add.text(W - 26, 158, "", {
    fontFamily: "monospace", fontSize: "12px", color: "#dbe4ea",
    lineSpacing: 2
  }).setOrigin(1, 0).setScrollFactor(0).setDepth(91).setVisible(false);

  scene.input.keyboard.on("keydown-F2", () => {
    const next = !D.debugHudBg.visible;
    D.debugHudBg.setVisible(next);
    D.debugHudText.setVisible(next);
  });

  scene.input.keyboard.on("keydown-F3", async () => {
    const text = dumpLogs(300);
    try {
      await navigator.clipboard.writeText(text);
      console.log("[support] copied %d chars of game log to clipboard", text.length);
    } catch {
      console.warn("[support] clipboard blocked — log:\n" + text);
    }
  });
}
