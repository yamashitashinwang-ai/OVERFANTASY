import { uiState } from '../../runtime/ui-state.ts';
import { refreshForgePanel, renderForgePanel } from '../../ui/forge.ts';
import { forgeMaterial, forgeRing, forgeWeapon } from '../../domain/economy.ts';
import type { GearSlot } from '../../domain/types.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class ForgeScene extends ModalPanelScene {
  constructor() { super('ForgeScene', 'forgePanel', 'forgeOpen'); }
  get cacheKey() { return 'forge'; }
  render() { renderForgePanel(); }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const tabButton = target?.closest<HTMLButtonElement>('button[data-forge-tab]');
    const materialButton = target?.closest<HTMLButtonElement>('button[data-forge-material]');
    const weaponCategoryButton = target?.closest<HTMLButtonElement>('button[data-forge-weapon-category]');
    const weaponButton = target?.closest<HTMLButtonElement>('button[data-forge-weapon]');
    const actionButton = target?.closest<HTMLButtonElement>('button[data-forge-action]');
    if (tabButton) { uiState.forgeTab = tabButton.dataset.forgeTab; refreshForgePanel(); return; }
    if (materialButton) { uiState.forgeSelectedMaterial = materialButton.dataset.forgeMaterial; refreshForgePanel(); return; }
    if (weaponCategoryButton) {
      uiState.forgeWeaponCategory = weaponCategoryButton.dataset.forgeWeaponCategory;
      uiState.forgeSelectedWeapon = null;
      refreshForgePanel();
      return;
    }
    if (weaponButton) { uiState.forgeSelectedWeapon = weaponButton.dataset.forgeWeapon; refreshForgePanel(); return; }
    if (!actionButton) return;
    const action = actionButton.dataset.forgeAction;
    if (action === 'close') return this.close();
    if (action === 'forgeRing') forgeRing();
    if (action === 'forgeMaterial') forgeMaterial(actionButton.dataset.material, actionButton.dataset.slot as GearSlot);
    if (action === 'forgeWeapon') forgeWeapon(actionButton.dataset.weapon);
    refreshForgePanel();
  }
}
