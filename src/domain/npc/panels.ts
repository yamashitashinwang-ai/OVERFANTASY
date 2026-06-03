import { requestOpenGuildQuestPanel, requestOpenNpcQuestPanel } from '../../runtime/panel-actions.ts';
import type { ActorState } from '../types.ts';

export function openGuildPanel() {
  requestOpenGuildQuestPanel();
}

export function openNpcQuestPanel(npc: ActorState) {
  requestOpenNpcQuestPanel(npc.name || '');
}
