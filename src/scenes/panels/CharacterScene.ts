import { Events } from '../../runtime/events.ts';
import { openCareerPanel } from '../../ui/career.ts';
import { renderCharacterPanel } from '../../ui/character.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class CharacterScene extends ModalPanelScene {
  constructor() { super('CharacterScene', 'characterPanel', 'characterOpen'); }
  get cacheKey() { return 'character'; }
  closeShortcutKeys() { return ['ESC', 'P']; }
  render() { renderCharacterPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.PLAYER_STATS, Events.PROFICIENCY_CHANGED,
      Events.PROFICIENCY_LEVEL_UP, Events.INVENTORY_CHANGED, Events.GEAR_EQUIPPED,
      Events.MAGIC_CAST_BEGIN, Events.MAGIC_CAST_RESOLVE, Events.CAREER_CHANGED
    ];
  }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const actionButton = target?.closest<HTMLButtonElement>('button[data-character-action]');
    if (actionButton?.dataset.characterAction === 'close') this.close();
    if (actionButton?.dataset.characterAction === 'career' && !actionButton.disabled) {
      this.close();
      openCareerPanel();
    }
  }
}
