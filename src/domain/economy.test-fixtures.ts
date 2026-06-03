import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import type { WorldObjectState } from './types.ts';

export function resetEconomyTestState() {
  replaceObject(state, clonePlain(initialState));
  state.objects = [];
  state.player.gold = 0;
  state.player.potions = 0;
  state.player.arrows = 0;
  state.player.materials = {};
  state.player.resources = {};
  state.player.wood = 0;
  state.player.stone = 0;
  state.player.gearMods = {};
  state.player.gearBag = ['trainingSword', 'clothTunic', 'linenPants'];
  state.player.gear.weapon = 'trainingSword';
}

export function putEconomyActionObject(action: string) {
  state.objects.push({
    id: `${action}-test`,
    kind: action,
    name: action,
    x: state.player.x,
    y: state.player.y,
    w: 1,
    h: 1,
    color: '#ffffff',
    action
  } as WorldObjectState);
}
