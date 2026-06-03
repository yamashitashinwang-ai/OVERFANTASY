import { state } from '../../runtime/state.ts';
import { log } from '../../runtime/services.ts';
import { currentPetScene } from '../world.ts';
import DATA from '../../data.ts';

const { graveDecayInterval, graveMaxDecay } = DATA;

export function updatePetRemains(dt: number) {
  for (const remain of state.petRemains) {
    if (remain.kind !== "grave") continue;
    remain.age += dt;
    remain.decayClock += dt;
    if (remain.decayClock >= graveDecayInterval) {
      remain.decayClock = 0;
      remain.decay += 1;
      if (remain.decay < graveMaxDecay && remain.scene === currentPetScene()) {
        log(`${remain.petName}的坟墓又腐败了一点。`);
      }
    }
  }
  const before = state.petRemains.length;
  state.petRemains = state.petRemains.filter(remain => remain.kind !== "grave" || remain.decay < graveMaxDecay);
  if (state.petRemains.length < before) log("一座宠物的坟墓彻底消失了。");
}
