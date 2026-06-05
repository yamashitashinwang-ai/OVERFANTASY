import { state } from "../../runtime/state.ts";
import { log, toast } from "../../runtime/services.ts";
import { useReversePotion } from "../../domain/corruption.ts";
import { survivalRecoveryMultiplier, tryAwardSurvivalProficiency } from "../../domain/proficiency.ts";
import { htmlCache } from "../cache.ts";
import { renderBackpack } from "./render.ts";

export function useBackpackItem(id: string) {
  const p = state.player;
  if (id === "herb") {
    if (p.herbs <= 0) return;
    if (p.hp >= p.maxHp) return toast("生命已经是满的。");
    const before = p.hp;
    p.herbs -= 1;
    p.hp = Math.min(p.maxHp, p.hp + Math.ceil(10 * survivalRecoveryMultiplier()));
    if (p.hp > before) tryAwardSurvivalProficiency();
    log("使用药草，回复了少量 HP。");
  }
  if (id === "potion") {
    if (p.potions <= 0) return;
    if (p.hp >= p.maxHp) return toast("生命已经是满的。");
    const before = p.hp;
    p.potions -= 1;
    p.hp = Math.min(p.maxHp, p.hp + Math.ceil(24 * survivalRecoveryMultiplier()));
    if (p.hp > before) tryAwardSurvivalProficiency();
    log("使用回复药，HP 明显恢复。");
  }
  if (id === "reversePotion") {
    if (!useReversePotion()) return toast("没有可以使用的逆魔药。");
  }
  htmlCache.backpack = "";
  renderBackpack();
}
