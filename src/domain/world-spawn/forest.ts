import { rand } from '../math.ts';
import { addObject, addPortal, spawnCreature, scatterPickups } from '../world.ts';
import { addTree, addBush, addLeaves } from './helpers.ts';

export function spawnForest() {
  addPortal("forest", "north_exit_to_silverleaf", "银叶林北径", 47, 4, "silverleaf", "south_entry_from_forest", "#b9d9a2");
  addPortal("forest", "south_exit_to_village", "回到晨风原野", 4, 33, "field", "north_entry_from_forest", "#83745c");
  addPortal("forest", "east_exit_to_ruins", "沼泽古径", 83, 61, "ruins", "southwest_entry_from_forest", "#5e8a86");
  addObject("shrine", "树根祠", 43, 31, 2, 2, "#ccd2dc", "cleanse");
  addTree("林道杉树", 17.5, 12.2);
  addTree("南林老树", 18.5, 42.2);
  addTree("树根祠后树冠", 39.2, 26.4);
  addTree("溪边树影", 61.5, 19.4);
  addTree("沼泽边树", 72.5, 47.2);
  addTree("古径树冠", 84.5, 51.5);
  addBush("林下草丛", 24.5, 20.6);
  addBush("潮湿草丛", 66.0, 53.4);
  addBush("南路草丛", 14.0, 49.5);
  addBush("树根草丛", 47.0, 34.5);
  addLeaves("落叶堆", 30.5, 15.8);
  addLeaves("红叶堆", 51.5, 41.6);
  addLeaves("沼泽落叶", 78.5, 58.0);
  spawnCreature("treant", 35.5, 24.5, { region: "forest", affection: 0, devotion: 0 });
  spawnCreature("treant", 55.5, 39.5, { region: "forest", affection: 0, devotion: 0 });
  for (let i = 0; i < 18; i += 1) spawnCreature("rabbit", rand(9, 70), rand(7, 45), { region: "forest" });
  for (let i = 0; i < 11; i += 1) spawnCreature("wolf", rand(28, 86), rand(8, 55), { region: "forest" });
  for (let i = 0; i < 8; i += 1) spawnCreature("wisp", rand(61, 87), rand(47, 65), { region: "swamp" });
  scatterPickups([
    { kind: "herb", name: "月见草", x: 25.5, y: 18.5, color: "#8ce86f" },
    { kind: "herb", name: "苦叶草", x: 68.5, y: 40.5, color: "#6bd46c" },
    { kind: "wood", name: "硬木", x: 51.5, y: 17.5, color: "#b8895a" },
    { kind: "resource", name: "七眼蛛丝", x: 45.5, y: 61.5, color: "#d8f5ff" },
    { kind: "potion", name: "小回复药", x: 76.5, y: 58.5, color: "#5ad0ed" },
    { kind: "gear", name: "旅靴", x: 63.5, y: 28.5, color: "#a98f6b" },
    { kind: "gear", name: "铜戒指", x: 80.5, y: 55.5, color: "#c58a4d" }
  ]);
}
