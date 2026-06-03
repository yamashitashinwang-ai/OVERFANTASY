import DATA from '../../data.ts';
import { runtime, state } from '../../runtime/state.ts';
import { magicChantTimeScale } from '../../runtime/constants.ts';
import { escapeHtml } from '../../domain/math.ts';

const { magicCatalog } = DATA;

export function knownMagicCards(allowCast = true) {
  const known = state.player.magicKnown.map(id => ({ id, ...magicCatalog[id] })).filter(spell => spell.name);
  if (!known.length) return '<div class="trade-card"><p>还没有学会魔法。</p></div>';
  return known.map(spell => {
    const chantTime = (spell.chant ?? 0.5) * magicChantTimeScale;
    const hasEnoughMpToStart = chantTime > 0 ? state.player.mp > 0 : state.player.mp >= spell.cost;
    const castButton = allowCast ? `<div class="quest-actions"><button type="button" data-magic-action="cast" data-spell="${spell.id}" ${hasEnoughMpToStart && !runtime.pendingMagicCast ? "" : "disabled"}>施放</button></div>` : "";
    return `<div class="trade-card"><h3>${escapeHtml(spell.name)}</h3><p>MP 消耗：${spell.cost}</p><p>${escapeHtml(spell.desc || "")}</p>${castButton}</div>`;
  }).join("");
}
