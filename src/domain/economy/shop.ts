import { state } from '../../runtime/state.ts';
import { log, toast } from '../../runtime/services.ts';
import { isNearAction } from '../npc/spatial.ts';

export function buyPotion() {
  if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
  if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
  if (state.player.gold < 8) return toast("钱不够。");
  state.player.gold -= 8;
  state.player.potions += 1;
  log("买到一瓶小回复药。");
}

export function buyArrows(amount = 1) {
  const count = Math.max(1, Number(amount) || 1);
  const price = count;
  if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
  if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
  if (state.player.gold < price) return toast("钱不够。");
  state.player.gold -= price;
  state.player.arrows = (state.player.arrows || 0) + count;
  log(`买到${count}支箭。`);
}
