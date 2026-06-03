import { state } from '../../runtime/state.ts';
import { questBelongsToCurrentPlayer } from '../session.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log } from '../../runtime/services.ts';
import type { ActorState } from '../types.ts';
import { ensureQuestState } from './state.ts';
import { settleMajorQuest, settleSmallQuest } from './settlement.ts';

export function recordQuestDefeat(e: ActorState) {
  const major = state.quests.major;
  if (major?.type === "kill" && questBelongsToCurrentPlayer(major) && !major.goalDone && e.species === major.species) {
    major.progress += 1;
    if (major.progress >= major.count) {
      major.goalDone = true;
      major.autoSettleAt = state.time + (major.autoSettleDelay || 30);
      log(`${major.name}目标完成。可回公会结算；若不返回，消息流通后也会自动结算。`);
      autoSave();
    }
  }
  for (const q of state.quests.small) {
    if (questBelongsToCurrentPlayer(q) && q.type === "hunt" && !q.goalDone && e.species === q.species) {
      q.progress += 1;
      if (q.progress >= q.count) {
        q.goalDone = true;
        log(`${q.name}目标完成。需要回到${q.giver}处交付。`);
        autoSave();
      }
    }
  }
}

export function handleDeliveryTalk(npc: ActorState): boolean {
  const quest = state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.type === "delivery" && !q.delivered && q.targetNpc === npc.name);
  if (!quest) return false;
  quest.delivered = true;
  quest.goalDone = true;
  quest.autoSettleAt = state.time + (quest.autoSettleDelay || 22);
  log(`把货物交给了${npc.name}。回到${quest.giver}处可立即结算；否则消息传开后会自动结算。`);
  autoSave();
  return true;
}

export function updateQuestProgress(_dt: number) {
  ensureQuestState();
  const major = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
  if (major?.type === "scout" && !major.goalDone && state.scene === major.scene && Math.hypot(state.player.x - major.x, state.player.y - major.y) <= major.radius) {
    major.goalDone = true;
    log("你确认了魔王城前庭的情报。需要回公会报告。");
    autoSave();
  }
  if (major?.goalDone && major.autoSettleAt && state.time >= major.autoSettleAt) settleMajorQuest(true);
  for (const q of [...state.quests.small].filter(questBelongsToCurrentPlayer)) {
    if (q.goalDone && q.autoSettleAt && state.time >= q.autoSettleAt) settleSmallQuest(q, true);
  }
}
