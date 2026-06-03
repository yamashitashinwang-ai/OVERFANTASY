import { display as D } from '../../runtime.ts';
import { state } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { clamp } from '../../../domain/math.ts';

export function syncHpBars() {
  if (!D.hpBarsGfx) return;
  D.hpBarsGfx.clear();
  for (const [id, display] of D.entityDisplayMap) {
    const e = state.entities.find(ent => ent.id === id);
    if (!e || !e.alive || e.hp >= e.maxHp) continue;
    const x = display.circle.x;
    const y = display.circle.y;
    D.hpBarsGfx.fillStyle(0x111820, 1);
    D.hpBarsGfx.fillRect(x - 13, y - e.r - 10, 26, 4);
    D.hpBarsGfx.fillStyle(0x62c78f, 1);
    D.hpBarsGfx.fillRect(x - 13, y - e.r - 10, 26 * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
  for (const display of D.petDisplayMap.values()) {
    const pet = display.pet;
    if (!pet) continue;
    const x = pet.x * tile;
    const y = pet.y * tile;
    const injured = pet.injured && !pet.lost;
    D.hpBarsGfx.fillStyle(0x080a0c, 0.72);
    D.hpBarsGfx.fillRect(x - 19, y + pet.r + 3, 38, 5);
    D.hpBarsGfx.fillStyle(injured ? 0xff8f70 : 0x62c78f, 1);
    D.hpBarsGfx.fillRect(x - 19, y + pet.r + 3, 38 * clamp(pet.hp / pet.maxHp, 0, 1), 5);
  }
}
