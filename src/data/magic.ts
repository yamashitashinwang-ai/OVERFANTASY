import type { DataCatalog } from '../domain/types.ts';

export const magicCatalog: DataCatalog['magicCatalog'] = {
  fireball: { name: "火球术", aliases: ["火球术", "メラ", "fireball"], cost: 5, kind: "aoe", damage: 10, radius: 2.1, color: "#ff8a4c", chant: 0.55, effectDuration: 1.0, desc: "在指定位置爆开红色火球，对范围内敌对目标造成少量伤害。", clueLine: "有人含糊地提到火球术的形状，像把热意揉成一个字。" },
  leafCutter: { name: "草飞刀", aliases: ["飞叶快刀", "はっぱカッター", "leaf cutter"], cost: 4, kind: "single", damage: 14, radius: 0.95, color: "#7edb72", chant: 0.42, effectDuration: 0.5, desc: "在指定位置划过绿色菱形叶刃，对附近一个敌对目标造成伤害。", clueLine: "有人说叶片若记住风的走向，就能像刀一样飞出去。" },
  extremeHealing: { name: "甘霖", aliases: ["甘霖", "ベホマズン", "extreme healing"], cost: 10, kind: "heal", heal: 38, radius: 2.2, color: "#7adff2", chant: 0.65, effectDuration: 1.0, desc: "在指定位置寻找友方目标并大量回复生命；没有友方目标时回复自己。", clueLine: "有人讲起一种像雨一样落下的治愈祷词，名字近似甘霖。" },
  thunderFlash: { name: "劈出来一个雷霆大闪电", aliases: ["劈出来一个雷霆大闪电", "かみなり絶好調", "you fxxking scared me"], cost: 18, kind: "aoe", damage: 28, radius: 3.0, color: "#f5e86c", chant: 0.9, effectDuration: 2.0, desc: "在指定位置劈下大范围黄色雷霆，对范围内敌对目标造成大量伤害。", clueLine: "有人神神秘秘地说，雷霆也许只是在等一个足够离谱的命令。" },
  littleCold: { name: "有点冷", aliases: ["有点冷", "ちょっとおい…", "give me my coat..."], cost: 6, kind: "zone", damagePerSecond: 1, radius: 3.0, slowPower: 0.5, color: "#7ccfff", chant: 0.58, effectDuration: 5.0, desc: "在指定位置生成持续 5 秒的蓝色寒雾，减速范围内敌对目标并每秒造成极微量伤害。", clueLine: "有人打了个寒颤，说魔法有时不是火光，而是一句想把外套拿回来的抱怨。" }
};
