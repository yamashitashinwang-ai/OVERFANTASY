import '../test-support/phaser.test-fixtures.ts';
import { vi } from 'vitest';

export type TestKey = { isDown: boolean; _justDown?: boolean };

export function keyboardEvent(type: 'keydown' | 'keyup', code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
}

export function fakeScene() {
  const addedKeys: TestKey[] = [];
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const listeners = new Map<string, (event: KeyboardEvent) => void>();
  const keyboard = {
    addKey: vi.fn(() => {
      const key = { isDown: false, _justDown: false };
      addedKeys.push(key);
      return key;
    }),
    on: vi.fn((event: string, listener: (event: KeyboardEvent) => void) => {
      listeners.set(event, listener);
    }),
    off: vi.fn((event: string, listener: (event: KeyboardEvent) => void) => {
      if (listeners.get(event) === listener) listeners.delete(event);
    })
  };
  return {
    addedKeys,
    canvas,
    listeners,
    scene: {
      input: { keyboard },
      game: { canvas }
    }
  };
}
