import '../test-support/phaser.test-fixtures.ts';
import DATA from '../data.ts';
import { flyingArrows, initialState, magicEffects, runtime, setAttackEffect, setBowCharge, setPendingMagicCast, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';


export const dynamicMagicCatalog = DATA.magicCatalog as Record<string, {
  name: string;
  aliases: string[];
  cost: number;
  kind: string;
  heal?: number;
  radius: number;
  color?: string;
  chant?: number;
  effectDuration?: number;
  desc?: string;
}>;

export function resetMagicTestState() {
  replaceObject(state, clonePlain(initialState));
  runtime.pendingMagicCast = null;
  runtime.pSceneRef = null;
  setBowCharge(null);
  setAttackEffect(null);
  magicEffects.length = 0;
  flyingArrows.length = 0;
  state.player.magicKnown = ['fireball'];
  state.player.mp = 5;
  state.player.maxMp = 30;
}

export function cleanupMagicTestState() {
  setPendingMagicCast(null);
  setBowCharge(null);
  setAttackEffect(null);
  magicEffects.length = 0;
  flyingArrows.length = 0;
  delete dynamicMagicCatalog.instantTest;
}
