import { state } from '../../runtime/state.ts';
import { toast } from '../../runtime/services.ts';
import { requestOpenForgePanel, requestOpenMagicPanel, requestOpenShopPanel } from '../../runtime/panel-actions.ts';
import { relieveDeathFatigue } from '../death.ts';
import { enterDungeon } from '../dungeon.ts';
import { purifyAtShrine } from '../corruption.ts';
import { teleportThroughPortal } from '../teleport.ts';
import type { WorldObjectState } from '../types.ts';
import { openGuildPanel } from './panels.ts';
import { restoreInjuredPets } from './pet-rescue.ts';
import { rest } from './services.ts';
import { worldNews } from './world-news.ts';

export function useObject(obj: WorldObjectState) {
  if (obj.action && obj.action.startsWith('portal:')) {
    teleportThroughPortal(obj);
    return;
  }
  if (obj.action === 'shop') {
    if (state.player.monsterForm) { toast('商人拒绝和魔物化角色交易。 '); return; }
    requestOpenShopPanel();
    return;
  }
  if (obj.action === 'house') rest();
  if (obj.action === 'guild') { openGuildPanel(); return; }
  if (obj.action === 'news') worldNews(true);
  if (obj.action === 'cleanse') {
    purifyAtShrine(obj);
    relieveDeathFatigue('shrine');
    restoreInjuredPets();
  }
  if (obj.action === 'dungeon') enterDungeon();
  if (obj.action === 'demonKeep') {
    toast('魔王城内层还没开放。这里会接概率极低的魔王/继任者事件。');
  }
  if (obj.action === 'forge') { requestOpenForgePanel(); return; }
  if (obj.action === 'magicCottage') { requestOpenMagicPanel('study', obj.name); return; }
}
