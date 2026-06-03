import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanupMagicTestState, resetMagicTestState } from '../domain/magic.test-fixtures.ts';
import { flyingArrows, getBowCharge, getPendingMagicCast, runtime, setBowCharge } from '../runtime/state.ts';
import { beginMagicCast } from '../domain/magic.ts';
import { openMagicPanel } from './magic.ts';

function setupMagicPanelDom() {
  document.body.innerHTML = `
    <div id="magicPanel"></div>
    <div id="stats"></div>
    <div id="toast"></div>
    <div id="log"></div>
  `;
}

function makeMagicPanelPointerScene(isActive: boolean) {
  const pointer = { button: 0, buttons: 1, primaryDown: true, isDown: true };
  const magicPointer = { button: 0, buttons: 1, primaryDown: true, isDown: true };
  const magicScene = {
    input: { activePointer: magicPointer, mousePointer: magicPointer, pointers: [magicPointer] }
  };
  const scene = {
    input: { activePointer: pointer, mousePointer: pointer, pointers: [pointer] },
    get: vi.fn((key: string) => key === 'MagicScene' ? magicScene : null),
    isActive: vi.fn(() => isActive),
    launch: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn()
  };
  runtime.pSceneRef = { scene, input: scene.input } as never;
  runtime.pointerInside = true;
  setBowCharge({ time: 0.8, rushed: false });
  return { pointer, magicPointer, magicScene, scene };
}

function expectMagicPanelPointersCleared({ pointer, magicPointer }: ReturnType<typeof makeMagicPanelPointerScene>) {
  expect(getBowCharge()).toBeNull();
  expect(pointer.buttons).toBe(0);
  expect(pointer.isDown).toBe(false);
  expect(magicPointer.buttons).toBe(0);
  expect(magicPointer.isDown).toBe(false);
  expect(runtime.pointerInside).toBe(false);
}

describe('magic panel pointer cleanup', () => {
  beforeEach(() => {
    setupMagicPanelDom();
    resetMagicTestState();
  });

  afterEach(() => {
    cleanupMagicTestState();
    document.body.innerHTML = '';
  });

  it('clears old canvas bow charge and pointer buttons when opening the magic panel without firing', () => {
    const pointerScene = makeMagicPanelPointerScene(false);

    openMagicPanel('book');

    expectMagicPanelPointersCleared(pointerScene);
    expect(flyingArrows.length).toBe(0);
    expect(pointerScene.scene.launch).toHaveBeenCalledWith('MagicScene');
    expect(pointerScene.scene.pause).toHaveBeenCalled();
  });

  it('clears canvas pointer state when refreshing an already active magic panel', () => {
    const pointerScene = makeMagicPanelPointerScene(true);

    openMagicPanel('book');

    expectMagicPanelPointersCleared(pointerScene);
    expect(pointerScene.scene.launch).not.toHaveBeenCalled();
    expect(pointerScene.scene.pause).not.toHaveBeenCalled();
  });

  it('clears game and magic scene pointer state when casting closes the magic panel', () => {
    const pointerScene = makeMagicPanelPointerScene(true);

    beginMagicCast('fireball');

    expect(getPendingMagicCast()).toEqual(expect.objectContaining({ spellId: 'fireball' }));
    expectMagicPanelPointersCleared(pointerScene);
    expect(pointerScene.scene.stop).toHaveBeenCalledWith('MagicScene');
    expect(pointerScene.scene.resume).toHaveBeenCalled();
  });
});
