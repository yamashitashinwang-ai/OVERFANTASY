// World population compatibility facade. Concrete per-map content placement
// lives under domain/world-spawn/ so map data can be reviewed independently.

import { state } from '../runtime/state.ts';
import { syncLostPackagePickupsForScene } from './lost-packages.ts';
import { spawnField } from './world-spawn/field.ts';
import { spawnForest } from './world-spawn/forest.ts';
import { spawnSilverleaf } from './world-spawn/silverleaf.ts';
import { spawnPeakless } from './world-spawn/peakless.ts';
import { spawnStonegorge } from './world-spawn/stonegorge.ts';
import { spawnHatepit } from './world-spawn/hatepit.ts';
import { spawnRuins } from './world-spawn/ruins.ts';
import { spawnDemon } from './world-spawn/demon.ts';

export function spawnWorld(scene = state.scene) {
  state.entities = [];
  state.objects = [];
  state.solids = [];
  state.pickups = [];

  if (scene === "field") spawnField();
  if (scene === "forest") spawnForest();
  if (scene === "silverleaf") spawnSilverleaf();
  if (scene === "peakless") spawnPeakless();
  if (scene === "stonegorge") spawnStonegorge();
  if (scene === "hatepit") spawnHatepit();
  if (scene === "ruins") spawnRuins();
  if (scene === "demon") spawnDemon();
  syncLostPackagePickupsForScene(scene);
}
