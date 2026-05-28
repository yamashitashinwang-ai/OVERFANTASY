// Engine-agnostic event bus. Domain services publish facts ("player:hurt",
// "quest:accepted", "inventory:itemAdded"); scenes and UI subscribe.
//
// Implementation: thin facade over Phaser.Events.EventEmitter so the same bus
// works inside scenes (where EventEmitter is already loaded) without depending
// on a 3rd-party event lib.

import Phaser from 'phaser';

export const Events = {
  // Player lifecycle
  PLAYER_HURT:        'player:hurt',
  PLAYER_HEALED:      'player:healed',
  PLAYER_DEFEATED:    'player:defeated',
  PLAYER_STATS:       'player:stats',          // any stat changed (hp/mp/stam/gold)
  PLAYER_RACE_SET:    'player:race-set',

  // Entities
  ENTITY_HIT:         'entity:hit',            // { entity, critical }
  ENTITY_DEFEATED:    'entity:defeated',       // { entity, byPet?, byPlayer? }
  ENTITY_SPAWN:       'entity:spawn',

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
  MAGIC_CAST_BEGIN:   'magic:cast-begin',
  MAGIC_CAST_RESOLVE: 'magic:cast-resolve',

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

// Singleton bus shared across the whole app. Scenes / domain modules import
// `bus` and call .emit / .on / .off.
export const bus = new Phaser.Events.EventEmitter();
