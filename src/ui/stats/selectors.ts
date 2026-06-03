import DATA from "../../data.ts";
import { currentWeapon, hasPathosEffect } from "../../domain/combat/weapon.ts";
import { materialSummary } from "../../domain/inventory.ts";
import { raceLabel, t } from "../../domain/i18n.ts";
import { formatNumber } from "../../domain/math.ts";
import { ownedByCurrentPlayer, questBelongsToCurrentPlayer } from "../../domain/session.ts";
import { regionAt } from "../../domain/world.ts";
import { state } from "../../runtime/state.ts";

const { regions } = DATA;

function petsForCurrentPlayer() {
  return state.pets.filter(pet => ownedByCurrentPlayer(pet));
}

function ensureQuestState() {
  if (!state.quests) state.quests = { major: null, small: [] };
  if (!Array.isArray(state.quests.small)) state.quests.small = [];
}

export function statRows(): [string, string][] {
  const area = state.mode === "world" ? regionAt(state.player.x, state.player.y) : regions.ruins;
  const weapon = currentWeapon();
  const pathos = hasPathosEffect();
  const activePets = petsForCurrentPlayer().filter(pet => !pet.lost);
  const livingPets = activePets.filter(pet => pet.alive && !pet.injured);
  const injuredPets = activePets.filter(pet => pet.injured);
  ensureQuestState();
  const currentMajorQuest = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
  const currentSmallQuests = state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled);
  const questText = currentMajorQuest ? currentMajorQuest.name : (currentSmallQuests[0]?.name || t("status.none"));
  const pathosText = pathos ? ` ${t("status.pathos")}` : "";
  const statusText = state.player.monsterForm
    ? `${t("status.monster")}${pathosText}`
    : `${raceLabel(state.player.race)}/${state.player.job}${pathosText}`;
  const actionText = state.player.running
    ? t("status.running")
    : (state.player.blockTimer > 0 ? t("status.blocking")
      : (state.player.dodgeCooldown > 0 ? `${t("status.dodge")}${state.player.dodgeCooldown.toFixed(1)}s` : t("status.ready")));

  return [
    [t("stat.status"), statusText],
    [t("stat.hp"), `${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`],
    [t("stat.mp"), `${formatNumber(state.player.mp)}/${state.player.maxMp}`],
    [t("stat.stamina"), `${state.player.stamina.toFixed(1)}/30${state.player.running ? ` ${t("status.running")}` : ""}`],
    [t("stat.attackDefense"), `${t("unit.attack")}${state.player.atk} ${t("unit.defense")}${state.player.def}`],
    [t("stat.supplies"), `药草${state.player.herbs} 药水${state.player.potions} 箭${state.player.arrows || 0}`],
    [t("stat.resources"), `木${state.player.wood} 石${state.player.stone} ${state.player.gold}G`],
    [t("stat.materials"), materialSummary(2)],
    [t("stat.weapon"), `${weapon.name}/${weapon.type}`],
    [t("stat.performance"), `${t("unit.range")}${weapon.range} ${t("unit.attackCooldown")}${weapon.cooldown.toFixed(2)}s`],
    [t("stat.cooldown"), `${t("unit.attackShort")}${state.player.attackCooldown.toFixed(2)}s ${t("unit.dodgeShort")}${state.player.dodgeCooldown.toFixed(2)}s`],
    [t("stat.area"), `${t("unit.trust")}${area.trust} ${t("unit.hate")}${area.hate}`],
    [t("stat.action"), actionText],
    [t("stat.pet"), injuredPets.length ? `${livingPets.length}/${activePets.length} ${t("unit.injured")}${injuredPets.length}` : `${livingPets.length}/${activePets.length}`],
    [t("stat.quest"), questText],
    [t("stat.relation"), `${state.player.spouse || t("status.none")} 戒${state.player.rings}`]
  ];
}
