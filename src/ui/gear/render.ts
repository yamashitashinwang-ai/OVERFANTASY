import DATA from "../../data.ts";
import { gearLabel, slotName } from "../../domain/combat/weapon.ts";
import { state } from "../../runtime/state.ts";
import { htmlCache } from "../cache.ts";
import { get } from "../dom.ts";

const { gearCatalog, materialCatalog } = DATA;

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
  const html = `<strong>装备栏</strong>${rows || '<div class="gear-row"><span>暂无装备</span></div>'}<strong>素材</strong>${materialRows || '<div class="gear-row"><span>暂无素材</span></div>'}`;
  if (html !== htmlCache.gear) {
    get.gearPanelEl.innerHTML = html;
    htmlCache.gear = html;
  }
}
