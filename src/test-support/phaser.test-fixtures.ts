import { vi } from 'vitest';

export const phaserKeyCodes = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SHIFT: 16,
  SPACE: 32
};

export class TestCircle {
  constructor(readonly x: number, readonly y: number, readonly radius: number) {}
}

export class TestScene {
  scene: { key: string; resume: () => void; stop: () => void };
  input: unknown;
  events: unknown;
  game: unknown;

  constructor(config: { key: string }) {
    this.scene = { key: config.key, resume: () => {}, stop: () => {} };
  }
}

vi.mock('phaser', () => ({
  default: {
    BlendModes: { ADD: 'ADD' },
    Scene: TestScene,
    Scenes: { Events: { SHUTDOWN: 'shutdown' } },
    Input: {
      Keyboard: {
        KeyCodes: phaserKeyCodes,
        JustDown: (key: { _justDown?: boolean }) => {
          if (!key._justDown) return false;
          key._justDown = false;
          return true;
        }
      }
    },
    Geom: {
      Circle: TestCircle
    }
  }
}));
