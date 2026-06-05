import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  armPointer,
  cleanupModalPanelTestState,
  expectPointerActionsCleared,
  mountPanelScene,
  seedStalePointerAction,
  setupModalPanelTestState,
  type TestPanelScene
} from './ModalPanelScene.test-fixtures.ts';

describe('ModalPanelScene input isolation', () => {
  let createdScenes: TestPanelScene[] = [];

  beforeEach(() => {
    createdScenes = [];
    setupModalPanelTestState();
  });

  afterEach(() => {
    cleanupModalPanelTestState(createdScenes);
  });

  it('clears stale game canvas pointer actions when the modal panel receives a real click', () => {
    const mounted = mountPanelScene(createdScenes);
    seedStalePointerAction();
    const bodyClick = vi.fn();
    document.body.addEventListener('click', bodyClick);

    mounted.scene.create();
    const button = document.getElementById('panelButton') as HTMLButtonElement;
    button.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(mounted.scene.clicks).toBe(1);
    expect(bodyClick).not.toHaveBeenCalled();
    expectPointerActionsCleared(mounted);

    document.body.removeEventListener('click', bodyClick);
  });

  it('clears stale game canvas pointer actions when input handoff reaches the modal panel', () => {
    const mounted = mountPanelScene(createdScenes);
    seedStalePointerAction();

    mounted.scene.create();
    const panel = document.getElementById('testPanel') as HTMLElement;
    panel.dispatchEvent(new Event('pointerenter', { cancelable: true }));

    expectPointerActionsCleared(mounted);

    armPointer(mounted.gamePointer);
    armPointer(mounted.panelPointer);
    seedStalePointerAction(0.4);

    const button = document.getElementById('panelButton') as HTMLButtonElement;
    button.dispatchEvent(new Event('focusin', { bubbles: true, cancelable: true }));

    expectPointerActionsCleared(mounted);
  });

  it('clears stale game canvas pointer actions from document-level UI handoff', () => {
    const mounted = mountPanelScene(createdScenes);

    mounted.scene.create();
    armPointer(mounted.gamePointer);
    armPointer(mounted.panelPointer);
    seedStalePointerAction(0.5);

    document.body.dispatchEvent(new Event('pointermove', { bubbles: true, cancelable: true }));

    expectPointerActionsCleared(mounted);
  });

  it('swallows pointer events outside the modal panel while a modal is open', () => {
    const mounted = mountPanelScene(createdScenes);
    const canvas = document.createElement('canvas');
    const outsidePointerDown = vi.fn();
    canvas.addEventListener('pointerdown', outsidePointerDown);
    document.body.appendChild(canvas);

    mounted.scene.create();
    armPointer(mounted.gamePointer);
    armPointer(mounted.panelPointer);

    const event = new Event('pointerdown', { bubbles: true, cancelable: true });
    canvas.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(outsidePointerDown).not.toHaveBeenCalled();
    expectPointerActionsCleared(mounted);
  });
});
