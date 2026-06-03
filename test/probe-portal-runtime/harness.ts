import { chromium, type Browser, type Page } from 'playwright';
import { probeBaseUrl } from '../probe-url.ts';

export type PortalProbeObject = {
  kind: string;
  name: string;
  portalId?: string;
  signForPortalId?: string;
  sourceScene?: string;
  action?: string;
  targetMapId?: string;
  targetScene?: string;
  targetSpawnId?: string;
};

export type PortalProbeState = {
  scene: string;
  x: number;
  y: number;
  portals: PortalProbeObject[];
};

export type PortalRuntimeProbe = {
  browser: Browser;
  page: Page;
  errors: string[];
  near(actual: number, expected: number): boolean;
  ok(message: string): void;
  fail(message: string): never;
  bootGame(): Promise<void>;
  prepareAt(scene: string, x: number, y: number, settleMs?: number): Promise<void>;
  waitForAutoExitAndRead(): Promise<PortalProbeState>;
  close(): Promise<void>;
};

export async function createPortalRuntimeProbe(): Promise<PortalRuntimeProbe> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const baseUrl = probeBaseUrl();
  const errors: string[] = [];

  page.on('pageerror', e => errors.push(`PAGE: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
  });

  const near = (actual: number, expected: number) => Math.abs(actual - expected) < 0.01;
  const ok = (message: string) => console.log(`  ✓ ${message}`);
  const fail = (message: string): never => {
    throw new Error(`${message}${errors.length ? ` | ${errors.slice(-2).join(' | ')}` : ''}`);
  };

  const bootGame = async () => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.querySelector('[data-menu-action="new"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelector('[data-menu-action="startRace"][data-race="人类"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(1500);
  };

  const prepareAt = async (scene: string, x: number, y: number, settleMs = 100) => {
    await page.evaluate(({ scene, x, y }) => {
      window.__api.makeMap(scene);
      window.__api.spawnWorld(scene);
      window.__state.player.portalCooldown = 0;
      window.__state.player.x = x;
      window.__state.player.y = y;
      window.__api.rebuildDisplay();
      window.__api.teleportBody(window.__state.player);
    }, { scene, x, y });
    if (settleMs > 0) await page.waitForTimeout(settleMs);
  };

  const waitForAutoExitAndRead = async () => {
    await page.waitForTimeout(600);
    return page.evaluate(() => ({
      scene: window.__state.scene,
      x: window.__state.player.x,
      y: window.__state.player.y,
      portals: window.__state.objects
        .filter(obj => obj.kind === 'mapExit' || obj.kind === 'roadSign')
        .map(obj => ({
          kind: obj.kind,
          name: obj.name,
          portalId: obj.portalId,
          signForPortalId: obj.signForPortalId,
          sourceScene: obj.sourceScene,
          action: obj.action,
          targetMapId: obj.targetMapId,
          targetScene: obj.targetScene,
          targetSpawnId: obj.targetSpawnId
        }))
    }));
  };

  return { browser, page, errors, near, ok, fail, bootGame, prepareAt, waitForAutoExitAndRead, close: () => browser.close() };
}
