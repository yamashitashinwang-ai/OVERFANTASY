import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { clonePlain } from '../math.ts';
import { questBelongsToCurrentPlayer, ensureQuestOwnership } from '../session.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { closeQuestPanel } from '../../runtime/panel-actions.ts';
import { log, toast } from '../../runtime/services.ts';
import { activeSmallQuestCount, activeSmallQuestFor } from './state.ts';
import { rollQuestReward } from './rewards.ts';

const { questCatalog } = DATA;

export function acceptMajorQuest(id: string) {
  if (questBelongsToCurrentPlayer(state.quests.major)) return toast("大型任务最多同时持有 1 个。");
  const template = questCatalog.major.find(q => q.id === id);
  if (!template) return;
  state.quests.major = ensureQuestOwnership({ ...clonePlain(template), reward: rollQuestReward(template.reward), progress: 0, goalDone: false, autoSettleAt: null, settled: false });
  log(`接取大型任务：${template.name}。`);
  autoSave();
  closeQuestPanel();
}

export function chooseDeliveryTarget(giverName: string): string | null {
  return state.entities.find(e => e.alive && e.kind === "npc" && e.name !== giverName)?.name || null;
}

export function acceptSmallQuest(npcName: string, type: string) {
  if (activeSmallQuestCount() >= 3) return toast("小型任务最多同时持有 3 个。");
  if (activeSmallQuestFor(npcName)) return toast(`${npcName}已经委托过你一件事。`);
  const template = questCatalog.small.find(q => q.type === type) || questCatalog.small[0];
  const quest = ensureQuestOwnership({ ...clonePlain(template), reward: rollQuestReward(template.reward), giver: npcName, progress: 0, goalDone: false, delivered: false, autoSettleAt: null, settled: false });
  if (quest.type === "delivery") {
    quest.targetNpc = chooseDeliveryTarget(npcName);
    if (!quest.targetNpc) return toast("附近没有合适的收件人。");
    quest.name = `给${quest.targetNpc}送货`;
  }
  state.quests.small.push(quest);
  log(`${npcName}委托了小任务：${quest.name}。`);
  autoSave();
  closeQuestPanel();
}
