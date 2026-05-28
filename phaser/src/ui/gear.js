// HTML panel renderer. Subscribes to game state via the domain services /
// re-exports from scenes/Game.js. No engine GameObjects — just innerHTML.

import { state } from '../scenes/Game.js';
import DATA from '../data.js';
const { gearCatalog, materialCatalog } = DATA;
import { escapeHtml, formatNumber } from '../domain/math.js';
import { t, raceLabel, languageOptions, currentLanguage } from '../domain/i18n.js';
import { htmlCache } from './cache.js';
import { get } from './dom.js';
import { currentWeapon, gearLabel, gearModList, slotName, refreshCombatStats } from '../domain/combat/weapon.js';
import {
  log, toast, autoSave
} from '../scenes/Game.js';
import { bus, Events } from '../runtime/events.js';

let attached = false;
export function attachGearPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.GEAR_EQUIPPED, renderGearPanel);
  bus.on(Events.INVENTORY_CHANGED, renderGearPanel);
  bus.on(Events.LANGUAGE_CHANGED, renderGearPanel);
  bus.on(Events.GAME_NEW, renderGearPanel);
  bus.on(Events.GAME_LOADED, renderGearPanel);
  renderGearPanel();
}

export function renderGearPanel() {
  const rows = state.player.gearBag
    .map(id => {
      const gear = gearCatalog[id];
      if (!gear) return "";
      const equipped = state.player.gear[gear.slot] === id || (state.player.monsterForm && id === "demonClaw");
      const button = equipped ? "已装备" : "装备";
      return `<div class="gear-row"><span>${gearLabel(id)}</span><button type="button" data-gear="${id}" ${equipped ? "disabled" : ""}>${button}</button></div>`;
    })
    .join("");
  const materialRows = Object.entries(state.player.materials)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => {
      const material = materialCatalog[name] || { desc: "素材" };
      const sellButton = material.unsellable ? `<button type="button" disabled>不可卖</button>` : `<button type="button" data-material="${name}" data-action="sell">卖</button>`;
      const petButton = material.pet ? `<button type="button" data-material="${name}" data-action="adoptPet">宠物</button>` : "";
      const forgeButtons = [
        ["weapon", "武"],
        ["head", "头"],
        ["body", "衣"],
        ["legs", "裤"],
        ["feet", "鞋"],
        ["accessory", "饰"]
      ].map(([slot, label]) => `<button type="button" data-material="${name}" data-action="forge" data-slot="${slot}" title="锻造到${slotName(slot)}">${label}</button>`).join("");
      return `<div class="gear-row material-row"><span>${name} x${count} ${material.desc}</span><span class="material-actions">${sellButton}${forgeButtons}${petButton}</span></div>`;
    })
    .join("");
  const html = `<strong>装备栏</strong>${rows || "<div class=\"gear-row\"><span>暂无装备</span></div>"}<strong>素材</strong>${materialRows || "<div class=\"gear-row\"><span>暂无素材</span></div>"}`;
  if (html !== htmlCache.gear) {
    get.gearPanelEl.innerHTML = html;
    htmlCache.gear = html;
  }
}
