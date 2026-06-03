import { display as D } from '../runtime.ts';
import type Phaser from 'phaser';
import { objectTextureKey } from '../placeholder-art.ts';
import { state } from '../../runtime/state.ts';
import { tile } from '../../runtime/constants.ts';
import type { WorldObjectState } from '../../domain/types.ts';

function isWalkThroughObject(o: WorldObjectState): boolean {
  return o.kind === 'portal' || o.kind === 'roadSign' || o.kind === 'mapExit' || o.action === 'exit';
}

function objectCollisionPieces(o: WorldObjectState) {
  if (isWalkThroughObject(o)) return [];
  if (o.collisionProfile === 'treeTrunk' || o.kind === 'tree') {
    const x = o.x * tile;
    const y = o.y * tile;
    const w = o.w * tile;
    const h = o.h * tile;
    return [{
      x: x + w * 0.42,
      y: y + h * 0.68,
      w: Math.max(8, w * 0.16),
      h: Math.max(12, h * 0.24)
    }];
  }
  if (o.environment || o.visualOnly) return [];
  const x = o.x * tile;
  const y = o.y * tile;
  const w = o.w * tile;
  const h = o.h * tile;
  const buildingWithDoor = o.kind === 'house' || o.kind === 'shop' || o.kind === 'guild' || o.kind === 'magicCottage';
  if (!buildingWithDoor) return [{ x: x + 3, y: y + 3, w: Math.max(4, w - 6), h: Math.max(4, h - 6) }];
  const sideW = Math.max(8, Math.min(w * 0.26, 24));
  const topH = Math.max(12, Math.min(h * 0.42, 30));
  return [
    { x: x + 3, y: y + 3, w: Math.max(4, w - 6), h: topH },
    { x: x + 3, y: y + topH, w: sideW, h: Math.max(4, h - topH - 3) },
    { x: x + w - sideW - 3, y: y + topH, w: sideW, h: Math.max(4, h - topH - 3) }
  ];
}

function addObjectCollisionRects(o: WorldObjectState): Phaser.GameObjects.Rectangle[] {
  if (!D.pScene || !D.staticBuildingsGroup) return [];
  return objectCollisionPieces(o).map(piece => {
    const rect = D.pScene!.add.rectangle(piece.x + piece.w / 2, piece.y + piece.h / 2, piece.w, piece.h, 0x000000, 0);
    rect.setVisible(false);
    D.staticBuildingsGroup!.add(rect);
    const body = rect.body as { updateFromGameObject?: () => void } | null;
    body?.updateFromGameObject?.();
    return rect;
  });
}

export function syncObjectDisplay() {
  if (!D.pScene) return;
  const visibleObjects = state.objects.filter(o => o.kind !== 'mapExit');
  const currentIds = new Set(visibleObjects.map(o => o.id));
  for (const [id, display] of D.objectDisplayMap) {
    if (!currentIds.has(id)) {
      display.sprite.destroy();
      for (const rect of display.collisionRects) rect.destroy();
      display.labelBg.destroy();
      display.labelText.destroy();
      D.objectDisplayMap.delete(id);
    }
  }
  for (const o of visibleObjects) {
    let display = D.objectDisplayMap.get(o.id);
    if (!display) {
      const sprite = D.pScene.add.image((o.x + o.w / 2) * tile, (o.y + o.h / 2) * tile, objectTextureKey(o));
      sprite.setDisplaySize(o.w * tile, o.h * tile);
      sprite.setDepth(1 + (o.y + o.h) / 10000);
      const collisionRects = addObjectCollisionRects(o);
      const labelW = Math.max(54, o.name.length * 13);
      const labelBg = D.pScene.add.rectangle(
        o.x * tile - 4 + labelW / 2,
        o.y * tile - 18 + 17 / 2,
        labelW, 17,
        0x080a0c, 0.7
      );
      labelBg.setDepth(7);
      const labelText = D.pScene.add.text(o.x * tile, o.y * tile - 17, o.name, {
        fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif',
        fontSize: '12px',
        color: '#edf3f7'
      });
      labelText.setDepth(8);
      display = { sprite, collisionRects, labelBg, labelText, object: o };
      D.objectDisplayMap.set(o.id, display);
    }
    display.sprite.setTexture(objectTextureKey(o));
    display.sprite.setPosition((o.x + o.w / 2) * tile, (o.y + o.h / 2) * tile);
    display.sprite.setDisplaySize(o.w * tile, o.h * tile);
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const playerDist = Math.hypot(state.player.x - cx, state.player.y - cy);
    const showLabel = !o.environment && (o.kind === 'portal' || o.kind === 'roadSign' || playerDist < 4);
    display.labelBg.setVisible(showLabel);
    display.labelText.setVisible(showLabel);
  }
}
