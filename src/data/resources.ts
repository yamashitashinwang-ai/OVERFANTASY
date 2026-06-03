import type { DataCatalog } from '../domain/types.ts';

export const resourceCatalog: DataCatalog['resourceCatalog'] = {
  "木材": { group: "wood", desc: "基础木材，可用于建筑与基础锻造。" },
  "硬木": { group: "wood", desc: "更结实的木材，可用于进阶武器锻造。" },
  "银叶木": { group: "wood", desc: "银叶林特产木材，适合制作精灵风格武器。" },
  "寒风枯枝": { group: "wood", desc: "来自寒冷山路的枯枝，质地干硬。" },
  "反重力石": { group: "stone", desc: "稳定材料，可用于建筑与基础锻造。" },
  "山脉碎石": { group: "stone", desc: "无峰山脉常见碎石。" },
  "粗矿石": { group: "stone", desc: "粗糙但实用的矿石。" },
  "石泉矿石": { group: "stone", desc: "石泉沟壑的稳定矿石。" },
  "异常矿石": { group: "stone", desc: "带有异常气息的矿石。" },
  "黑裂矿": { group: "stone", desc: "仇恨之孔附近的暗色裂纹矿。" },
  "魔城黑石": { group: "stone", desc: "魔王城周边的黑色石材。" },
  "七眼蛛丝": { group: "special", desc: "树灵森林南部可采得的蛛丝，不属于木材或石材，可用于弓类锻造。" }
};
