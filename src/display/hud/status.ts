import { state } from "../../runtime/state.ts";
import { currentWeapon, hasPathosEffect } from "../../domain/combat/weapon.ts";
import { currentAreaName } from "../../domain/world.ts";
import { display as D } from "../runtime.ts";

export function syncHudStatusLine() {
  const weapon = currentWeapon();
  const pathos = hasPathosEffect();

  D.hudAreaText.setText(`${currentAreaName()}  ${state.player.monsterForm ? "魔物化" : state.player.race + " " + state.player.job}${pathos ? " 悲怆" : ""}`);
  D.hudWeaponText.setText(`${weapon.name} ${weapon.type} 攻${state.player.atk} 防${state.player.def}  箭${state.player.arrows || 0}`);
  if (D.monsterFormBanner) D.monsterFormBanner.setVisible(!!state.player.monsterForm);
}
