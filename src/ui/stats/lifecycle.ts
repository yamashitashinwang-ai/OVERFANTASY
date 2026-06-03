import { bus, Events } from "../../runtime/events.ts";
import { renderStats } from "./render.ts";

let attached = false;

export function attachStatsPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.PLAYER_STATS, renderStats);
  bus.on(Events.INVENTORY_CHANGED, renderStats);
  bus.on(Events.GEAR_EQUIPPED, renderStats);
  bus.on(Events.LANGUAGE_CHANGED, renderStats);
  bus.on(Events.MAGIC_CAST_BEGIN, renderStats);
  bus.on(Events.MAGIC_CAST_RESOLVE, renderStats);
  bus.on(Events.QUEST_ACCEPTED, renderStats);
  bus.on(Events.QUEST_PROGRESS, renderStats);
  bus.on(Events.QUEST_SETTLED, renderStats);
  bus.on(Events.SCENE_LOADED, renderStats);
  bus.on(Events.GAME_NEW, renderStats);
  bus.on(Events.GAME_LOADED, renderStats);
  bus.on(Events.PET_INJURED, renderStats);
  bus.on(Events.PET_RESCUED, renderStats);
  bus.on(Events.PET_DIED, renderStats);
  renderStats();
}
