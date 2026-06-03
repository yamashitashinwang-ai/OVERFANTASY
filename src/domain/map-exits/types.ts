import type { SceneKey } from "../types.ts";

export interface ExitRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExitPathRect extends ExitRect {
  tile?: string;
}

export interface MapExitConfig {
  sourceScene: SceneKey;
  portalId: string;
  zone: ExitRect;
  path: ExitPathRect[];
}
