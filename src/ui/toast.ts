// Toast UI subscriber. Listens for TOAST_SHOWN bus events and updates the
// HTML `#toast` element. Auto-clears after 4.2s using a Phaser delayedCall.

import { bus, Events } from '../runtime/events.ts';
import { get } from './dom.ts';
import { scheduleOnce } from '../runtime/timers.ts';
import { runtime } from '../runtime/state.ts';
import type Phaser from 'phaser';

let attached = false;
let clearTimer: Phaser.Time.TimerEvent | null = null;

export function attachToastPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.TOAST_SHOWN, ({ text, durationMs = 4200 }: { text: string; durationMs?: number }) => {
    if (!get.toastEl) return;
    get.toastEl.textContent = text;
    if (clearTimer) clearTimer.remove();
    if (runtime.pSceneRef) {
      clearTimer = scheduleOnce(runtime.pSceneRef as Phaser.Scene, durationMs, () => {
        if (get.toastEl) get.toastEl.textContent = '';
        clearTimer = null;
      });
    }
  });
}
