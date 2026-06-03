import type { ComprehensiveProbe } from './harness.ts';

async function openClosePanel(probe: ComprehensiveProbe, key: string, panelId: string, label: string): Promise<void> {
  await probe.page.keyboard.press(key);
  await probe.page.waitForTimeout(400);
  const info = await probe.page.evaluate(id => {
    const el = document.getElementById(id);
    return { open: !el.classList.contains('hidden'), len: el.innerHTML.length };
  }, panelId);
  probe.tally(probe.expect(`${label} opens with content`, info.open && info.len > 50));
  probe.tally(probe.expect(`${label}: no errors`, probe.flushErrors() === 0));
  await probe.page.keyboard.press('Escape');
  await probe.page.waitForTimeout(250);
}

export async function runPanelsPhase(probe: ComprehensiveProbe): Promise<void> {
  console.log('\n[3] Panels');
  await openClosePanel(probe, 'b', 'backpackPanel', 'Backpack');
  await openClosePanel(probe, 'j', 'questPanel', 'Quest');
  await openClosePanel(probe, 'f', 'magicPanel', 'Magic');
}
