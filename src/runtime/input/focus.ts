export function restoreGameInputFocus(scene?: unknown) {
  if (typeof document === 'undefined') return;
  const sceneCanvas = (scene as { game?: { canvas?: HTMLCanvasElement | null } } | null | undefined)?.game?.canvas;
  const canvas = sceneCanvas ?? document.querySelector('canvas');
  if (!canvas || typeof canvas.focus !== 'function') return;
  if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
  try {
    canvas.focus({ preventScroll: true });
  } catch {
    canvas.focus();
  }
}
