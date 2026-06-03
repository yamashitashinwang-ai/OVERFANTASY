import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { autoSave } from '../../runtime/autosave.ts';
import { log, toast } from '../../runtime/services.ts';
import { nearestEntity } from '../combat/targeting.ts';
import { recallPets } from '../inventory.ts';
import { adjustNpcMemory } from '../npc-memory.ts';
import { clamp } from '../math.ts';
import { relieveDeathFatigue } from '../death.ts';
import { nearestObject } from './spatial.ts';
import { publishEntityInteraction, publishPlayerInteraction } from './interaction-events.ts';

const { regions } = DATA;

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
  relieveDeathFatigue('rest');
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

export function helpWounded() {
  const wounded = nearestEntity(1.45, e => e.wounded && e.alive);
  if (!wounded) return false;
  if (state.player.herbs <= 0 && state.player.potions <= 0) return false;
  publishPlayerInteraction();
  publishEntityInteraction(wounded);
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
