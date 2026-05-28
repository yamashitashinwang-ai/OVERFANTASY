// Toast UI subscriber. Listens for TOAST_SHOWN bus events and updates the
// HTML `#toast` element. Auto-clears after 4.2s using a Phaser delayedCall.

import { bus, Events } from '../runtime/events.js';
import { get } from './dom.js';
import { scheduleOnce } from '../runtime/timers.js';
import { runtime } from '../runtime/state.js';

let attached = false;
let clearTimer = null;

export function attachToastPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.TOAST_SHOWN, ({ text }) => {
    if (!get.toastEl) return;
    get.toastEl.textContent = text;
    if (clearTimer) clearTimer.remove();
    if (runtime.pSceneRef) {
      clearTimer = scheduleOnce(runtime.pSceneRef, 4200, () => {
        if (get.toastEl) get.toastEl.textContent = '';
        clearTimer = null;
      });
    }
  });
}
