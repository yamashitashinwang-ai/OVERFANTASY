import { state } from '../../runtime/state.ts';
import { rand, dist } from '../math.ts';
import { moveActor } from '../../runtime/actor-movement.ts';
import { log } from '../../runtime/services.ts';
import { damagePlayer, damagePet } from '../combat/damage.ts';
import { addMagicClue } from '../magic.ts';
import { equippedModList } from '../combat/weapon.ts';
import { log as dlog, NS } from '../../runtime/log.ts';
import DATA from '../../data.ts';
import type { PetState } from '../types.ts';
import { strongestPetAggro } from './aggro.ts';

const { regions } = DATA;

function playerRepelsMonsters() {
  return equippedModList().some(mod => mod.repelMonsters);
}

export function updateEntities(dt: number) {
  const p = state.player;
  for (const e of state.entities) {
    if (!e.alive) continue;
    e.cooldown = Math.max(0, e.cooldown - dt);
    e.slowTimer = Math.max(0, (e.slowTimer || 0) - dt);
    e.playerAggro = Math.max(0, (e.playerAggro || 0) - dt * 0.18);
    for (const petId of Object.keys(e.petAggro || {})) {
      e.petAggro[petId] = Math.max(0, e.petAggro[petId] - dt * 0.22);
      if (e.petAggro[petId] <= 0.01) delete e.petAggro[petId];
    }
    const playerD = dist(e, p);
    const petThreat = strongestPetAggro(e);
    const canTargetPlayer = (e.faction === "monster" && !p.monsterForm) || (p.monsterForm && e.faction !== "monster" && e.kind !== "animal");
    if (canTargetPlayer && playerD < 11.5) e.playerAggro = Math.max(e.playerAggro || 0, 3);
    const target = petThreat.pet && petThreat.value > (e.playerAggro || 0) ? petThreat.pet : p;
    const d = dist(e, target);
    const shouldAttack = (canTargetPlayer && playerD < 11.5) || !!petThreat.pet;
    if (shouldAttack) {
      const dx = (target.x - e.x) / Math.max(0.001, d);
      const dy = (target.y - e.y) / Math.max(0.001, d);
      if (target === p && playerRepelsMonsters() && e.faction === "monster" && e.species !== "demonKing" && d < 6.5) {
        moveActor(e, -dx, -dy, (e.speed || 1.5) + 1.4, dt);
        continue;
      }
      e.specialClock = Math.max(0, (e.specialClock || 0) - dt);
      const hateBoost = Math.min(1.6, (regions[e.region]?.hate || 20) / 65);
      let speed = (e.speed || 1.5) + hateBoost;
      if (e.pounce && e.specialClock <= 0 && d < 4.8) {
        speed += 3.2;
        e.specialClock = rand(2.4, 4.1);
      }
      if (e.slowTimer > 0) speed *= Math.max(0.3, 1 - (e.slowPower || 0.35));
      moveActor(e, dx, dy, speed, dt);
      if (e.ranged && d < 4.6 && e.cooldown <= 0) {
        dlog(NS.COMBAT_ENEMY_ATTACK, 'ranged %s -> %s d=%s atk=%d',
          e.name, target === p ? 'player' : target?.name || 'pet', d.toFixed(2), Math.ceil((e.atk || 3) * 0.72));
        if (target === p) damagePlayer(Math.ceil((e.atk || 3) * 0.72), e);
        else damagePet(target as PetState, Math.ceil((e.atk || 3) * 0.72), e);
        e.cooldown = rand(1.6, 2.3);
        if (e.species === "wisp") {
          log(`${e.name}从远处释放了像火球术一样的魔弹。`);
          addMagicClue("fireball", "你亲眼见到魔弹凝成火球，终于理解了火球术的一部分。");
        } else {
          log(`${e.name}从远处释放了魔弹。`);
        }
      }
      if (d < 0.9 && e.cooldown <= 0) {
        dlog(NS.COMBAT_ENEMY_ATTACK, 'melee %s -> %s d=%s atk=%d cdAfter=%s',
          e.name, target === p ? 'player' : target?.name || 'pet', d.toFixed(2), e.atk || 2, e.guard ? '0.95' : '1.08');
        if (target === p) damagePlayer(e.atk || 2, e);
        else damagePet(target as PetState, e.atk || 2, e);
        e.cooldown = e.guard ? 0.95 : 1.08;
      }
    } else if (e.flee && d < 3.5) {
      const dx = (e.x - p.x) / Math.max(0.001, d);
      const dy = (e.y - p.y) / Math.max(0.001, d);
      moveActor(e, dx, dy, 1.8, dt);
    } else if (e.kind === "npc" && e.affection >= 60 && !e.wounded && !p.monsterForm) {
      if (d > 3.5 && Math.random() < dt * 0.18) {
        const dx = (p.x - e.x) / Math.max(0.001, d);
        const dy = (p.y - e.y) / Math.max(0.001, d);
        moveActor(e, dx, dy, 1.3, dt);
        e.wantsTalk = true;
      }
    } else if (Math.random() < dt * 0.18) {
      moveActor(e, rand(-1, 1), rand(-1, 1), 0.45, dt);
    }
  }

  const savior = state.entities.find(e => e.alive && e.kind === "npc" && e.devotion >= 60 && dist(e, p) < 2.0);
  if (savior && p.hp <= 8 && Math.random() < dt * 0.8) {
    p.hp = 18;
    savior.alive = false;
    log(`${savior.name}冲到你身前挡下致命一击。献身值系统触发。`);
  }
}
