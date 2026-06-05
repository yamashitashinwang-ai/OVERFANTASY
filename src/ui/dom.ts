// Lazy DOM element accessors for the HTML panels. Each getter fetches its
// element on first call and caches it. Avoids each ui module having to
// rediscover its `<div>` ID.

const cache: Record<string, HTMLElement | null> = {};
function el(id: string): HTMLElement | null {
  if (!cache[id] || !cache[id]?.isConnected) cache[id] = document.getElementById(id);
  return cache[id];
}

export const get = {
  get backpackEl()    { return el('backpackPanel'); },
  get questPanelEl()  { return el('questPanel'); },
  get shopPanelEl()   { return el('shopPanel'); },
  get forgePanelEl()  { return el('forgePanel'); },
  get magicPanelEl()  { return el('magicPanel'); },
  get characterPanelEl() { return el('characterPanel'); },
  get careerPanelEl() { return el('careerPanel'); },
  get mainMenuEl()    { return el('mainMenu'); },
  get pauseMenuEl()   { return el('pauseMenu'); },
  get toastEl()       { return el('toast'); },
};
