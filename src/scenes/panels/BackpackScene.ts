import { uiState } from '../../runtime/ui-state.ts';
import { renderBackpack, toggleBackpackGear, useBackpackItem } from '../../ui/backpack.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class BackpackScene extends ModalPanelScene {
  constructor() { super('BackpackScene', 'backpackPanel', 'backpackOpen'); }
  get cacheKey() { return 'backpack'; }
  closeShortcutKeys() { return ['ESC', 'B']; }
  render() { renderBackpack(); }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const categoryButton = target?.closest<HTMLButtonElement>('button[data-bag-category]');
    const itemButton = target?.closest<HTMLButtonElement>('button[data-bag-item]');
    const actionButton = target?.closest<HTMLButtonElement>('button[data-bag-action]');
    if (categoryButton) {
      uiState.backpackCategory = categoryButton.dataset.bagCategory;
      uiState.backpackSelected = null;
      this.refresh();
      return;
    }
    if (itemButton) {
      uiState.backpackSelected = itemButton.dataset.bagItem;
      this.refresh();
      return;
    }
    if (!actionButton) return;
    const action = actionButton.dataset.bagAction;
    if (action === 'close') return this.close();
    if (action === 'use') useBackpackItem(actionButton.dataset.id);
    if (action === 'gearToggle') toggleBackpackGear(actionButton.dataset.id);
    this.refresh();
  }
}
