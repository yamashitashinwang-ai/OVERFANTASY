import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';

export function resetInventoryTestState() {
  replaceObject(state, clonePlain(initialState));
  state.player.materials = {};
  state.player.resources = {};
  state.pets = [];
}
