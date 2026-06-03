import type { E2eProbe } from './harness.ts';

export async function runGameplayChecks(probe: E2eProbe) {
  const { page, step, ok, fail, state: $state } = probe;
  const box = await probe.getCanvasBox();

  // ─── MOVEMENT ──────────────────────────────────────────────────────────
  await step('WASD movement updates player position', async () => {
    const before = await $state();
    await page.keyboard.down('d'); await page.waitForTimeout(400); await page.keyboard.up('d');
    const after = await $state();
    if (after.player.x !== before.player.x) ok(`moved Δx=${(after.player.x - before.player.x).toFixed(2)}`);
    else fail('no movement after pressing D');
  });

  await step('Shift+W (sprint) depletes stamina', async () => {
    await page.keyboard.down('Shift'); await page.keyboard.down('w');
    await page.waitForTimeout(1200);
    await page.keyboard.up('w'); await page.keyboard.up('Shift');
    const s = await $state();
    if (s.player.stamina < 30) ok(`stamina=${s.player.stamina.toFixed(1)}/30`);
    else fail(`stamina did not deplete: ${s.player.stamina}`);
  });

  // ─── DODGE ──────────────────────────────────────────────────────────────
  await step('Space triggers dodge cooldown', async () => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    const after = await $state();
    if (after.player.dodgeCooldown > 0 || after.player.dodgeTimer > 0) ok(`dodgeCD=${after.player.dodgeCooldown.toFixed(2)}`);
    else fail('no dodge cooldown set');
  });

  // ─── COMBAT (left click) ──────────────────────────────────────────────────
  await step('Left click triggers attack (cooldown set)', async () => {
    await page.waitForTimeout(700); // wait for any pending cd
    const before = await $state();
    await page.mouse.move(box.x + 600, box.y + 300);
    await page.mouse.down(); await page.waitForTimeout(50); await page.mouse.up();
    await page.waitForTimeout(150);
    const after = await $state();
    if (after.player.attackCooldown > 0 || before.player.attackCooldown > 0) ok(`attackCD active`);
    else fail('attack cooldown did not fire');
  });
}
