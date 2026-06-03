import { display as D } from '../runtime.ts';
import { hexToInt } from '../colors.ts';
import { attachCircleBody } from '../physics.ts';
import { entityTextureKey } from '../placeholder-art.ts';
import { npcVisualAdjust } from '../animations.ts';
import { state } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import type { ActorState } from '../../domain/types.ts';

export function syncEntityDisplay() {
  if (!D.pScene) return;
  const aliveById = new Map<string, ActorState>();
  for (const e of state.entities) {
    if (e.alive) aliveById.set(e.id, e);
  }
  // Remove no-longer-alive
  for (const [id, display] of D.entityDisplayMap) {
    if (!aliveById.has(id)) {
      display.circle.destroy();
      display.sprite?.destroy();
      D.entityDisplayMap.delete(id);
    }
  }
  // Add/update alive
  for (const [id, e] of aliveById) {
    let display = D.entityDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(e.x * tile, e.y * tile, e.r, 0, 360, false, hexToInt(e.color));
      circle.setVisible(false);
      attachCircleBody(circle, e.r, true);
      if (D.entitiesGroup) D.entitiesGroup.add(circle);
      const sprite = D.pScene.add.sprite(e.x * tile, e.y * tile, entityTextureKey(e));
      sprite.setOrigin(0.5, 0.88);
      sprite.setDepth(4);
      display = { circle, sprite };
      D.entityDisplayMap.set(id, display);
    }
    display.entity = e;
    display.circle.setVisible(false);
    display.circle.setRadius(e.r);
    if (display.sprite) {
      const visual = npcVisualAdjust(e);
      display.sprite.setTexture(entityTextureKey(e));
      display.sprite.setPosition(display.circle.x + visual.offsetX, display.circle.y + visual.offsetY);
      display.sprite.setDepth(4 + display.circle.y / 100000);
      if (!display.circle._hitTweenActive) display.sprite.setScale(visual.scale);
      if (!display.circle._hitTweenActive) {
        if (visual.tint) display.sprite.setTint(visual.tint);
        else if (e.slowTimer > 0) display.sprite.setTint(0x6ee0d2);
        else if (e.wantsTalk) display.sprite.setTint(0xf3c45b);
        else if (e.wounded) display.sprite.setTint(0xf1a381);
        else display.sprite.clearTint();
      }
    }
  }
}
