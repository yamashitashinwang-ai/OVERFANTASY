// NPC interaction — talk / gift / rest / fight aid / chat. Pulls together
// inputs from state, world, inventory, quest, and relationship memory.

import { state } from '../runtime/state.ts';
import { runtime } from '../runtime/state.ts';
import DATA from '../data.ts';
import { rand, clamp, dist, choice } from './math.ts';
import { ownedByCurrentPlayer } from './session.ts';
import { hostileRaceDialogue } from './combat/race.ts';
import { addEntity, addPickup, currentPetScene } from './world.ts';
import { nearestEntity } from './combat/targeting.ts';
import { autoSave } from '../runtime/autosave.ts';
import { log, toast } from '../runtime/services.ts';
import { adjustNpcMemory, npcMemoryFor } from './npc-memory.ts';
import { loadScene, enterDungeon } from './dungeon.ts';
import { handleDeliveryTalk, activeSmallQuestFor, settleSmallQuest } from './quest.ts';
import { shareMagicRumor } from './magic.ts';
import { recallPets } from './inventory.ts';
import type { ActorState, PetRemainState, Vector2, WorldObjectState } from './types.ts';

const { regions, sceneNames } = DATA;

export function objectEdgeDistance(o: WorldObjectState, actor: Vector2 = state.player): number {
  const dx = Math.max(o.x - actor.x, 0, actor.x - (o.x + o.w));
  const dy = Math.max(o.y - actor.y, 0, actor.y - (o.y + o.h));
  return Math.hypot(dx, dy);
}

export function nearestObject(range = 1.4) {
  let best: WorldObjectState | null = null;
  let bestD = Infinity;
  for (const o of state.objects) {
    const edgeDistance = objectEdgeDistance(o);
    if (edgeDistance < range && edgeDistance < bestD) {
      best = o;
      bestD = edgeDistance;
    }
  }
  return best;
}

export function chatWithNpc(npc: ActorState, message: string | null = null) {
  const freshTalk = (npc.lastTalk || 0) + 8 < state.time;
  if (freshTalk) {
    adjustNpcMemory(npc, 1, 0);
    npc.lastTalk = state.time;
  }
  npc.wantsTalk = false;
  const hostileTone = hostileRaceDialogue(npc);
  log(hostileTone ? `${npc.name}和你说话时语气明显带刺。` : (message || `${npc.name}和你聊了一会儿。对方的态度似乎柔和了一点。`));
  if (freshTalk) shareMagicRumor(npc);
}

export function talkOrUse() {
  if (handlePetMemorial()) return;
  const npc = nearestEntity(1.5, e => e.kind === "npc" || e.kind === "friendly");
  if (npc) {
    if (state.player.monsterForm) {
      toast(`${npc.name}后退了。魔物化状态下很难正常交谈。`);
      return;
    }
    if (handleDeliveryTalk(npc)) return;
    const activeSmall = activeSmallQuestFor(npc.name);
    if (activeSmall?.goalDone) {
      settleSmallQuest(activeSmall, false);
      return;
    }
    if (npc.kind === "npc") {
      openNpcQuestPanel(npc);
      return;
    }
    chatWithNpc(npc);
    if (npc.affection >= 80 && state.player.rings > 0 && !state.player.spouse) {
      state.player.rings -= 1;
      if (Math.random() < 0.72) {
        state.player.spouse = npc.name;
        npc.devotion = 40;
        const memory = npcMemoryFor(npc);
        if (memory) memory.devotion = Math.max(memory.devotion || 0, 40);
        log(`${npc.name}收下了戒指。你们决定一起生活。`);
      } else {
        log(`${npc.name}收下心意但还没准备好。`);
      }
    }
    return;
  }
  const obj = nearestObject();
  if (obj) {
    useObject(obj);
    return;
  }
  toast("周围没有可以互动的对象。");
}

export function gift() {
  if (state.player.giftCooldown > 0) {
    toast("刚送过礼，继续硬塞只会让人困扰。");
    return;
  }
  const npc = nearestEntity(1.5, e => e.kind === "npc" || e.kind === "friendly");
  if (!npc) {
    toast("附近没有适合赠礼的对象。");
    return;
  }
  if (state.player.potions <= 0 && state.player.rings <= 0) {
    toast("普通药草不再算像样的礼物。至少需要药水，戒指则用于求婚。");
    return;
  }
  let gain = 0;
  if (state.player.potions > 0) {
    state.player.potions -= 1;
    gain = 4 + Math.floor(Math.random() * 4);
  } else {
    state.player.rings -= 1;
    gain = 12;
  }
  state.player.giftCooldown = 18;
  adjustNpcMemory(npc, gain, Math.ceil(gain / 3));
  log(`${npc.name}接受了礼物。你看不见具体变化，只能从反应里猜测距离。`);
}

export function rest() {
  if (state.mode === "dungeon") {
    toast("迷宫里无法安心休息。 ");
    return;
  }
  const obj = nearestObject(2.0);
  if (!obj || obj.kind !== "house") {
    toast("需要靠近空屋才能休息。 ");
    return;
  }
  state.player.hp = state.player.maxHp;
  state.player.stamina = 30;
  state.player.mp = state.player.maxMp;
  for (const pet of state.pets) {
    if (!pet.injured && !pet.lost) {
      pet.alive = true;
      pet.hp = pet.maxHp;
    }
  }
  recallPets();
  log("在空屋休息了一晚。伴侣系统、共用房屋不满事件可继续接到这里。 ");
  autoSave();
}

export function isNearAction(action: string, range = 2.3): boolean {
  return state.objects.some(obj => obj.action === action && objectEdgeDistance(obj) < range);
}

export function helpWounded() {
  const wounded = nearestEntity(1.45, e => e.wounded && e.alive);
  if (!wounded) return false;
  if (state.player.herbs <= 0 && state.player.potions <= 0) return false;
  if (state.player.potions > 0) state.player.potions -= 1;
  else state.player.herbs -= 1;
  wounded.wounded = false;
  wounded.hp = wounded.maxHp;
  wounded.affection = 55;
  wounded.devotion = 35;
  regions.village.trust = clamp(regions.village.trust + 8, 0, 100);
  log("你把物资交给伤者。没有任务提示，但有人记住了这件事。 ");
  return true;
}

export function handlePetRescue() {
  const carried = state.pets.find(pet => ownedByCurrentPlayer(pet) && pet.injured && pet.carried && !pet.lost);
  if (carried) {
    if (isNearAction("cleanse", 2.5)) return false;
    toast(`你正抱着${carried.name}。带它去白石祠、树根祠或残破圣像。`);
    return true;
  }
  const sceneKey = currentPetScene();
  const pet = state.pets.find(candidate => ownedByCurrentPlayer(candidate) && candidate.injured && !candidate.carried && !candidate.lost && candidate.scene === sceneKey && dist(candidate, state.player) < 1.5);
  if (!pet) return false;
  pet.carried = true;
  pet.x = state.player.x;
  pet.y = state.player.y;
  log(`你抱起了重伤的${pet.name}。剩余${Math.ceil(pet.rescueTimer / 60)}分钟。`);
  return true;
}

export function restoreInjuredPets() {
  const sceneKey = currentPetScene();
  const targets = state.pets.filter(pet => ownedByCurrentPlayer(pet) && pet.injured && !pet.lost && (pet.carried || (pet.scene === sceneKey && dist(pet, state.player) < 2.0)));
  if (!targets.length) return false;
  for (const pet of targets) {
    pet.injured = false;
    pet.carried = false;
    pet.alive = true;
    pet.hp = pet.maxHp;
    pet.rescueTimer = 0;
    pet.scene = sceneKey;
    pet.x = state.player.x + rand(-1.0, 1.0);
    pet.y = state.player.y + rand(-1.0, 1.0);
    pet.cooldownTimer = 0.5;
  }
  log(`神龛恢复了${targets.map(pet => pet.name).join("、")}。`);
  return true;
}

export function worldNews(force = false) {
  const events = [
    () => {
      const r = choice(Object.values(regions));
      r.hate = clamp(r.hate + 8, 0, 100);
      return `新闻：${r.name}附近出现魔物潮，区域仇恨上升。`;
    },
    () => {
      const r = choice(Object.values(regions));
      r.trust = clamp(r.trust - 6, 0, 100);
      addEntity({ kind: "npc", name: "伤兵", faction: "human", x: rand(8, 17), y: rand(9, 15), r: 9, hp: 8, maxHp: 18, atk: 1, color: "#f09c86", region: "village", affection: 0, devotion: 0, wounded: true });
      return `新闻：边境小战结束，${r.name}出现伤者。`;
    },
    () => {
      addPickup("herb", "药草", rand(23, 35), rand(6, 20), "#6bd46c");
      return "新闻：树灵森林雨后长出新的药草。";
    },
    () => {
      const r = regions.village;
      r.trust = clamp(r.trust + 4, 0, 100);
      return "新闻：白铃村商队抵达，村民安心了一些。";
    }
  ];
  if (force || state.newsClock <= 0) {
    log(choice(events)());
    state.newsClock = 42 + Math.random() * 28;
  }
}

// ─── World-object use / pet memorial / quest-panel opens ─────────────────
// These four functions tie NPC interaction to scene flow + panels.  Panel
// open functions briefly touch DOM + ui/cache; they will move into the
// Phaser-native panel scenes in Step 6.

import { htmlCache } from '../ui/cache.ts';
import { uiState } from '../runtime/ui-state.ts';
import { renderQuestPanel } from '../ui/quest.ts';
import { openShopPanel } from '../ui/shop.ts';
import { openForgePanel } from '../ui/forge.ts';
import { openMagicPanel } from '../ui/magic.ts';
import { refreshCombatStats } from './combat/weapon.ts';

export function useObject(obj: WorldObjectState) {
  if (obj.action && obj.action.startsWith('portal:')) {
    const [, scene, x, y] = obj.action.split(':');
    loadScene(scene, Number(x), Number(y), `穿过${obj.name}，来到${sceneNames[scene] || '新区域'}。`);
    return;
  }
  if (obj.action === 'shop') {
    if (state.player.monsterForm) { toast('商人拒绝和魔物化角色交易。 '); return; }
    openShopPanel();
    return;
  }
  if (obj.action === 'house') rest();
  if (obj.action === 'guild') { openGuildPanel(); return; }
  if (obj.action === 'news') worldNews(true);
  if (obj.action === 'cleanse') {
    const shrineName = obj.name || '祠';
    if (state.player.monsterForm) {
      state.player.monsterForm = false;
      refreshCombatStats();
      state.player.hp = state.player.maxHp;
      restoreInjuredPets();
      log(`${shrineName}驱散了魔素，角色回到正常势力。 `);
    } else if (!restoreInjuredPets()) toast(`${shrineName}很安静。 `);
  }
  if (obj.action === 'dungeon') enterDungeon();
  if (obj.action === 'demonKeep') {
    toast('魔王城内层还没开放。这里会接概率极低的魔王/继任者事件。');
  }
  if (obj.action === 'forge') { openForgePanel(); return; }
  if (obj.action === 'magicCottage') { openMagicPanel('study', obj.name); return; }
}

function nearestPetRemain(kind: string, range = 1.45): PetRemainState | null {
  const sceneKey = currentPetScene();
  let best: PetRemainState | null = null, bestD = Infinity;
  for (const remain of state.petRemains) {
    if (!ownedByCurrentPlayer(remain)) continue;
    if (remain.kind !== kind || remain.scene !== sceneKey) continue;
    const d = dist(remain, state.player);
    if (d < range && d < bestD) { best = remain; bestD = d; }
  }
  return best;
}

export function handlePetMemorial() {
  const corpse = nearestPetRemain('corpse');
  if (!corpse) return false;
  corpse.kind = 'grave';
  corpse.age = 0;
  corpse.decay = 0;
  corpse.decayClock = 0;
  log('"YOU ARE THE BEST...MY DEAR DEAR FRIEND..."');
  log(`原地留下了${corpse.petName}的坟墓。`);
  return true;
}

export function openGuildPanel() {
  uiState.questMode = 'guild';
  uiState.questNpcName = null;
  launchQuest();
}

export function openNpcQuestPanel(npc: ActorState) {
  uiState.questMode = 'npc';
  uiState.questNpcName = npc.name;
  launchQuest();
}

function launchQuest() {
  const s = runtime.pSceneRef;
  if (!s) return;
  if (s.scene.isActive('QuestScene')) {
    htmlCache.quest = '';
    renderQuestPanel();
  } else {
    s.scene.launch('QuestScene');
    s.scene.pause();
  }
}
