// Quest compatibility facade. State queries, rewards, accepting, settlement,
// and progress tracking live under domain/quest/ by responsibility.

export {
  ensureQuestState,
  activeSmallQuestFor,
  activeSmallQuestCount,
  majorQuestStatus,
  smallQuestStatus
} from './quest/state.ts';
export {
  rewardNumber,
  questRewardText,
  rollQuestReward,
  payQuestReward
} from './quest/rewards.ts';
export type { QuestRewardValue, QuestReward } from './quest/rewards.ts';
export {
  acceptMajorQuest,
  chooseDeliveryTarget,
  acceptSmallQuest
} from './quest/accept.ts';
export {
  settleMajorQuest,
  settleSmallQuest
} from './quest/settlement.ts';
export {
  recordQuestDefeat,
  handleDeliveryTalk,
  updateQuestProgress
} from './quest/progress.ts';
