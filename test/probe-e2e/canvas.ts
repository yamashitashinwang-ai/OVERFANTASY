import type { Page } from 'playwright';
import type { CanvasBox } from './types.ts';

export function createCanvasHelpers(page: Page) {
  const getCanvasBox = async (): Promise<CanvasBox> => {
    const canvas = await page.$('#game-container canvas');
    const box = await canvas?.boundingBox();
    if (!box) throw new Error('missing game canvas box');
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };

  const focusCanvas = async (): Promise<CanvasBox> => {
    const box = await getCanvasBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    return box;
  };

  return { getCanvasBox, focusCanvas };
}
