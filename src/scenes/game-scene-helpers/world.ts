import DATA from '../../data.ts';
import type Phaser from 'phaser';
import { state } from '../../runtime/state.ts';
import { clamp } from '../../domain/math.ts';
import { schedulePeriodic, scheduleOnce } from '../../runtime/timers.ts';
import { updateQuestProgress } from '../../domain/quest.ts';
import { updateMpRegen } from '../../domain/magic.ts';
import { worldNews } from '../../domain/npc.ts';
import { spawnForCurrentScene } from '../../domain/dungeon.ts';

const { regions } = DATA;

export function livingCount(species: string): number {
  return state.entities.filter(e => e.alive && e.species === species).length;
}

// Monotonic world clock + quest/MP regen tickers. All other recurring events
// run on Phaser timers scheduled in installWorldTimers().
export function updateWorld(dt: number) {
  state.time += dt;
  updateQuestProgress(dt);
  updateMpRegen(dt);
}

// Install the recurring world tickers once the GameScene is up. Each timer is
// either schedulePeriodic (fixed interval) or self-rescheduling scheduleOnce
// (interval varies).
export function installWorldTimers(scene: Phaser.Scene) {
  // Hate decay: every 24s in-game.
  schedulePeriodic(scene, 24000, () => {
    for (const r of Object.values(regions)) {
      r.hate = clamp(r.hate - 1, 0, 100);
    }
  });

  // World news ticker: random 42..70s interval, only fires while in world mode.
  const scheduleNews = () => {
    const intervalMs = (42 + Math.random() * 28) * 1000;
    scheduleOnce(scene, intervalMs, () => {
      if (state.mode === 'world') worldNews(true);
      scheduleNews();
    });
  };
  scheduleNews();

  // Monster spawn ticker: 5.5s in demon scene, 7.5s elsewhere.
  const scheduleSpawn = () => {
    const intervalMs = (state.scene === 'demon' ? 5.5 : 7.5) * 1000;
    scheduleOnce(scene, intervalMs, () => {
      spawnForCurrentScene();
      scheduleSpawn();
    });
  };
  scheduleSpawn();
}
