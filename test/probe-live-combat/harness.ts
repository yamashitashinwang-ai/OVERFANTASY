import { chromium, type Browser, type Page } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';

export type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LiveCombatProbe = {
  browser: Browser;
  page: Page;
  errors: string[];
  failures: string[];
  ok(message: string): void;
  fail(message: string): void;
  test(label: string, fn: () => Promise<void>): Promise<void>;
  bootstrap(): Promise<void>;
  focusCanvas(): Promise<CanvasBox>;
  cleanupTestEntities(): Promise<void>;
  finish(totalChecks: number): Promise<number>;
};

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function createLiveCombatProbe(): Promise<LiveCombatProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors: string[] = [];
  const failures: string[] = [];

  page.on('pageerror', e => errors.push(`PAGE: ${e.message.slice(0, 240)}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`CON: ${m.text().slice(0, 240)}`);
  });

  const ok = (message: string) => console.log('  ✓', message);
  const fail = (message: string) => {
    console.log('  ✗', message);
    failures.push(message);
  };

  const test = async (label: string, fn: () => Promise<void>) => {
    errors.length = 0;
    console.log('\n▶', label);
    try {
      await fn();
    } catch (error) {
      fail(`${label} threw: ${toMessage(error).slice(0, 200)}`);
    }
    if (errors.length) {
      fail(`${label}: ${errors.length} errors`);
      errors.slice(0, 2).forEach(e => console.log('     →', e));
    }
  };

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

  const focusCanvas = async () => {
    const canvas = await page.$('#game-container canvas');
    const box = await canvas?.boundingBox();
    if (!box) throw new Error('missing game canvas box');
    const canvasBox = { x: box.x, y: box.y, width: box.width, height: box.height };
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    return canvasBox;
  };

  const cleanupTestEntities = () => page.evaluate(() => {
    window.__state.entities = window.__state.entities.filter(e => !e.id?.startsWith('live-test'));
    window.__state.player.hp = window.__state.player.maxHp;
    window.__state.player.monsterForm = false;
  });

  const finish = async (totalChecks: number) => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'}: ${totalChecks - failures.length}/${totalChecks} live-play checks pass`);
    failures.forEach(f => console.log(' ✗', f));
    await browser.close();
    return failures.length ? 1 : 0;
  };

  return { browser, page, errors, failures, ok, fail, test, bootstrap, focusCanvas, cleanupTestEntities, finish };
}
