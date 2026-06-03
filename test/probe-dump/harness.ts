import { chromium, type Browser, type Page } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';

export type BrowserConsoleEntry = {
  t: number;
  type: string;
  text: string;
};

export type ProbeLogEntry = {
  t: number;
  msg: string;
};

export type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DumpProbe = {
  browser: Browser;
  page: Page;
  consoleLog: BrowserConsoleEntry[];
  errors: ProbeLogEntry[];
  invariantBreaks: ProbeLogEntry[];
  bootstrap(): Promise<void>;
  getCanvasBox(): Promise<CanvasBox>;
  focusCanvas(): Promise<CanvasBox>;
  close(): Promise<void>;
};

export async function createDumpProbe(): Promise<DumpProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const consoleLog: BrowserConsoleEntry[] = [];
  const errors: ProbeLogEntry[] = [];
  const invariantBreaks: ProbeLogEntry[] = [];

  page.on('pageerror', e => errors.push({ t: Date.now(), msg: e.message }));
  page.on('console', m => {
    const text = m.text();
    consoleLog.push({ t: Date.now(), type: m.type(), text });
    if (m.type() === 'error') errors.push({ t: Date.now(), msg: text });
    if (text.startsWith('[invariant]')) invariantBreaks.push({ t: Date.now(), msg: text });
  });

  const bootstrap = async () => {
    await page.goto(probeBaseUrl(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.click());
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.click());
    await page.waitForTimeout(2000);
    for (let i = 0; i < 30; i += 1) {
      if (await page.evaluate(() => !!window.__api)) break;
      await page.waitForTimeout(100);
    }
  };

  const getCanvasBox = async () => {
    const canvas = await page.$('#game-container canvas');
    const box = await canvas?.boundingBox();
    if (!box) throw new Error('missing game canvas box');
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };

  const focusCanvas = async () => {
    const box = await getCanvasBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    return box;
  };

  return { browser, page, consoleLog, errors, invariantBreaks, bootstrap, getCanvasBox, focusCanvas, close: () => browser.close() };
}
