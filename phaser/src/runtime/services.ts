// Cross-layer "thin services" — log + toast. Both are events on the bus;
// any UI module that wants to render them subscribes once at module-load.
//
// Pure of DOM. Pure of Phaser. Domain modules just call log("…") / toast("…")
// without caring whether the UI is HTML, Canvas-native, or absent.

import { bus, Events } from './events.ts';
import { logs } from './state.ts';

const LOG_MAX = 14;

export function log(text: string) {
  logs.unshift(text);
  if (logs.length > LOG_MAX) logs.length = LOG_MAX;
  bus.emit(Events.LOG_APPENDED, { text, logs });
  // log lines also surface as toasts in the original game — preserve that.
  toast(text);
}

export function toast(text: string) {
  bus.emit(Events.TOAST_SHOWN, { text });
}
