import { bus, Events } from "../../runtime/events.ts";
import { renderGearPanel } from "./render.ts";

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
