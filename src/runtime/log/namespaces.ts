export const ROOT = 'overfantasy';

// Canonical namespace tree. Add a new key here before using it from gameplay code.
export const NAMESPACES = {
  // Combat — attack inputs, damage application, defeats
  COMBAT_PLAYER_ATTACK: `${ROOT}:combat:player-attack:event`,
  COMBAT_PLAYER_HURT: `${ROOT}:combat:player-hurt:event`,
  COMBAT_ENEMY_ATTACK: `${ROOT}:combat:enemy-attack:event`,
  COMBAT_ENTITY_HIT: `${ROOT}:combat:entity-hit:event`,
  COMBAT_DEFEAT: `${ROOT}:combat:defeat:event`,
  COMBAT_DODGE: `${ROOT}:combat:dodge:event`,
  COMBAT_BLOCK: `${ROOT}:combat:block:event`,
  COMBAT_BOW: `${ROOT}:combat:bow:event`,

  // AI per-frame state (spammy — disable unless investigating)
  AI_TICK_TRACE: `${ROOT}:ai:tick:trace`,
  AI_AGGRO_CHANGE: `${ROOT}:ai:aggro:event`,

  // Magic
  MAGIC_CAST_BEGIN: `${ROOT}:magic:cast-begin:event`,
  MAGIC_CAST_RESOLVE: `${ROOT}:magic:cast-resolve:event`,
  MAGIC_LEARNED: `${ROOT}:magic:learned:event`,

  // Inventory / economy
  INVENTORY_CHANGED: `${ROOT}:inventory:changed:event`,
  GEAR_EQUIPPED: `${ROOT}:gear:equipped:event`,
  ECONOMY_TRANSACTION: `${ROOT}:economy:transaction:event`,

  // Quest
  QUEST_LIFECYCLE: `${ROOT}:quest:lifecycle:event`,

  // Scene + game-flow lifecycle
  SCENE_TRANSITION: `${ROOT}:scene:transition:event`,
  GAME_LIFECYCLE: `${ROOT}:game:lifecycle:event`,
  PANEL_LIFECYCLE: `${ROOT}:panel:lifecycle:event`,

  // Input
  INPUT_KEY: `${ROOT}:input:key:trace`,
  INPUT_POINTER: `${ROOT}:input:pointer:trace`,

  // Runtime invariants + persistence
  INVARIANT_BROKEN: `${ROOT}:invariant:broken:warn`,
  INVARIANT_INFO: `${ROOT}:invariant:info:event`,
  PERSISTENCE: `${ROOT}:persistence:event`,
  PERSISTENCE_ERROR: `${ROOT}:persistence:error`
};

// Alias for terser call sites.
export const NS = NAMESPACES;
