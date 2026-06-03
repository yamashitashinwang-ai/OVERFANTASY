import type { DataCatalog } from '../domain/types.ts';

export const materialCatalog: DataCatalog['materialCatalog'] = {
  "野兔肉": { sell: 2, desc: "可出售，也能作为后续烹饪素材" },
  "柔软毛皮": { sell: 8, def: 1, desc: "锻甲：防御+1" },
  "旧时代之钻": { unsellable: true, cooldownMult: 0.3, repel: true, desc: "不可售出；锻武：攻击间隔-70%；锻头：普通魔物不敢靠近" },
  "活木": { sell: 5, def: 1, desc: "锻甲：防御+1" },
  "树灵核": { sell: 15, def: 2, desc: "锻甲：防御+2" },
  "树灵心": { unsellable: true, pet: "heartTreant", desc: "宠物契约：心芽树灵" },
  "黏液块": { sell: 4, slow: 0.35, duration: 2.8, desc: "锻武/锻甲：让敌人减速" },
  "凝胶药核": { sell: 12, slow: 0.55, duration: 3.4, desc: "锻武/锻甲：强减速" },
  "凝胶爆弹": { sell: 18, aoeSlow: 0.62, slow: 0.8, duration: 4.2, radius: 3.2, desc: "锻武：范围减速；锻甲：强力受击减速" },
  "魔狼牙": { sell: 9, thorns: 2, atk: 1, def: 1, desc: "锻造：反伤+2" },
  "幼狼狗": { unsellable: true, pet: "wolfPup", desc: "宠物契约：幼狼狗" },
  "旧骨片": { sell: 4, def: 1, desc: "锻甲：防御+1" },
  "冷焰瓶": { sell: 7, slow: 0.45, duration: 3.0, desc: "锻武：冷焰减速" },
  "磷光石": { sell: 10, def: 1, desc: "锻甲：防御+1" },
  "魔像石": { sell: 12, def: 2, desc: "锻甲：防御+2" }
};
