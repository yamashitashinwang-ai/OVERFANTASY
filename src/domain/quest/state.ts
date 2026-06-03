import { state } from '../../runtime/state.ts';
import { questBelongsToCurrentPlayer, ensureQuestOwnership } from '../session.ts';
import type { QuestState } from '../types.ts';

export function ensureQuestState() {
  if (!state.quests) state.quests = { major: null, small: [] };
  if (!Array.isArray(state.quests.small)) state.quests.small = [];
  if (state.quests.major) ensureQuestOwnership(state.quests.major);
  for (const quest of state.quests.small) ensureQuestOwnership(quest);
}

export function activeSmallQuestFor(npcName: string): QuestState | null {
  ensureQuestState();
  return state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.giver === npcName && !q.settled) || null;
}

export function activeSmallQuestCount() {
  ensureQuestState();
  return state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled).length;
}

export function majorQuestStatus(q: QuestState | null | undefined): string {
  if (!q) return "无大型任务。";
  if (q.type === "kill") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，可回公会结算" : ""}`;
  if (q.type === "scout") return `${q.name}：${q.goalDone ? "情报已取得，回公会结算" : "前往魔王城前庭任务点"}`;
  return q.name;
}

export function smallQuestStatus(q: QuestState | null | undefined): string {
  if (!q) return "无小型任务。";
  if (q.type === "hunt") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，回到委托人处交付" : ""}`;
  if (q.type === "delivery") return `${q.name}：${q.delivered ? "已送达，回委托人处结算" : `送给${q.targetNpc}`}`;
  return q.name;
}
