import type { CombatProbe } from './harness.ts';

export async function runPlayerMovementChecks(probe: CombatProbe) {
  const { page, check: test, ok, fail } = probe;

  // Requirement 10: WASD updates player position.
  await test('REQ-10 — WASD held keys moves player position', async () => {
    const gameActive = await page.evaluate(() => window.__game.scene.isActive('GameScene'));
    if (!gameActive) { fail('GameScene not active'); return; }
    const box = await (await page.$('#game-container canvas')).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(100);

    const x0 = await page.evaluate(() => window.__state.player.x);
    await page.keyboard.down('d');
    await page.waitForTimeout(600);
    await page.keyboard.up('d');
    const x1 = await page.evaluate(() => window.__state.player.x);
    if (x1 > x0) ok(`x ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
    else fail(`no movement: ${x0.toFixed(2)} → ${x1.toFixed(2)}`);
  });

  // Requirement 11: sprint depletes stamina.
  await test('REQ-11 — Shift+W sprint depletes stamina below 30', async () => {
    await page.evaluate(() => { window.__state.player.stamina = 30; });
    await page.keyboard.down('Shift');
    await page.keyboard.down('w');
    await page.waitForTimeout(1500);
    await page.keyboard.up('w');
    await page.keyboard.up('Shift');
    const s = await page.evaluate(() => window.__state.player.stamina);
    if (s < 30) ok(`stamina 30 → ${s.toFixed(1)}`);
    else fail(`stamina=${s}`);
  });
}
