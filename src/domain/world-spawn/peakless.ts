import { rand } from '../math.ts';
import { addPortal, spawnCreature, scatterPickups } from '../world.ts';

export function spawnPeakless() {
  addPortal("peakless", "east_exit_to_field", "回到晨风原野", 88, 34, "field", "west_entry_from_peakless", "#83745c");
  addPortal("peakless", "west_exit_to_stonegorge", "石泉西路", 4, 34, "stonegorge", "east_entry_from_peakless", "#9a8f78");
  for (let i = 0; i < 8; i += 1) spawnCreature("wolf", rand(20, 75), rand(12, 58), { region: "peakless" });
  for (let i = 0; i < 7; i += 1) spawnCreature("slime", rand(22, 74), rand(18, 58), { region: "peakless" });
  for (let i = 0; i < 3; i += 1) spawnCreature("skeleton", rand(35, 70), rand(22, 52), { region: "peakless", maxHp: 24, atk: 7 });
  scatterPickups([
    { kind: "stone", name: "山脉碎石", x: 31.5, y: 28.5, color: "#b7c0ca" },
    { kind: "stone", name: "粗矿石", x: 55.5, y: 17.5, color: "#9fa8ad" },
    { kind: "wood", name: "寒风枯枝", x: 68.5, y: 41.5, color: "#b8895a" },
    { kind: "potion", name: "小回复药", x: 78.5, y: 35.5, color: "#5ad0ed" }
  ]);
}
