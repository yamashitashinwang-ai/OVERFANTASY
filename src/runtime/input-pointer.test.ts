import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeScene } from './input.test-fixtures.ts';
import { clearGamePointerState, releaseWorldPointerInput, restoreGameInputFocus } from './input.ts';
import { getAttackEffect, getBowCharge, runtime, setAttackEffect, setBowCharge } from './state.ts';

describe('input pointer cleanup and focus restoration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    runtime.pointerInside = false;
    runtime.pSceneRef = null;
    setBowCharge(null);
    setAttackEffect(null);
  });

  it('clears pointer buttons without clearing the last pointer position', () => {
    const pointer = {
      button: 0,
      buttons: 1,
      primaryDown: true,
      isDown: true,
      downElement: document.body,
      upElement: document.body,
      event: new MouseEvent('pointerdown'),
      wasCanceled: false,
      worldX: 120,
      worldY: 80
    };

    clearGamePointerState({ input: { activePointer: pointer, mousePointer: pointer, pointers: [pointer] } });

    expect(pointer.buttons).toBe(0);
    expect(pointer.button).toBe(-1);
    expect(pointer.primaryDown).toBe(false);
    expect(pointer.isDown).toBe(false);
    expect(pointer.downElement).toBeNull();
    expect(pointer.upElement).toBeNull();
    expect(pointer.event).toBeNull();
    expect(pointer.wasCanceled).toBe(true);
    expect(pointer.worldX).toBe(120);
    expect(pointer.worldY).toBe(80);
  });

  it('clears pointers owned by the Phaser input manager during scene switches', () => {
    const scenePointer = { button: 0, buttons: 1, primaryDown: true, isDown: true };
    const managerPointer = { button: 0, buttons: 1, primaryDown: true, isDown: true };
    const gamePointer = { button: 0, buttons: 1, primaryDown: true, isDown: true };

    clearGamePointerState({
      input: {
        activePointer: scenePointer,
        manager: { activePointer: managerPointer, pointers: [managerPointer] }
      },
      game: {
        input: { activePointer: gamePointer, mousePointer: gamePointer, pointers: [gamePointer] }
      }
    });

    expect(scenePointer.buttons).toBe(0);
    expect(scenePointer.button).toBe(-1);
    expect(managerPointer.buttons).toBe(0);
    expect(managerPointer.button).toBe(-1);
    expect(gamePointer.buttons).toBe(0);
    expect(gamePointer.button).toBe(-1);
  });

  it('releases world pointer input across game and panel scenes without clearing aim', () => {
    const gamePointer = {
      button: 0,
      buttons: 1,
      primaryDown: true,
      isDown: true,
      worldX: 120,
      worldY: 80
    };
    const panelPointer = {
      button: 0,
      buttons: 1,
      primaryDown: true,
      isDown: true
    };
    runtime.pSceneRef = { input: { activePointer: gamePointer, mousePointer: gamePointer, pointers: [gamePointer] } } as never;
    runtime.pointerInside = true;
    runtime.aimWorld = { x: 9, y: 7 };
    setBowCharge({ time: 0.2, rushed: false });
    setAttackEffect({ shape: 'sector', effect: 'slash', angle: 0, duration: 0.2 });

    releaseWorldPointerInput({ input: { activePointer: panelPointer, mousePointer: panelPointer, pointers: [panelPointer] } });

    expect(runtime.pointerInside).toBe(false);
    expect(getBowCharge()).toBeNull();
    expect(getAttackEffect()).toBeNull();
    expect(gamePointer.buttons).toBe(0);
    expect(gamePointer.isDown).toBe(false);
    expect(panelPointer.buttons).toBe(0);
    expect(panelPointer.isDown).toBe(false);
    expect(runtime.aimWorld).toEqual({ x: 9, y: 7 });
  });

  it('restores focus to the game canvas after closing UI', () => {
    const { scene, canvas } = fakeScene();

    restoreGameInputFocus(scene as never);

    expect(canvas.tabIndex).toBe(0);
    expect(document.activeElement).toBe(canvas);
  });
});
