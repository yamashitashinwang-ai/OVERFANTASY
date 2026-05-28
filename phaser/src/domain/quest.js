// Quest domain — accept, track, settle major and small quests. Emits bus
// events (QUEST_ACCEPTED / QUEST_PROGRESS / QUEST_SETTLED) so the HUD + side
// panel can re-render without the domain pulling DOM.

import { state } from '../scenes/Game.js';
import DATA from '../data.js';
import { clonePlain, clamp } from './math.js';
import { rand } from './math.js';
import {
  currentPlayerId, questBelongsToCurrentPlayer, ensureQuestOwnership
} from './session.js';
import { bus, Events } from '../runtime/events.js';
import {
  // facades still hosted in Game.js — they touch log/UI and reach into npc memory.
  log, toast, autoSave, closeQuestPanel, addResource, adjustNpcMemory
} from '../scenes/Game.js';

const { questCatalog } = DATA;

export function ensureQuestState() {
  if (!state.quests) state.quests = { major: null, small: [] };
  if (!Array.isArray(state.quests.small)) state.quests.small = [];
  if (state.quests.major) ensureQuestOwnership(state.quests.major);
  for (const quest of state.quests.small) ensureQuestOwnership(quest);
}

export function activeSmallQuestFor(npcName) {
  ensureQuestState();
  return state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.giver === npcName && !q.settled) || null;
}

export function activeSmallQuestCount() {
  ensureQuestState();
  return state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled).length;
}

export function majorQuestStatus(q) {
  if (!q) return "无大型任务。";
  if (q.type === "kill") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，可回公会结算" : ""}`;
  if (q.type === "scout") return `${q.name}：${q.goalDone ? "情报已取得，回公会结算" : "前往魔王城前庭任务点"}`;
  return q.name;
}

export function smallQuestStatus(q) {
  if (!q) return "无小型任务。";
  if (q.type === "hunt") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，回到委托人处交付" : ""}`;
  if (q.type === "delivery") return `${q.name}：${q.delivered ? "已送达，回委托人处结算" : `送给${q.targetNpc}`}`;
  return q.name;
}

export function questRewardText(reward) {
  const amountText = value => Array.isArray(value) ? `${value[0]}-${value[1]}` : value;
  const parts = [];
  if (reward.gold) parts.push(`${amountText(reward.gold)}G`);
  if (reward.potions) parts.push(`药水${amountText(reward.potions)}`);
  if (reward.wood) parts.push(`木头${amountText(reward.wood)}`);
  if (reward.stone) parts.push(`石头${amountText(reward.stone)}`);
  if (reward.herbs) parts.push(`草药${amountText(reward.herbs)}`);
  if (reward.affection) parts.push(`好感+${amountText(reward.affection)}`);
  if (reward.devotion) parts.push(`献身+${amountText(reward.devotion)}`);
  return parts.join(" / ") || "无";
}

export function rollQuestReward(reward = {}) {
  const rolled = {};
  for (const [key, value] of Object.entries(reward)) {
    const amount = Array.isArray(value) ? Math.floor(rand(value[0], value[1] + 1)) : value;
    if (amount) rolled[key] = amount;
  }
  return rolled;
}

export function acceptMajorQuest(id) {
  if (questBelongsToCurrentPlayer(state.quests.major)) return toast("大型任务最多同时持有 1 个。");
  const template = questCatalog.major.find(q => q.id === id);
  if (!template) return;
  state.quests.major = ensureQuestOwnership({ ...clonePlain(template), reward: rollQuestReward(template.reward), progress: 0, goalDone: false, autoSettleAt: null, settled: false });
  log(`接取大型任务：${template.name}。`);
  autoSave();
  closeQuestPanel();
}

export function chooseDeliveryTarget(giverName) {
  return state.entities.find(e => e.alive && e.kind === "npc" && e.name !== giverName)?.name || null;
}

export function acceptSmallQuest(npcName, type) {
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

export function payQuestReward(q) {
  const reward = q.reward || {};
  state.player.gold = (state.player.gold || 0) + (reward.gold || 0);
  state.player.potions = (state.player.potions || 0) + (reward.potions || 0);
  if (reward.wood) addResource("木材", reward.wood);
  if (reward.stone) addResource("反重力石", reward.stone);
  state.player.herbs = (state.player.herbs || 0) + (reward.herbs || 0);
  if (q.giver) adjustNpcMemory(q.giver, reward.affection || 0, reward.devotion || 0);
}

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

export function settleSmallQuest(q, auto = false) {
  if (!q || !questBelongsToCurrentPlayer(q) || !q.goalDone) return false;
  payQuestReward(q);
  q.settled = true;
  if (auto && q.type === "delivery") log(`送货结果会通过民间消息传回委托人。获得${questRewardText(q.reward)}。`);
  else log(`${q.giver}结算了小任务：${q.name}，获得${questRewardText(q.reward)}。`);
  state.quests.small = state.quests.small.filter(item => !item.settled);
  autoSave();
  return true;
}

export function recordQuestDefeat(e) {
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

export function handleDeliveryTalk(npc) {
  const quest = state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.type === "delivery" && !q.delivered && q.targetNpc === npc.name);
  if (!quest) return false;
  quest.delivered = true;
  quest.goalDone = true;
  quest.autoSettleAt = state.time + (quest.autoSettleDelay || 22);
  log(`把货物交给了${npc.name}。回到${quest.giver}处可立即结算；否则消息传开后会自动结算。`);
  autoSave();
  return true;
}

export function updateQuestProgress(dt) {
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
