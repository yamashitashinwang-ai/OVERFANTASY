import { state } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { log, toast } from '../../runtime/services.ts';
import { refreshShopPanel, renderShopPanel } from '../../ui/shop.ts';
import { buyArrows, buyPotion, sellMaterial } from '../../domain/economy.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

export class ShopScene extends ModalPanelScene {
  constructor() { super('ShopScene', 'shopPanel', 'shopOpen'); }
  get cacheKey() { return 'shop'; }
  render() { renderShopPanel(); }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const tabButton = target?.closest<HTMLButtonElement>('button[data-shop-tab]');
    const actionButton = target?.closest<HTMLButtonElement>('button[data-shop-action]');
    if (tabButton) { uiState.shopTab = tabButton.dataset.shopTab; refreshShopPanel(); return; }
    if (!actionButton) return;
    const action = actionButton.dataset.shopAction;
    if (action === 'close') return this.close();
    if (state.player.monsterForm) { toast('商人拒绝和魔物化角色交易。'); return this.close(); }
    if (action === 'buyPotion') { buyPotion(); refreshShopPanel(); return; }
    if (action === 'buyArrow') { buyArrows(Number(actionButton.dataset.amount || 1)); refreshShopPanel(); return; }
    const name = actionButton.dataset.material;
    if (action === 'sellOne') {
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
      refreshShopPanel();
    }
    if (action === 'sellAll') {
      const gold = sellMaterial(name, state.player.materials[name] || 0);
      if (gold > 0) log(`卖出全部${name}，获得${gold}G。`);
      refreshShopPanel();
    }
  }
}
