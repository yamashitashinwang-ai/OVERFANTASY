import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  setOpenForgePanelHandler,
  setOpenMagicPanelHandler,
  setOpenShopPanelHandler
} from '../runtime/panel-actions.ts';
import { initialState, state } from '../runtime/state.ts';
import { clonePlain, replaceObject } from './math.ts';
import { useObject } from './npc/object-use.ts';
import type { WorldObjectState } from './types.ts';

function worldObject(action: string, name = 'object'): WorldObjectState {
  return { id: `object:${action}`, action, name, x: 0, y: 0 } as WorldObjectState;
}

function resetPanelHandlers() {
  setOpenForgePanelHandler(() => {});
  setOpenShopPanelHandler(() => {});
  setOpenMagicPanelHandler(() => {});
}

describe('NPC object-use panel actions', () => {
  beforeEach(() => {
    replaceObject(state, clonePlain(initialState));
    resetPanelHandlers();
  });

  afterEach(resetPanelHandlers);

  it('requests shop and forge panels through runtime panel actions', () => {
    const calls: string[] = [];
    setOpenShopPanelHandler(() => { calls.push('shop'); });
    setOpenForgePanelHandler(() => { calls.push('forge'); });

    useObject(worldObject('shop', '商店'));
    useObject(worldObject('forge', '锻造台'));

    expect(calls).toEqual(['shop', 'forge']);
  });

  it('passes magic cottage study mode and title through runtime panel actions', () => {
    const calls: Array<{ mode?: string; title?: string | null }> = [];
    setOpenMagicPanelHandler((mode, title) => { calls.push({ mode, title }); });

    useObject(worldObject('magicCottage', '魔法爱好者小屋'));

    expect(calls).toEqual([{ mode: 'study', title: '魔法爱好者小屋' }]);
  });

  it('does not request shop UI while monster form is rejected by domain rules', () => {
    let opened = false;
    state.player.monsterForm = true;
    setOpenShopPanelHandler(() => { opened = true; });

    useObject(worldObject('shop', '商店'));

    expect(opened).toBe(false);
  });
});
