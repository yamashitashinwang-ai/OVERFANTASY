import { state } from '../../runtime/state.ts';
import { log, toast } from '../../runtime/services.ts';
import { nearestEntity } from '../combat/targeting.ts';
import { handleDeliveryTalk, activeSmallQuestFor, settleSmallQuest } from '../quest.ts';
import { npcMemoryFor } from '../npc-memory.ts';
import { chatWithNpc } from './conversation.ts';
import { nearestObject } from './spatial.ts';
import { useObject } from './object-use.ts';
import { publishEntityInteraction, publishPlayerInteraction } from './interaction-events.ts';
import { handlePetMemorial } from './pet-rescue.ts';
import { openNpcQuestPanel } from './panels.ts';

export function talkOrUse() {
  if (handlePetMemorial()) return;
  const npc = nearestEntity(1.5, e => e.kind === "npc" || e.kind === "friendly");
  if (npc) {
    publishPlayerInteraction();
    publishEntityInteraction(npc);
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
    publishPlayerInteraction();
    useObject(obj);
    return;
  }
  toast("周围没有可以互动的对象。");
}
