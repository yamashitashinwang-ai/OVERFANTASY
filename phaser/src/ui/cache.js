// Shared HTML render caches. Each ui/<panel>.js writes its last-rendered
// HTML string here so repeat renders are no-ops when the content hasn't
// changed (avoids forcing the browser to reflow on every game frame).
//
// The cache is exposed as a mutable object so Game.js's clearLanguageRenderCaches
// can reset all entries at once on LANGUAGE_CHANGED.

export const htmlCache = {
  gear: '',
  backpack: '',
  quest: '',
  shop: '',
  forge: '',
  magic: '',
  menu: '',
  pause: ''
};

export function clearHtmlCaches() {
  for (const k of Object.keys(htmlCache)) htmlCache[k] = '';
}
