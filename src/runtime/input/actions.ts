import type Phaser from 'phaser';

export function bindActions(scene: Phaser.Scene, handlers: Record<string, (event: KeyboardEvent) => void>) {
  const keyboard = scene.input.keyboard;
  const subs: Array<[string, (event: KeyboardEvent) => void]> = [];
  for (const [keyCode, fn] of Object.entries(handlers)) {
    const sub = (event: KeyboardEvent) => fn(event);
    keyboard.on(`keydown-${keyCode}`, sub);
    subs.push([`keydown-${keyCode}`, sub]);
  }
  return () => subs.forEach(([event, fn]) => keyboard.off(event, fn));
}

export function routeEscape(getOpenModal: () => string | null, closers: Record<string, () => void>, openPauseFn?: () => void) {
  const open = getOpenModal();
  if (open && closers[open]) { closers[open](); return; }
  if (openPauseFn) openPauseFn();
}
