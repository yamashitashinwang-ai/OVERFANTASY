import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeScene } from './input.test-fixtures.ts';
import { state, runtime } from './state.ts';
import { uiState } from './ui-state.ts';
import { bindActions, blockWorldAction, modalKey, routeEscape, worldPointerBlocked } from './input.ts';

describe('input action routing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('binds and unbinds one-shot action handlers', () => {
    const { scene, listeners } = fakeScene();
    const handler = vi.fn();

    const unbind = bindActions(scene as never, { E: handler });
    listeners.get('keydown-E')?.(new KeyboardEvent('keydown', { key: 'e' }));

    expect(handler).toHaveBeenCalledTimes(1);
    unbind();
    expect(listeners.has('keydown-E')).toBe(false);
  });

  it('routes escape to the open modal before falling back to pause', () => {
    const closeBackpack = vi.fn();
    const openPause = vi.fn();

    routeEscape(() => 'backpack', { backpack: closeBackpack }, openPause);
    routeEscape(() => null, { backpack: closeBackpack }, openPause);

    expect(closeBackpack).toHaveBeenCalledTimes(1);
    expect(openPause).toHaveBeenCalledTimes(1);
  });
});


describe('world action modal gates', () => {
  beforeEach(() => {
    runtime.pSceneRef = null;
    uiState.appMode = 'playing';
    uiState.backpackOpen = false;
    uiState.questOpen = false;
    uiState.shopOpen = false;
    uiState.forgeOpen = false;
    uiState.magicOpen = false;
    uiState.characterOpen = false;
    uiState.careerOpen = false;
    state.player.corruptionChoicePending = false;
    state.player.corruptionRampageWarningTimer = 0;
    state.player.corruptionRampageTimer = 0;
  });

  it('allows world actions while playing with no modal open', () => {
    const event = new Event('click', { cancelable: true });

    expect(blockWorldAction(event)).toBe(false);
    expect(worldPointerBlocked()).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('blocks world actions and pointer input while a modal is open', () => {
    const event = new Event('click', { cancelable: true });
    uiState.backpackOpen = true;

    expect(blockWorldAction(event)).toBe(true);
    expect(worldPointerBlocked()).toBe(true);
    expect(modalKey()).toBe('backpack');
    expect(event.defaultPrevented).toBe(true);
  });

  it('blocks world actions and pointer input while the character panel is open', () => {
    const event = new Event('click', { cancelable: true });
    uiState.characterOpen = true;

    expect(blockWorldAction(event)).toBe(true);
    expect(worldPointerBlocked()).toBe(true);
    expect(modalKey()).toBe('character');
    expect(event.defaultPrevented).toBe(true);
  });

  it('blocks world actions and pointer input while the career panel is open', () => {
    const event = new Event('click', { cancelable: true });
    uiState.careerOpen = true;

    expect(blockWorldAction(event)).toBe(true);
    expect(worldPointerBlocked()).toBe(true);
    expect(modalKey()).toBe('career');
    expect(event.defaultPrevented).toBe(true);
  });
});
