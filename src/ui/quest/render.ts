import DATA from "../../data.ts";
import { hostileRaceDialogue } from "../../domain/combat/race.ts";
import { escapeHtml } from "../../domain/math.ts";
import {
  activeSmallQuestCount,
  activeSmallQuestFor,
  ensureQuestState,
  majorQuestStatus,
  questRewardText,
  smallQuestStatus
} from "../../domain/quest.ts";
import { questBelongsToCurrentPlayer } from "../../domain/session.ts";
import { state } from "../../runtime/state.ts";
import { uiState } from "../../runtime/ui-state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";
import { questDetailCard, questPanelHeader } from "../panels-helpers.ts";

const { questCatalog } = DATA;

export function renderCurrentQuestPanel() {
  ensureQuestState();
  const cards = [];
  const major = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
  if (major) cards.push(questDetailCard(major, "大型任务"));
  else cards.push('<div class="quest-card"><h3>大型任务</h3><p>当前没有接取大型任务。</p></div>');
  const smallQuests = state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled);
  if (smallQuests.length) smallQuests.forEach(q => cards.push(questDetailCard(q, "小型任务")));
  else cards.push('<div class="quest-card"><h3>小型任务 0/3</h3><p>当前没有接取小型任务。</p></div>');
  return `${questPanelHeader(`当前任务 ${smallQuests.length}/3`)}<div class="quest-list">${cards.join("")}</div>`;
}

export function renderGuildPanel() {
  const active = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
  const activeHtml = active
    ? `<div class="quest-card"><h3>${escapeHtml(active.name)}</h3><p>${escapeHtml(majorQuestStatus(active))}</p><div class="quest-actions"><button type="button" data-quest-action="settleMajor" ${active.goalDone ? "" : "disabled"}>结算</button></div></div>`
    : questCatalog.major.map(q => `<div class="quest-card"><h3>${escapeHtml(q.name)}</h3><p>${q.type === "kill" ? `讨伐${q.count}只${q.targetName}` : "前往魔王城前庭打探，并带回情报"}。报酬：${questRewardText(q.reward)}</p><div class="quest-actions"><button type="button" data-quest-action="acceptMajor" data-quest-id="${q.id}">接取</button></div></div>`).join("");
  return `${questPanelHeader("公会任务")}<div class="quest-list">${activeHtml}</div>`;
}

export function renderNpcQuestPanel() {
  const npc = state.entities.find(e => e.alive && e.name === uiState.questNpcName);
  if (!npc) return `${questPanelHeader("小任务")}<p>委托人已经不在附近。</p>`;
  const active = activeSmallQuestFor(npc.name);
  const smallCount = activeSmallQuestCount();
  const smallFull = smallCount >= 3;
  const chatText = hostileRaceDialogue(npc) ? `和${npc.name}聊了一会儿。对方语气明显带刺。` : `和${npc.name}聊了一会儿。对方的态度似乎柔和了一点。`;
  const taskHtml = active
    ? `<div class="quest-card"><h3>${escapeHtml(active.name)}</h3><p>${escapeHtml(smallQuestStatus(active))}</p><div class="quest-actions"><button type="button" data-quest-action="settleSmall" ${active.goalDone ? "" : "disabled"}>结算</button></div></div>`
    : `<div class="quest-card"><h3>小任务 ${smallCount}/3</h3><p>${npc.name}似乎有些轻便委托。每个 NPC 最多 1 个，当前玩家最多 3 个小型任务。</p><div class="quest-actions"><button type="button" data-quest-action="acceptSmall" data-quest-type="hunt" ${smallFull ? "disabled" : ""}>捕猎小动物</button><button type="button" data-quest-action="acceptSmall" data-quest-type="delivery" ${smallFull ? "disabled" : ""}>送货给另一 NPC</button></div></div>`;
  return `${questPanelHeader(npc.name)}<div class="quest-list"><div class="quest-card"><h3>普通聊天</h3><p>${chatText}</p><div class="quest-actions"><button type="button" data-quest-action="chatNpc">普通聊天</button></div></div>${taskHtml}</div>`;
}

export function renderQuestPanel() {
  if (!uiState.questOpen) return;
  const html = uiState.questMode === "guild" ? renderGuildPanel() : uiState.questMode === "current" ? renderCurrentQuestPanel() : renderNpcQuestPanel();
  if (html !== htmlCache.quest) {
    get.questPanelEl.innerHTML = html;
    htmlCache.quest = html;
  }
}
