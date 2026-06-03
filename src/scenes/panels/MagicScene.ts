import { Events } from '../../runtime/events.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { refreshMagicPanel, renderMagicPanel } from '../../ui/magic.ts';
import { beginMagicCast, learnMagicFromInput } from '../../domain/magic.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class MagicScene extends ModalPanelScene {
  constructor() { super('MagicScene', 'magicPanel', 'magicOpen'); }
  get cacheKey() { return 'magic'; }
  render() { renderMagicPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.MAGIC_LEARNED, Events.MAGIC_CLUE,
      Events.MAGIC_CAST_BEGIN, Events.MAGIC_CAST_RESOLVE
    ];
  }
  onInput(event: Event) {
    const target = event.target as HTMLElement | null;
    const input = target?.closest<HTMLInputElement>('[data-magic-input]');
    if (input) uiState.magicInput = input.value;
  }
  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement | null;
    if (!target?.matches?.('[data-magic-input]')) return;
    const k = event.key.toLowerCase();
    if (k === 'escape') { event.preventDefault(); this.close(); }
    else if (k === 'enter') {
      event.preventDefault();
      uiState.magicInput = target.value;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
    }
  }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('button[data-magic-action]');
    if (!button) return;
    const action = button.dataset.magicAction;
    if (action === 'close') return this.close();
    if (action === 'parse') {
      const input = this.el.querySelector('[data-magic-input]') as HTMLInputElement | null;
      uiState.magicInput = input?.value || uiState.magicInput;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
      return;
    }
    if (action === 'cast') { beginMagicCast(button.dataset.spell); refreshMagicPanel(); }
  }
}
