import { addEnvironmentObject } from '../world.ts';

export function addTree(name: string, x: number, y: number) {
  return addEnvironmentObject("tree", name, x, y, 2, 3, "#3f7a4a", "treeTrunk");
}

export function addBush(name: string, x: number, y: number) {
  return addEnvironmentObject("bush", name, x, y, 1.4, 1.1, "#3f9d55");
}

export function addLeaves(name: string, x: number, y: number) {
  return addEnvironmentObject("leafPile", name, x, y, 1.3, 0.8, "#b87a36");
}

export function addWindFlag(name: string, x: number, y: number) {
  return addEnvironmentObject("windFlag", name, x, y, 1, 2, "#8d77a6");
}
