// Engine-agnostic event bus. Domain services publish facts ("player:hurt",
// "quest:accepted", "inventory:itemAdded"); scenes and UI subscribe.
//
// Implementation: tiny local event emitter. Keeping it engine-agnostic lets
// pure domain tests import gameplay modules without booting Phaser.

export const Events = {
  // Player lifecycle
  PLAYER_HURT:        'player:hurt',
  PLAYER_HEALED:      'player:healed',
  PLAYER_DEFEATED:    'player:defeated',
  PLAYER_STATS:       'player:stats',          // any stat changed (hp/mp/stam/gold)
  PLAYER_RACE_SET:    'player:race-set',
  PLAYER_INTERACTED:  'player:interacted',
  PLAYER_ATTACK_STARTED: 'player:attack-started',

  // Proficiency
  PROFICIENCY_CHANGED:  'proficiency:changed',
  PROFICIENCY_LEVEL_UP: 'proficiency:level-up',
  CAREER_CHANGED:       'career:changed',

  // Entities
  ENTITY_HIT:         'entity:hit',            // { entity, critical }
  ENTITY_DEFEATED:    'entity:defeated',       // { entity, byPet?, byPlayer? }
  ENTITY_SPAWN:       'entity:spawn',
  ENTITY_INTERACTED:  'entity:interacted',     // { actor }

  // Pets
  PET_INJURED:        'pet:injured',
  PET_RESCUED:        'pet:rescued',
  PET_DIED:           'pet:died',

  // Inventory
  INVENTORY_CHANGED:  'inventory:changed',     // anything in gearBag/materials
  GEAR_EQUIPPED:      'gear:equipped',         // { slot, gearId }

  // Quests
  QUEST_ACCEPTED:     'quest:accepted',        // { quest }
  QUEST_PROGRESS:     'quest:progress',        // { quest }
  QUEST_SETTLED:      'quest:settled',         // { quest, reward }

  // Magic
  MAGIC_LEARNED:      'magic:learned',
  MAGIC_CLUE:         'magic:clue',
  MAGIC_CAST_BEGIN:       'magic:cast-begin',
  MAGIC_CAST_RESOLVE:     'magic:cast-resolve',
  MAGIC_CAST_INTERRUPTED: 'magic:cast-interrupted',
  MAGIC_EFFECT_SPAWNED:   'magic:effect-spawned',

  // Scene / world
  SCENE_LOADED:       'world:scene-loaded',    // { scene }
  DUNGEON_ENTERED:    'world:dungeon-entered',
  DUNGEON_LEFT:       'world:dungeon-left',

  // App / UI
  LOG_APPENDED:       'log:appended',          // { text }
  TOAST_SHOWN:        'toast:shown',           // { text }
  LANGUAGE_CHANGED:   'i18n:changed',
  PANEL_OPEN:         'ui:panel-open',         // { id }
  PANEL_CLOSE:        'ui:panel-close',        // { id }

  // Game lifecycle
  GAME_NEW:           'game:new',
  GAME_LOADED:        'game:loaded',
  GAME_PAUSED:        'game:paused',
  GAME_RESUMED:       'game:resumed',
  GAME_SAVED:         'game:saved',

  // Runtime assertions — see runtime/invariants.js. Fires when a gameplay
  // invariant breaks (e.g. "adjacent monster failed to deal damage").
  INVARIANT_BROKEN:   'invariant:broken'        // { id, message, t }
};

type BusHandler = (...args: unknown[]) => void;

class EventBus {
  private listeners = new Map<string, Set<BusHandler>>();

  on(event: string, handler: BusHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return this;
  }

  off(event: string, handler?: BusHandler) {
    if (!handler) this.listeners.delete(event);
    else this.listeners.get(event)?.delete(handler);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    for (const handler of [...(this.listeners.get(event) || [])]) handler(...args);
    return this;
  }
}

// Singleton bus shared across the whole app. Scenes / domain modules import
// `bus` and call .emit / .on / .off.
export const bus = new EventBus();
