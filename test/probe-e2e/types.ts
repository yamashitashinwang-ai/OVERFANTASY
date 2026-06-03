import type { Browser, Page } from 'playwright';

export type E2eProbeState = {
  player: {
    race?: string;
    hp: number;
    x: number;
    stamina: number;
    dodgeCooldown: number;
    dodgeTimer: number;
    attackCooldown: number;
    herbs: number;
    gold: number;
    [key: string]: unknown;
  };
  scene: string;
  mode: string;
  npcMemory: string[];
  entities: number;
  pickups: number;
  pets: number;
};

export type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type E2eProbe = {
  page: Page;
  browser: Browser;
  errors: string[];
  failures: string[];
  log(...args: unknown[]): void;
  ok(message: string): void;
  fail(message: string): void;
  step(label: string, fn: () => Promise<void>): Promise<void>;
  state(): Promise<E2eProbeState>;
  bootstrap(): Promise<void>;
  getCanvasBox(): Promise<CanvasBox>;
  focusCanvas(): Promise<CanvasBox>;
  finish(): Promise<number>;
};
