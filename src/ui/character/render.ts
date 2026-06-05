import DATA from "../../data.ts";
import { currentWeapon, equippedGear, gearModList, hasPathosEffect } from "../../domain/combat/weapon.ts";
import { raceMoveSpeedMultiplier, raceStaminaRegenMultiplier } from "../../domain/combat/race.ts";
import { raceLabel } from "../../domain/i18n.ts";
import { escapeHtml, formatNumber } from "../../domain/math.ts";
import {
  careerState,
  classTendencyLabel,
  firstClassLabel,
  hasFirstClassChoice,
  proficiencyCatalog,
  proficiencyExpToNextLevel,
  proficiencyOrder,
  subclassLabel,
  ensureProficiencyState
} from "../../domain/proficiency.ts";
import { currentAreaName } from "../../domain/world.ts";
import { getPendingMagicCast, state } from "../../runtime/state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { modSummary, panelHeader } from "../panels-helpers.ts";

const maxStamina = 30;

function row(label: string, value: string | number): string {
  return `<div class="character-row"><b>${escapeHtml(label)}</b><span>${escapeHtml(String(value))}</span></div>`;
}

function actionRow(label: string, body: string): string {
  return `<div class="character-row character-action-row"><b>${escapeHtml(label)}</b><span>${body}</span></div>`;
}

function section(title: string, body: string): string {
  return `<section class="character-section"><h3>${escapeHtml(title)}</h3><div class="character-grid">${body}</div></section>`;
}

function raceBonusText(): string {
  if (state.player.race === "精灵") return "弓和魔法更强；弓术、魔法熟练度成长有小概率翻倍。";
  if (state.player.race === "矮人") return "锤和枪更强，防御略高；锤术、枪术熟练度成长有小概率翻倍。";
  return "剑和匕首略强；剑术、匕首熟练度成长有小概率翻倍。";
}

function movementSpeedText(): string {
  const walk = 3.6 * raceMoveSpeedMultiplier();
  const run = walk * 1.45;
  return `步行 ${formatNumber(walk, 2)} / 奔跑 ${formatNumber(run, 2)}`;
}

function staminaRegenText(): string {
  return `${formatNumber((0.8 + maxStamina * 0.02) * raceStaminaRegenMultiplier(), 2)}/秒`;
}

function mpRegenText(): string {
  const safeMaxMp = Math.max(0, Number(state.player.maxMp || 0));
  const normal = 1 + safeMaxMp * 0.05;
  const combat = 0.3 + safeMaxMp * 0.02;
  return `非战斗 ${formatNumber(normal, 2)}/秒 / 战斗 ${formatNumber(combat, 2)}/秒`;
}

function activeEffectText(): string {
  const effects: string[] = [];
  if (hasPathosEffect()) effects.push("悲怆：伤害降低，防御提高");
  if (state.player.running) effects.push("奔跑中");
  if (state.player.runExhausted) effects.push("奔跑力竭");
  if (state.player.blockTimer > 0) effects.push(`防御 ${formatNumber(state.player.blockTimer, 1)}秒`);
  if (state.player.dodgeTimer > 0) effects.push(`闪避动作 ${formatNumber(state.player.dodgeTimer, 1)}秒`);
  if (state.player.attackCooldown > 0) effects.push(`攻击冷却 ${formatNumber(state.player.attackCooldown, 1)}秒`);
  if (state.player.dodgeCooldown > 0) effects.push(`闪避冷却 ${formatNumber(state.player.dodgeCooldown, 1)}秒`);
  const pendingCast = getPendingMagicCast();
  if (pendingCast) effects.push(`吟唱中：${DATA.magicCatalog[pendingCast.spellId]?.name || "魔法"}`);
  return effects.length ? effects.join("、") : "无";
}

function proficiencyRows(): string {
  const proficiency = ensureProficiencyState();
  return proficiencyOrder.map(id => {
    const record = proficiency.records[id];
    const progress = record.level >= 30 ? "MAX" : `${record.exp}/${proficiencyExpToNextLevel(record.level)}`;
    return row(proficiencyCatalog[id].label, `Lv${record.level} ${progress}`);
  }).join("");
}

function equippedBonusRows(): string {
  const gear = equippedGear();
  const totalAtk = gear.reduce((sum, item) => sum + (item.atk || 0), 0);
  const totalDef = gear.reduce((sum, item) => sum + (item.def || 0), 0);
  const modTexts = Object.values(state.player.gear)
    .filter(Boolean)
    .flatMap(id => gearModList(id))
    .map(mod => modSummary(mod))
    .filter(Boolean);
  const equippedNames = gear.map(item => item.name).join("、") || "无";
  return [
    row("当前装备", equippedNames),
    row("装备合计", `攻击+${totalAtk} / 防御+${totalDef}`),
    row("锻造词条", modTexts.length ? modTexts.join("、") : "无")
  ].join("");
}

function careerButtonHtml(): string {
  const career = careerState();
  const enabled = career.firstClassConfirmed || hasFirstClassChoice();
  const hint = enabled ? "打开职业选择界面" : "任意熟练度达到 5 级后可以选择职业。";
  const disabled = enabled ? "" : " disabled";
  return [
    `<button type="button" data-character-action="career" title="${escapeHtml(hint)}"${disabled}>职业选择</button>`,
    `<small>${escapeHtml(hint)}</small>`
  ].join("");
}

export function renderCharacterPanel() {
  const weapon = currentWeapon();
  const html = [
    panelHeader("角色状态", "character"),
    `<div class="character-scroll">`,
    section("基础信息", [
      row("种族", raceLabel(state.player.race)),
      row("地图 / 区域", currentAreaName()),
      row("金币", `${state.player.gold}G`)
    ].join("")),
    section("职业信息", [
      row("职业倾向", classTendencyLabel()),
      row("第一职业", firstClassLabel()),
      row("细分职业", subclassLabel()),
      actionRow("职业选择", careerButtonHtml())
    ].join("")),
    section("基础状态", [
      row("生命", `${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`),
      row("魔力", `${formatNumber(state.player.mp)}/${state.player.maxMp}`),
      row("体力", `${formatNumber(state.player.stamina)}/${maxStamina}`),
      row("攻击", state.player.atk),
      row("防御", state.player.def),
      row("移动速度", movementSpeedText()),
      row("体力恢复", staminaRegenText()),
      row("MP 回复", mpRegenText())
    ].join("")),
    section("状态影响", [
      row("当前增益 / 减益", activeEffectText()),
      row("种族补正", raceBonusText())
    ].join("")),
    section("熟练度", proficiencyRows()),
    section("装备影响", [
      row("当前武器", weapon.name),
      row("武器类型", weapon.type || "无"),
      row("武器性能", `攻击 ${weapon.atk || 0} / 距离 ${formatNumber(weapon.range || 0, 2)} / 间隔 ${formatNumber(weapon.cooldown || 0, 2)}秒`),
      equippedBonusRows()
    ].join("")),
    `</div>`
  ].join("");

  if (html !== htmlCache.character) {
    get.characterPanelEl.innerHTML = html;
    htmlCache.character = html;
  }
}
