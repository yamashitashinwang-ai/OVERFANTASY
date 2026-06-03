// NPC interaction compatibility facade. The actual behavior is split by
// responsibility under `domain/npc/` so callers can keep importing from here.

export { chatWithNpc } from './npc/conversation.ts';
export { useObject } from './npc/object-use.ts';
export { openGuildPanel, openNpcQuestPanel } from './npc/panels.ts';
export { handlePetMemorial, handlePetRescue, restoreInjuredPets } from './npc/pet-rescue.ts';
export { gift, helpWounded, rest } from './npc/services.ts';
export { isNearAction, nearestObject, objectEdgeDistance } from './npc/spatial.ts';
export { talkOrUse } from './npc/talk.ts';
export { worldNews } from './npc/world-news.ts';
