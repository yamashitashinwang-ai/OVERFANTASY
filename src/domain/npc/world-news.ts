import { state } from '../../runtime/state.ts';
import DATA from '../../data.ts';
import { log } from '../../runtime/services.ts';
import { addEntity, addPickup } from '../world.ts';
import { choice, clamp, rand } from '../math.ts';

const { regions } = DATA;

export function worldNews(force = false) {
  const events = [
    () => {
      const r = choice(Object.values(regions));
      r.hate = clamp(r.hate + 8, 0, 100);
      return `新闻：${r.name}附近出现魔物潮，区域仇恨上升。`;
    },
    () => {
      const r = choice(Object.values(regions));
      r.trust = clamp(r.trust - 6, 0, 100);
      addEntity({ kind: "npc", name: "伤兵", faction: "human", x: rand(8, 17), y: rand(9, 15), r: 9, hp: 8, maxHp: 18, atk: 1, color: "#f09c86", region: "village", affection: 0, devotion: 0, wounded: true });
      return `新闻：边境小战结束，${r.name}出现伤者。`;
    },
    () => {
      addPickup("herb", "药草", rand(23, 35), rand(6, 20), "#6bd46c");
      return "新闻：树灵森林雨后长出新的药草。";
    },
    () => {
      const r = regions.village;
      r.trust = clamp(r.trust + 4, 0, 100);
      return "新闻：白铃村商队抵达，村民安心了一些。";
    }
  ];
  if (force || state.newsClock <= 0) {
    log(choice(events)());
    state.newsClock = 42 + Math.random() * 28;
  }
}
