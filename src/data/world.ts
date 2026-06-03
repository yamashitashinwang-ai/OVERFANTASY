import type { DataCatalog } from '../domain/types.ts';

export const regions: DataCatalog['regions'] = {
  village: { name: "白铃村", trust: 80, hate: 5 },
  forest: { name: "树灵森林", trust: 62, hate: 12 },
  ruins: { name: "旧王城遗迹", trust: 35, hate: 36 },
  field: { name: "晨风原野", trust: 50, hate: 20 },
  swamp: { name: "沉灯沼泽", trust: 28, hate: 48 },
  mountain: { name: "断脊山道", trust: 42, hate: 32 },
  demon: { name: "魔王城前庭", trust: 8, hate: 72 },
  silverleaf: { name: "银叶林", trust: 76, hate: 6 },
  peakless: { name: "无峰山脉", trust: 38, hate: 34 },
  stonegorge: { name: "石泉沟壑", trust: 68, hate: 14 },
  hatepit: { name: "仇恨之孔", trust: 8, hate: 68 }
};

export const colors: DataCatalog['colors'] = {
  grass: "#456b45",
  forest: "#2e5a3a",
  village: "#6f684e",
  ruins: "#50505f",
  road: "#83745c",
  water: "#325d7f",
  dungeon: "#242931",
  wall: "#15191f",
  swamp: "#31544f",
  mountain: "#5b574f",
  castle: "#403846",
  ash: "#3d3b36",
  silverleaf: "#6f9f72",
  elvenRoad: "#a9b987",
  paleGrove: "#86b887",
  ore: "#68675f",
  chasm: "#25222b",
  seal: "#53506e"
};

export const sceneNames: DataCatalog['sceneNames'] = {
  field: "晨风原野",
  forest: "树灵森林深处",
  ruins: "旧王城外郭",
  demon: "魔王城前庭",
  silverleaf: "银叶林",
  peakless: "无峰山脉",
  stonegorge: "石泉沟壑",
  hatepit: "仇恨之孔",
  dungeon: "排列迷宫"
};
