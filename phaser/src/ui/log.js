// Log panel UI subscriber. Listens for LOG_APPENDED bus events and renders
// the rolling 14-entry log into the HTML sidebar's `#log` element.
//
// No game state read here — the bus payload carries the current `logs` array.

import { bus, Events } from '../runtime/events.js';
import { get } from './dom.js';
import { escapeHtml } from '../domain/math.js';

let attached = false;

export function attachLogPanel() {
  if (attached) return;
  attached = true;
  bus.on(Events.LOG_APPENDED, ({ logs }) => {
    if (!get.logEl) return;
    get.logEl.innerHTML = logs.map(line => `<p>${escapeHtml(line)}</p>`).join('');
  });
}
