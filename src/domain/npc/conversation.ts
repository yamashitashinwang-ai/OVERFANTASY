import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { shareMagicRumor } from '../magic.ts';
import { hostileRaceDialogue } from '../combat/race.ts';
import { adjustNpcMemory } from '../npc-memory.ts';
import type { ActorState } from '../types.ts';

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
