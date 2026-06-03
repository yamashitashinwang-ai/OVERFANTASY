import { state } from '../../runtime/state.ts';
import { rand, dist } from '../math.ts';
import { ownedByCurrentPlayer } from '../session.ts';
import { moveActor } from '../../runtime/actor-movement.ts';
import { log } from '../../runtime/services.ts';
import { defeatEntity, petDiesIrreversibly } from '../combat/damage.ts';
import { currentPetScene } from '../world.ts';

export function updatePets(dt: number) {
  for (const pet of state.pets) {
    if (!ownedByCurrentPlayer(pet)) continue;
    if (pet.lost) continue;
    if (pet.injured) {
      pet.rescueTimer = Math.max(0, pet.rescueTimer - dt);
      if (pet.carried) {
        pet.scene = currentPetScene();
        pet.x = state.player.x - 0.55;
        pet.y = state.player.y + 0.55;
      }
      if (pet.rescueTimer <= 0) {
        petDiesIrreversibly(pet);
      }
      continue;
    }
    if (!pet.alive) continue;
    pet.cooldownTimer = Math.max(0, pet.cooldownTimer - dt);
    pet.wanderTimer -= dt;
    if (pet.wanderTimer <= 0) {
      pet.wanderTimer = rand(0.8, 1.8);
      pet.wanderX = rand(-1, 1);
      pet.wanderY = rand(-1, 1);
    }

    const engaged = state.entities
      .filter(e => e.alive && e.faction === "monster" && (e.playerAggro || 0) > 0 && dist(e, state.player) <= pet.guardRange)
      .sort((a, b) => dist(a, pet) - dist(b, pet))[0];

    if (engaged) {
      const d = dist(pet, engaged);
      if (d > pet.attackRange) {
        moveActor(pet, (engaged.x - pet.x) / Math.max(0.001, d), (engaged.y - pet.y) / Math.max(0.001, d), pet.speed, dt);
      } else if (pet.cooldownTimer <= 0) {
        engaged.hp -= pet.atk;
        if (!engaged.petAggro) engaged.petAggro = {};
        engaged.petAggro[pet.id] = (engaged.petAggro[pet.id] || 0) + pet.atk + 3;
        pet.cooldownTimer = pet.cooldown;
        log(`${pet.name}护主攻击${engaged.name}，造成${pet.atk}点伤害。`);
        if (engaged.hp <= 0) defeatEntity(engaged, "pet");
      }
      continue;
    }

    const homeD = dist(pet, state.player);
    if (homeD > pet.roamRadius) {
      moveActor(pet, (state.player.x - pet.x) / Math.max(0.001, homeD), (state.player.y - pet.y) / Math.max(0.001, homeD), pet.speed * 1.15, dt);
    } else {
      const len = Math.hypot(pet.wanderX, pet.wanderY) || 1;
      moveActor(pet, pet.wanderX / len, pet.wanderY / len, pet.speed * 0.32, dt);
    }
  }
}
