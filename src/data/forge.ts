import type { DataCatalog } from '../domain/types.ts';

export const weaponForgeCatalog: DataCatalog['weaponForgeCatalog'] = {
  "剑": [
    { gearId: "ironSword", materials: { "木材": 1, "反重力石": 2 } },
    { gearId: "dodoSword", materials: { "硬木": 1, "山脉碎石": 2 } },
    { gearId: "reconciliationSword", materials: { "银叶木": 1, "石泉矿石": 2 } },
    { gearId: "deepBlackSword", materials: { "寒风枯枝": 1, "黑裂矿": 2 } },
    { gearId: "demonfallSword", materials: { "寒风枯枝": 1, "黑裂矿": 1, "魔城黑石": 1 } }
  ],
  "弓": [
    { gearId: "shortBow", materials: { "木材": 2, "反重力石": 1, "七眼蛛丝": 1 } },
    { gearId: "hardwoodBow", materials: { "硬木": 2, "山脉碎石": 1, "七眼蛛丝": 1 } },
    { gearId: "silverleafBow", materials: { "银叶木": 2, "粗矿石": 1, "七眼蛛丝": 1 } },
    { gearId: "frostwindBow", materials: { "寒风枯枝": 2, "异常矿石": 1, "七眼蛛丝": 1 } },
    { gearId: "acrossGenerations", materials: { "银叶木": 6, "石泉矿石": 3, "七眼蛛丝": 7 } }
  ],
  "匕首": [
    { gearId: "fineDagger", materials: { "硬木": 1, "粗矿石": 1 } },
    { gearId: "bloodDagger", materials: { "银叶木": 1, "黑裂矿": 1 } },
    { gearId: "demonSleeveBlade", materials: { "寒风枯枝": 1, "魔城黑石": 1 } }
  ],
  "长枪": [
    { gearId: "trainingSpear", materials: { "木材": 2, "反重力石": 1 } },
    { gearId: "guardSpear", materials: { "硬木": 2, "粗矿石": 1 } },
    { gearId: "angelBlade", materials: { "银叶木": 2, "黑裂矿": 1 } },
    { gearId: "screamSpear", materials: { "寒风枯枝": 2, "魔城黑石": 1 } }
  ],
  "锤": [
    { gearId: "oakHammer", materials: { "木材": 1, "反重力石": 3 } },
    { gearId: "warHammer", materials: { "硬木": 1, "粗矿石": 3 } },
    { gearId: "handOfAres", materials: { "寒风枯枝": 1, "异常矿石": 3 } },
    { gearId: "beyondGenerations", materials: { "银叶木": 3, "石泉矿石": 8 } }
  ]
};
