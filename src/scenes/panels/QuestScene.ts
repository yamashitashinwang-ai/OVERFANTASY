import { Events } from '../../runtime/events.ts';
import { state } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { renderQuestPanel } from '../../ui/quest.ts';
import {
  acceptMajorQuest,
  acceptSmallQuest,
  activeSmallQuestFor,
  settleMajorQuest,
  settleSmallQuest
} from '../../domain/quest.ts';
import { chatWithNpc } from '../../domain/npc.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class QuestScene extends ModalPanelScene {
  constructor() { super('QuestScene', 'questPanel', 'questOpen'); }
  get cacheKey() { return 'quest'; }
  render() { renderQuestPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.QUEST_ACCEPTED, Events.QUEST_PROGRESS,
      Events.QUEST_SETTLED, Events.INVENTORY_CHANGED
    ];
  }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('button[data-quest-action]');
    if (!button) return;
    const action = button.dataset.questAction;
    if (action === 'close') return this.close();
    if (action === 'acceptMajor') acceptMajorQuest(button.dataset.questId);
    if (action === 'settleMajor') settleMajorQuest(false);
    if (action === 'chatNpc') {
      const npc = state.entities.find(e => e.alive && e.name === uiState.questNpcName);
      if (npc) chatWithNpc(npc, `${uiState.questNpcName}和你聊了一会儿。`);
      return this.close();
    }
    if (action === 'acceptSmall') acceptSmallQuest(uiState.questNpcName, button.dataset.questType);
    if (action === 'settleSmall') {
      const q = activeSmallQuestFor(uiState.questNpcName);
      settleSmallQuest(q, false);
    }
    this.refresh();
  }
}
