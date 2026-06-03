import DATA from '../../data.ts';
import { state } from '../../runtime/state.ts';
import { rand } from '../math.ts';
import { npcMemoryFor } from '../npc-memory.ts';
import { makeRuntimeId, worldOwnerId } from '../session.ts';
import type { ActorState } from '../types.ts';

const { bestiary } = DATA;

interface CreatureOverrides extends Partial<ActorState> {
  slimeGen?: number;
}

export function addEntity(entity: ActorState): ActorState {
  if (!entity.id) entity.id = makeRuntimeId(entity.species || entity.kind || "entity");
  if (!entity.ownerId) entity.ownerId = worldOwnerId;
  if ((entity.kind === "npc" || entity.kind === "friendly") && !entity.relationId) entity.relationId = entity.name;
  const memory = (entity.kind === "npc" || entity.kind === "friendly") ? npcMemoryFor(entity) : null;
  if (memory) {
    entity.affection = Math.max(entity.affection || 0, memory.affection || 0);
    entity.devotion = Math.max(entity.devotion || 0, memory.devotion || 0);
  }
  entity.cooldown = rand(0, 1);
  entity.specialClock = rand(1.2, 3.6);
  entity.alive = true;
  state.entities.push(entity);
  return entity;
}

export function makeCreature(species: string, x: number, y: number, overrides: CreatureOverrides = {}): ActorState {
  const template = bestiary[species];
  const slimeGen = species === "slime" ? (overrides.slimeGen || 1) : undefined;
  const genScale = species === "slime" ? [1, 0.55, 0.28][slimeGen - 1] || 1 : 1;
  const entity = {
    ...template,
    species,
    x,
    y,
    maxHp: Math.max(3, Math.ceil((overrides.maxHp || template.hp) * genScale)),
    region: overrides.region || state.scene,
    ...overrides
  };
  if (species === "slime") {
    entity.slimeGen = slimeGen;
    entity.name = slimeGen === 1 ? template.name : (slimeGen === 2 ? "小灰史莱姆" : "微型灰史莱姆");
    entity.atk = Math.max(1, Math.ceil(template.atk * genScale));
    entity.r = Math.max(6, Math.ceil(template.r * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.8 : 0.62)));
    entity.speed = Math.max(0.8, template.speed * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.88 : 0.72));
    entity.split = slimeGen < 3;
  }
  entity.maxHp = overrides.maxHp || entity.maxHp;
  entity.hp = overrides.hp || entity.maxHp;
  return entity;
}

export function spawnCreature(species: string, x: number, y: number, overrides: CreatureOverrides = {}) {
  return addEntity(makeCreature(species, x, y, overrides));
}
