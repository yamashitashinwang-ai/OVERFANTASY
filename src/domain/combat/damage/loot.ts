import DATA from '../../../data.ts';
import { log } from '../../../runtime/services.ts';
import { rand } from '../../math.ts';
import { addPickup } from '../../world.ts';
import type { ActorState, DropSpec } from '../../types.ts';

const { bestiary } = DATA;

export function rollDrop(drop: DropSpec | undefined, x: number, y: number): boolean {
  if (!drop || Math.random() > drop.chance) return false;
  addPickup(drop.kind, drop.name, x + rand(-0.35, 0.35), y + rand(-0.35, 0.35), drop.color, drop.value || 1);
  return true;
}

export function dropLoot(e: ActorState) {
  const template = bestiary[e.species];
  if (!template) return;
  const common = rollDrop(template.commonDrop, e.x, e.y);
  const rare = rollDrop(template.rareDrop, e.x, e.y);
  const extraDrops = (template.extraDrops || []).filter(drop => rollDrop(drop, e.x, e.y));
  if (rare) log(`${e.name}掉落了稀有物：${template.rareDrop.name}。`);
  if (extraDrops.length) log(`${e.name}掉落了超稀有物：${extraDrops.map(drop => drop.name).join('、')}。`);
  else if (common) log(`${e.name}留下了${template.commonDrop.name}。`);
}
