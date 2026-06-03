import DATA from '../../../data.ts';
import { state } from '../../../runtime/state.ts';
import { log as dlog, NS } from '../../../runtime/log.ts';
import { log } from '../../../runtime/services.ts';
import { clamp } from '../../math.ts';
import { regionAt, spawnCreature } from '../../world.ts';
import { recordQuestDefeat } from '../../quest.ts';
import { dropEmbeddedArrows } from '../arrows.ts';
import { dropLoot } from './loot.ts';
import type { ActorState } from '../../types.ts';

const { regions } = DATA;

export function defeatEntity(e: ActorState, attacker = 'player') {
  dlog(NS.COMBAT_DEFEAT, 'defeated entity name=%s kind=%s species=%s by=%s',
    e?.name, e?.kind, e?.species, attacker);
  e.alive = false;
  dropEmbeddedArrows(e);
  if (e.kind === 'monster') {
    recordQuestDefeat(e);
    state.player.gold += 2 + Math.floor(Math.random() * 5);
    dropLoot(e);
    if (e.species === 'slime' && e.split && (e.slimeGen || 1) < 3) {
      const childGen = (e.slimeGen || 1) + 1;
      spawnCreature('slime', e.x + 0.7, e.y + 0.4, { slimeGen: childGen, region: e.region });
      spawnCreature('slime', e.x - 0.7, e.y - 0.4, { slimeGen: childGen, region: e.region });
      log(`${e.name}分裂成第${childGen}代小史莱姆。第三代不会继续分裂。`);
    }
    log(`击败了${e.name}。`);
    return;
  }
  if (e.kind === 'animal') {
    recordQuestDefeat(e);
    dropLoot(e);
    const r = regions[e.region] || regionAt(e.x, e.y);
    r.trust = clamp(r.trust - 3, 0, 100);
    r.hate = clamp(r.hate + 4, 0, 100);
    log(`猎获${e.name}，${r.name}的信任略降。`);
    return;
  }
  if (e.kind === 'friendly' || e.kind === 'npc') {
    dropLoot(e);
    const r = regions[e.region] || regionAt(e.x, e.y);
    r.trust = clamp(r.trust - 22, 0, 100);
    r.hate = clamp(r.hate + 26, 0, 100);
    log(`${e.name}倒下了。${r.name}信任下降，仇恨上升。`);
    return;
  }
  if (attacker === 'monster') log(`${e.name}被卷入冲突。`);
}
