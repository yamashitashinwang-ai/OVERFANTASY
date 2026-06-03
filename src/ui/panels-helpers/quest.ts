import { escapeHtml } from '../../domain/math.ts';
import type { QuestState } from '../../domain/types.ts';
import { majorQuestStatus, questRewardText, smallQuestStatus } from '../../domain/quest.ts';

export function questPanelHeader(title: string): string {
  return `<div class="quest-head"><strong>${escapeHtml(title)}</strong><button type="button" data-quest-action="close">关闭</button></div>`;
}

export function questObjectiveText(q: QuestState): string {
  if (q.type === "kill") return `讨伐${q.targetName}：${q.progress || 0}/${q.count}`;
  if (q.type === "hunt") return `捕获${q.targetName}：${q.progress || 0}/${q.count}`;
  if (q.type === "delivery") return `送货给${q.targetNpc || "指定 NPC"}：${q.delivered ? "已送达" : "未送达"}`;
  if (q.type === "scout") return `抵达魔王城前庭任务点：${q.goalDone ? "情报已取得" : "未完成"}`;
  return q.name;
}

export function questAutoSettlementText(q: QuestState): string {
  if (q.type === "kill") return "允许自动结算：目标完成后一段时间，消息会传回公会。";
  if (q.type === "delivery") return "允许自动结算：送货结果会通过民间消息传回委托人。";
  if (q.type === "hunt") return "不允许自动结算：需要玩家交付捕获的动物。";
  if (q.type === "scout") return "不允许自动结算：情报必须由玩家亲自带回公会。";
  return "不允许自动结算。";
}

export function questDetailCard(q: QuestState, label: string): string {
  const status = label === "大型任务" ? majorQuestStatus(q) : smallQuestStatus(q);
  return `<div class="quest-card"><h3>${escapeHtml(label)}：${escapeHtml(q.name)}</h3><p>任务目标：${escapeHtml(questObjectiveText(q))}</p><p>${escapeHtml(questAutoSettlementText(q))}</p><p>当前状态：${escapeHtml(status)}</p><p>报酬：${escapeHtml(questRewardText(q.reward || {}))}</p></div>`;
}
