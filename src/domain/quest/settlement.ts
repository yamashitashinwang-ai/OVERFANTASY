import { state } from '../../runtime/state.ts';
import { questBelongsToCurrentPlayer } from '../session.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log } from '../../runtime/services.ts';
import type { QuestState } from '../types.ts';
import { payQuestReward, questRewardText } from './rewards.ts';

export function settleMajorQuest(auto = false) {
  const q = state.quests.major;
  if (!q || !questBelongsToCurrentPlayer(q) || !q.goalDone) return false;
  payQuestReward(q);
  if (auto && q.type === "kill") log(`消息传回公会，讨伐任务报酬已送达。获得${questRewardText(q.reward)}。`);
  else log(`公会结算了大型任务：${q.name}，获得${questRewardText(q.reward)}。`);
  state.quests.major = null;
  autoSave();
  return true;
}

export function settleSmallQuest(q: QuestState | null | undefined, auto = false): boolean {
  if (!q || !questBelongsToCurrentPlayer(q) || !q.goalDone) return false;
  payQuestReward(q);
  q.settled = true;
  if (auto && q.type === "delivery") log(`送货结果会通过民间消息传回委托人。获得${questRewardText(q.reward)}。`);
  else log(`${q.giver}结算了小任务：${q.name}，获得${questRewardText(q.reward)}。`);
  state.quests.small = state.quests.small.filter(item => !item.settled);
  autoSave();
  return true;
}
