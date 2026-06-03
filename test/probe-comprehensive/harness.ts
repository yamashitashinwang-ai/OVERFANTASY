import { chromium, type Browser, type Page } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';

export type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ComprehensiveProbe = {
  browser: Browser;
  page: Page;
  errors: string[];
  expect(label: string, condition: boolean): boolean;
  tally(ok: boolean): void;
  flushErrors(): number;
  bootstrap(): Promise<void>;
  getCanvasBox(): Promise<CanvasBox>;
  focusCanvas(): Promise<CanvasBox>;
  finish(): Promise<number>;
};

export async function createComprehensiveProbe(): Promise<ComprehensiveProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors: string[] = [];
  let pass = 0;
  let fail = 0;

  page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
  });

  const expect = (label: string, condition: boolean) => {
    if (condition) {
      console.log(`  ✓ ${label}`);
      return true;
    }
    console.log(`  ✗ ${label} (errors: ${errors.slice(-2).join(' | ')})`);
    return false;
  };

  const tally = (ok: boolean) => {
    ok ? pass += 1 : fail += 1;
  };

  const flushErrors = () => {
    const count = errors.length;
    errors.length = 0;
    return count;
  };

  const bootstrap = () => page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });

  const getCanvasBox = async () => {
    const canvas = await page.$('#game-container canvas');
    const box = await canvas?.boundingBox();
    if (!box) throw new Error('missing game canvas box');
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };

  const focusCanvas = async () => {
    const box = await getCanvasBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    return box;
  };

  const finish = async () => {
    console.log(`\n${pass + fail} checks: ${pass} pass, ${fail} fail`);
    await browser.close();
    return fail ? 1 : 0;
  };

  return { browser, page, errors, expect, tally, flushErrors, bootstrap, getCanvasBox, focusCanvas, finish };
}
