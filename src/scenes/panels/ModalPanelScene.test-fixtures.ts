import './ModalPanelScene.phaser.test-fixtures.ts';
import { expect, vi } from 'vitest';

import { getAttackEffect, getBowCharge, runtime, setAttackEffect, setBowCharge } from '../../runtime/state.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

type Listener = (...args: unknown[]) => void;
export type TestPointer = {
  button: number;
  buttons: number;
  primaryDown: boolean;
  isDown: boolean;
  downElement: HTMLElement | null;
  upElement: HTMLElement | null;
  event: Event | null;
  wasCanceled: boolean;
};

export class TestPanelScene extends ModalPanelScene {
  clicks = 0;

  constructor() {
    super('TestPanelScene', 'testPanel', 'magicOpen');
  }

  get cacheKey() {
    return 'testPanel';
  }

  onClick() {
    this.clicks += 1;
  }
}

export type MountedPanelScene = {
  scene: TestPanelScene;
  gamePointer: TestPointer;
  panelPointer: TestPointer;
};

export function setupModalPanelTestState() {
  document.body.innerHTML = '<div id="testPanel" class="hidden"><button type="button" id="panelButton">施放</button></div>';
  runtime.pointerInside = true;
  runtime.pSceneRef = null;
  setBowCharge(null);
  setAttackEffect(null);
  uiState.magicOpen = false;
}

export function cleanupModalPanelTestState(createdScenes: TestPanelScene[]) {
  for (const scene of createdScenes) scene.cleanup();
  runtime.pointerInside = false;
  runtime.pSceneRef = null;
  setBowCharge(null);
  setAttackEffect(null);
  uiState.magicOpen = false;
  document.body.innerHTML = '';
}

export function armPointer(pointer: TestPointer) {
  pointer.button = 0;
  pointer.buttons = 1;
  pointer.primaryDown = true;
  pointer.isDown = true;
  pointer.wasCanceled = false;
}

export function pointerState(): TestPointer {
  const pointer = {
    button: -1,
    buttons: 0,
    primaryDown: false,
    isDown: false,
    downElement: document.body,
    upElement: document.body,
    event: new Event('pointerdown'),
    wasCanceled: false
  };
  armPointer(pointer);
  return pointer;
}

export function inputWith(pointer: TestPointer) {
  const listeners = new Map<string, Set<Listener>>();
  return {
    activePointer: pointer,
    mousePointer: pointer,
    pointers: [pointer],
    keyboard: { on: vi.fn() },
    on: vi.fn((event: string, listener: Listener) => {
      const set = listeners.get(event) || new Set<Listener>();
      set.add(listener);
      listeners.set(event, set);
    }),
    off: vi.fn((event: string, listener: Listener) => {
      listeners.get(event)?.delete(listener);
    })
  };
}

export function installSceneIO(scene: TestPanelScene, input: ReturnType<typeof inputWith>) {
  Object.assign(scene, {
    input,
    events: { once: vi.fn() },
    game: { canvas: document.createElement('canvas') }
  });
}

export function mountPanelScene(createdScenes: TestPanelScene[]): MountedPanelScene {
  const gamePointer = pointerState();
  const panelPointer = pointerState();
  runtime.pSceneRef = { input: inputWith(gamePointer) } as never;

  const scene = new TestPanelScene();
  installSceneIO(scene, inputWith(panelPointer));
  createdScenes.push(scene);

  return { scene, gamePointer, panelPointer };
}

export function seedStalePointerAction(time = 0.7) {
  runtime.pointerInside = true;
  setBowCharge({ time, rushed: false });
  setAttackEffect({ shape: 'sector', effect: 'slash', angle: 0, duration: 0.2 });
}

export function expectPointerActionsCleared({ gamePointer, panelPointer }: Pick<MountedPanelScene, 'gamePointer' | 'panelPointer'>) {
  expect(gamePointer.buttons).toBe(0);
  expect(gamePointer.isDown).toBe(false);
  expect(panelPointer.buttons).toBe(0);
  expect(panelPointer.isDown).toBe(false);
  expect(getBowCharge()).toBeNull();
  expect(getAttackEffect()).toBeNull();
  expect(runtime.pointerInside).toBe(false);
}
