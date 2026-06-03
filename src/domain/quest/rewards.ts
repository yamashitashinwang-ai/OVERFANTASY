import { state } from '../../runtime/state.ts';
import { rand } from '../math.ts';
import { addResource } from '../inventory.ts';
import { adjustNpcMemory } from '../npc-memory.ts';
import type { QuestState } from '../types.ts';

export type QuestRewardValue = number | [number, number];
export type QuestReward = Record<string, QuestRewardValue>;

export function rewardNumber(value: QuestRewardValue | undefined): number {
  return Array.isArray(value) ? value[0] : value || 0;
}

export function questRewardText(reward: QuestReward = {}): string {
  const amountText = (value: QuestRewardValue) => Array.isArray(value) ? `${value[0]}-${value[1]}` : value;
  const parts: string[] = [];
  if (reward.gold) parts.push(`${amountText(reward.gold)}G`);
  if (reward.potions) parts.push(`药水${amountText(reward.potions)}`);
  if (reward.wood) parts.push(`木头${amountText(reward.wood)}`);
  if (reward.stone) parts.push(`石头${amountText(reward.stone)}`);
  if (reward.herbs) parts.push(`草药${amountText(reward.herbs)}`);
  if (reward.affection) parts.push(`好感+${amountText(reward.affection)}`);
  if (reward.devotion) parts.push(`献身+${amountText(reward.devotion)}`);
  return parts.join(" / ") || "无";
}

export function rollQuestReward(reward: QuestReward = {}): Record<string, number> {
  const rolled: Record<string, number> = {};
  for (const [key, value] of Object.entries(reward)) {
    const amount = Array.isArray(value) ? Math.floor(rand(value[0], value[1] + 1)) : value;
    if (amount) rolled[key] = amount;
  }
  return rolled;
}

export function payQuestReward(q: QuestState) {
  const reward = q.reward || {};
  state.player.gold = (state.player.gold || 0) + rewardNumber(reward.gold);
  state.player.potions = (state.player.potions || 0) + rewardNumber(reward.potions);
  if (reward.wood) addResource("木材", rewardNumber(reward.wood));
  if (reward.stone) addResource("反重力石", rewardNumber(reward.stone));
  state.player.herbs = (state.player.herbs || 0) + rewardNumber(reward.herbs);
  if (q.giver) adjustNpcMemory(q.giver, rewardNumber(reward.affection), rewardNumber(reward.devotion));
}
