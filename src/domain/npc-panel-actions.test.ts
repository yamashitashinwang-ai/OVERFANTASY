import { afterEach, describe, expect, it } from 'vitest';
import {
  setOpenGuildQuestPanelHandler,
  setOpenNpcQuestPanelHandler
} from '../runtime/panel-actions.ts';
import { openGuildPanel, openNpcQuestPanel } from './npc/panels.ts';
import type { ActorState } from './types.ts';

function resetQuestPanelHandlers() {
  setOpenGuildQuestPanelHandler(() => {});
  setOpenNpcQuestPanelHandler(() => {});
}

describe('NPC quest panel actions', () => {
  afterEach(resetQuestPanelHandlers);

  it('requests the guild quest panel through runtime panel actions', () => {
    const calls: string[] = [];
    setOpenGuildQuestPanelHandler(() => { calls.push('guild'); });

    openGuildPanel();

    expect(calls).toEqual(['guild']);
  });

  it('passes the NPC name through runtime panel actions', () => {
    const calls: string[] = [];
    setOpenNpcQuestPanelHandler(name => { calls.push(name); });

    openNpcQuestPanel({ name: '公会职员' } as ActorState);

    expect(calls).toEqual(['公会职员']);
  });
});
