// Lazy DOM element accessors for the HTML panels. Each getter fetches its
// element on first call and caches it. Avoids each ui module having to
// rediscover its `<div>` ID.

const cache = {};
function el(id) {
  if (!cache[id]) cache[id] = document.getElementById(id);
  return cache[id];
}

export const gearPanelEl = new Proxy({}, { get(_, prop) { return el('gearPanel')[prop]; } });
// Simple direct refs (most accesses are .classList / .innerHTML — proxy approach above is fine).
// For simplicity expose getter functions instead:

export const get = {
  get gearPanelEl()   { return el('gearPanel'); },
  get backpackEl()    { return el('backpackPanel'); },
  get questPanelEl()  { return el('questPanel'); },
  get shopPanelEl()   { return el('shopPanel'); },
  get forgePanelEl()  { return el('forgePanel'); },
  get magicPanelEl()  { return el('magicPanel'); },
  get mainMenuEl()    { return el('mainMenu'); },
  get pauseMenuEl()   { return el('pauseMenu'); },
  get statsEl()       { return el('stats'); },
  get toastEl()       { return el('toast'); },
  get logEl()         { return el('log'); }
};
