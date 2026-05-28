import type { DataCatalog } from './domain/types.ts';

const DATA: DataCatalog = {
    regions: {
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
    },

    colors: {
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
    },

    sceneNames: {
      field: "晨风原野",
      forest: "树灵森林深处",
      ruins: "旧王城外郭",
      demon: "魔王城前庭",
      silverleaf: "银叶林",
      peakless: "无峰山脉",
      stonegorge: "石泉沟壑",
      hatepit: "仇恨之孔",
      dungeon: "排列迷宫"
    },

    bestiary: {
      rabbit: {
        name: "野兔",
        kind: "animal",
        faction: "animal",
        color: "#d8d1b1",
        r: 8,
        hp: 7,
        atk: 0,
        speed: 1.9,
        flee: true,
        commonDrop: { kind: "material", name: "野兔肉", color: "#d7b58c", chance: 0.9 },
        rareDrop: { kind: "material", name: "柔软毛皮", color: "#eee6c8", chance: 0.12 },
        extraDrops: [
          { kind: "material", name: "旧时代之钻", color: "#f8f2ff", chance: 0.00001 }
        ]
      },
      treant: {
        name: "幼树灵",
        kind: "friendly",
        faction: "tree",
        color: "#6ed084",
        r: 12,
        hp: 28,
        atk: 4,
        speed: 0.9,
        commonDrop: { kind: "material", name: "活木", color: "#8fcf70", chance: 0.75 },
        rareDrop: { kind: "material", name: "树灵核", color: "#d4f7bc", chance: 0.08 },
        extraDrops: [
          { kind: "material", name: "树灵心", color: "#a8ffd1", chance: 0.001 }
        ]
      },
      slime: {
        name: "灰史莱姆",
        kind: "monster",
        faction: "monster",
        color: "#d95858",
        r: 10,
        hp: 22,
        atk: 6,
        speed: 1.65,
        split: true,
        commonDrop: { kind: "material", name: "黏液块", color: "#b9d2b3", chance: 0.68 },
        rareDrop: { kind: "material", name: "凝胶药核", color: "#5ad0ed", chance: 0.18 },
        extraDrops: [
          { kind: "material", name: "凝胶爆弹", color: "#7adff2", chance: 0.01 }
        ]
      },
      wolf: {
        name: "小魔狼",
        kind: "monster",
        faction: "monster",
        color: "#b75ee8",
        r: 10,
        hp: 24,
        atk: 8,
        speed: 2.55,
        pounce: true,
        commonDrop: { kind: "material", name: "魔狼牙", color: "#e2e4e8", chance: 0.54 },
        rareDrop: { kind: "weapon", name: "狼牙短剑", color: "#ded6ef", chance: 0.1 },
        extraDrops: [
          { kind: "material", name: "幼狼狗", color: "#c8b49b", chance: 0.005 }
        ]
      },
      skeleton: {
        name: "骨兵",
        kind: "monster",
        faction: "monster",
        color: "#d7d0be",
        r: 10,
        hp: 30,
        atk: 9,
        speed: 1.35,
        guard: true,
        commonDrop: { kind: "material", name: "旧骨片", color: "#c7c1b2", chance: 0.62 },
        rareDrop: { kind: "weapon", name: "锈蚀长剑", color: "#cfd3d6", chance: 0.13 },
        extraDrops: [
          { kind: "weapon", name: "崭新长剑", color: "#edf3f7", chance: 0.001 }
        ]
      },
      wisp: {
        name: "沼火",
        kind: "monster",
        faction: "monster",
        color: "#6ee0d2",
        r: 9,
        hp: 20,
        atk: 7,
        speed: 2.0,
        ranged: true,
        commonDrop: { kind: "material", name: "冷焰瓶", color: "#5ad0ed", chance: 0.5 },
        rareDrop: { kind: "material", name: "磷光石", color: "#b7c0ca", chance: 0.16 }
      },
      gargoyle: {
        name: "石像鬼",
        kind: "monster",
        faction: "monster",
        color: "#8f8a9a",
        r: 12,
        hp: 44,
        atk: 12,
        speed: 1.8,
        pounce: true,
        guard: true,
        commonDrop: { kind: "material", name: "魔像石", color: "#b7c0ca", chance: 0.78 },
        rareDrop: { kind: "gear", name: "黑铁戒指", color: "#726c82", chance: 0.07 }
      },
      demonKnight: {
        name: "魔城骑士",
        kind: "monster",
        faction: "monster",
        color: "#eb5f73",
        r: 12,
        hp: 58,
        atk: 15,
        speed: 2.05,
        pounce: true,
        ranged: true,
        commonDrop: { kind: "gold", name: "魔城军饷", color: "#f3c45b", chance: 0.85, value: 9 },
        rareDrop: { kind: "weapon", name: "黑曜枪", color: "#d9d4ff", chance: 0.08 }
      }
    },

    gearCatalog: {
      trainingSword: { slot: "weapon", name: "练习剑", type: "剑", atk: 7, def: 0, range: 1.45, cooldown: 0.58, stamina: 3.5, note: "均衡" },
      ironSword: { slot: "weapon", name: "石剑", type: "剑", atk: 11, def: 0, range: 1.5, cooldown: 0.6, stamina: 3.7, note: "稳定" },
      rustySword: { slot: "weapon", name: "锈蚀长剑", type: "剑", atk: 12, def: 0, range: 1.55, cooldown: 0.66, stamina: 4, note: "慢但可靠" },
      newSword: { slot: "weapon", name: "崭新长剑", type: "剑", atk: 16, def: 0, range: 1.62, cooldown: 0.56, stamina: 3.8, note: "锋利" },
      dodoSword: { slot: "weapon", name: "渡渡剑", type: "剑", atk: 12, def: 0, range: 1.55, cooldown: 0.66, stamina: 4.1, note: "锻造" },
      reconciliationSword: { slot: "weapon", name: "和解", type: "剑", atk: 17, def: 0, range: 1.7, cooldown: 0.85, stamina: 3.7, note: "锻造" },
      deepBlackSword: { slot: "weapon", name: "甚黑之剑", type: "剑", atk: 20, def: 0, range: 1.45, cooldown: 0.56, stamina: 4.4, note: "锻造" },
      demonfallSword: { slot: "weapon", name: "入魔", type: "剑", atk: 20, def: 0, range: 2, cooldown: 0.9, stamina: 4.6, note: "锻造" },
      fangDagger: { slot: "weapon", name: "狼牙短剑", type: "匕首", atk: 8, def: 0, range: 1.05, cooldown: 0.28, stamina: 2, note: "高速短距" },
      fineDagger: { slot: "weapon", name: "精短剑", type: "匕首", atk: 10, def: 0, range: 1.1, cooldown: 0.28, stamina: 2, note: "锻造" },
      bloodDagger: { slot: "weapon", name: "染血短剑", type: "匕首", atk: 12, def: 0, range: 1.1, cooldown: 0.35, stamina: 2.2, note: "锻造" },
      demonSleeveBlade: { slot: "weapon", name: "魔王袖剑", type: "匕首", atk: 15, def: 0, range: 1.35, cooldown: 0.32, stamina: 2.5, note: "锻造" },
      shortBow: { slot: "weapon", name: "短木弓", type: "弓", atk: 9, def: 0, range: 10.5, cooldown: 0.72, stamina: 3.2, note: "蓄力远程" },
      hardwoodBow: { slot: "weapon", name: "硬木弓", type: "弓", atk: 11, def: 0, range: 11.5, cooldown: 0.72, stamina: 3.3, note: "锻造" },
      silverleafBow: { slot: "weapon", name: "银叶弓", type: "弓", atk: 12, def: 0, range: 15, cooldown: 0.72, stamina: 3.5, note: "锻造" },
      frostwindBow: { slot: "weapon", name: "破风寒弓", type: "弓", atk: 17, def: 0, range: 6.5, cooldown: 0.72, stamina: 4, note: "锻造" },
      acrossGenerations: { slot: "weapon", name: "跨越世代", type: "弓", atk: 17, def: 2, range: 16.5, cooldown: 0.6, stamina: 5, note: "锻造" },
      trainingSpear: { slot: "weapon", name: "练习长枪", type: "长枪", atk: 7, def: 0, range: 2, cooldown: 0.75, stamina: 4, note: "锻造" },
      guardSpear: { slot: "weapon", name: "卫兵长枪", type: "长枪", atk: 11, def: 0, range: 2.15, cooldown: 0.79, stamina: 4.5, note: "锻造" },
      angelBlade: { slot: "weapon", name: "天使之刃", type: "长枪", atk: 14, def: 0, range: 2.65, cooldown: 0.91, stamina: 4.2, note: "锻造" },
      screamSpear: { slot: "weapon", name: "尖啸", type: "长枪", atk: 17, def: 0, range: 2.45, cooldown: 0.73, stamina: 5, note: "锻造" },
      obsidianSpear: { slot: "weapon", name: "黑曜枪", type: "长枪", atk: 15, def: 0, range: 2.35, cooldown: 0.82, stamina: 4.8, note: "长距离" },
      oakHammer: { slot: "weapon", name: "橡木锤", type: "锤", atk: 15, def: 0, range: 1.3, cooldown: 0.96, stamina: 5.4, note: "高伤害" },
      warHammer: { slot: "weapon", name: "战锤", type: "锤", atk: 18, def: 0, range: 1.35, cooldown: 1.12, stamina: 6.2, note: "破防" },
      handOfAres: { slot: "weapon", name: "阿瑞斯之手", type: "锤", atk: 20, def: 0, range: 1.45, cooldown: 1.05, stamina: 7.1, note: "锻造" },
      beyondGenerations: { slot: "weapon", name: "超越世代", type: "锤", atk: 25, def: 2, range: 1.6, cooldown: 1.5, stamina: 6.5, note: "锻造" },
      conceptSword: { slot: "weapon", name: "剑的概念", type: "概念剑", atk: 21, def: 1, range: 1.85, cooldown: 0.42, stamina: 3.2, note: "唯一" },
      demonClaw: { slot: "weapon", name: "魔爪", type: "魔物", atk: 12, def: 0, range: 1.25, cooldown: 0.28, stamina: 2.8, note: "魔物化" },
      leatherCap: { slot: "head", name: "皮帽", atk: 0, def: 1, note: "轻便" },
      ironHelmet: { slot: "head", name: "铁盔", atk: 0, def: 3, note: "稳重" },
      clothTunic: { slot: "body", name: "布衣", atk: 0, def: 1, note: "普通" },
      chainMail: { slot: "body", name: "锁子甲", atk: 0, def: 5, note: "抗斩" },
      linenPants: { slot: "legs", name: "亚麻裤", atk: 0, def: 1, note: "普通" },
      ironGreaves: { slot: "legs", name: "铁护腿", atk: 0, def: 3, note: "抗冲击" },
      travelBoots: { slot: "feet", name: "旅靴", atk: 0, def: 1, note: "闪避冷却略降" },
      ironBoots: { slot: "feet", name: "铁靴", atk: 0, def: 2, note: "沉稳" },
      copperRing: { slot: "accessory", name: "铜戒指", atk: 1, def: 0, note: "小幅攻击" },
      blackIronRing: { slot: "accessory", name: "黑铁戒指", atk: 1, def: 2, note: "攻守兼备" },
      silverNecklace: { slot: "accessory", name: "银项链", atk: 0, def: 2, note: "防护" }
    },

    materialCatalog: {
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
    },

    resourceCatalog: {
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
    },

    weaponForgeCatalog: {
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
    },

    petCatalog: {
      wolfPup: { name: "幼狼狗", color: "#c8b49b", r: 8, maxHp: 24, atk: 4, speed: 2.7, roamRadius: 3.8, attackRange: 0.85, guardRange: 4.6, cooldown: 0.9 },
      heartTreant: { name: "心芽树灵", color: "#a8ffd1", r: 10, maxHp: 34, atk: 3, speed: 1.8, roamRadius: 3.4, attackRange: 0.95, guardRange: 4.2, cooldown: 1.15 }
    },

    magicCatalog: {
      fireball: { name: "火球术", aliases: ["火球术", "メラ", "fireball"], cost: 5, kind: "aoe", damage: 10, radius: 2.1, color: "#ff8a4c", chant: 0.55, effectDuration: 1.0, desc: "在指定位置爆开红色火球，对范围内敌对目标造成少量伤害。", clueLine: "有人含糊地提到火球术的形状，像把热意揉成一个字。" },
      leafCutter: { name: "草飞刀", aliases: ["飞叶快刀", "はっぱカッター", "leaf cutter"], cost: 4, kind: "single", damage: 14, radius: 0.95, color: "#7edb72", chant: 0.42, effectDuration: 0.5, desc: "在指定位置划过绿色菱形叶刃，对附近一个敌对目标造成伤害。", clueLine: "有人说叶片若记住风的走向，就能像刀一样飞出去。" },
      extremeHealing: { name: "甘霖", aliases: ["甘霖", "ベホマズン", "extreme healing"], cost: 10, kind: "heal", heal: 38, radius: 2.2, color: "#7adff2", chant: 0.65, effectDuration: 1.0, desc: "在指定位置寻找友方目标并大量回复生命；没有友方目标时回复自己。", clueLine: "有人讲起一种像雨一样落下的治愈祷词，名字近似甘霖。" },
      thunderFlash: { name: "劈出来一个雷霆大闪电", aliases: ["劈出来一个雷霆大闪电", "かみなり絶好調", "you fxxking scared me"], cost: 18, kind: "aoe", damage: 28, radius: 3.0, color: "#f5e86c", chant: 0.9, effectDuration: 2.0, desc: "在指定位置劈下大范围黄色雷霆，对范围内敌对目标造成大量伤害。", clueLine: "有人神神秘秘地说，雷霆也许只是在等一个足够离谱的命令。" },
      littleCold: { name: "有点冷", aliases: ["有点冷", "ちょっとおい…", "give me my coat..."], cost: 6, kind: "zone", damagePerSecond: 1, radius: 3.0, slowPower: 0.5, color: "#7ccfff", chant: 0.58, effectDuration: 5.0, desc: "在指定位置生成持续 5 秒的蓝色寒雾，减速范围内敌对目标并每秒造成极微量伤害。", clueLine: "有人打了个寒颤，说魔法有时不是火光，而是一句想把外套拿回来的抱怨。" }
    },

    questCatalog: {
      major: [
        { id: "major_wolf_hunt", name: "森林魔狼讨伐", type: "kill", species: "wolf", targetName: "小魔狼", count: 3, reward: { gold: [42, 60], potions: [1, 2], wood: [1, 3], stone: [1, 2] }, autoSettleDelay: 28 },
        { id: "major_demon_scout", name: "魔王城前庭侦察", type: "scout", scene: "demon", x: 48, y: 35, radius: 9, reward: { gold: [62, 90], potions: [1, 3], wood: [2, 4], stone: [2, 4] } }
      ],
      small: [
        { id: "small_rabbit_hunt", name: "捕猎野兔", type: "hunt", species: "rabbit", targetName: "野兔", count: 2, reward: { gold: [7, 13], affection: [10, 15], devotion: [3, 5] } },
        { id: "small_delivery", name: "送货", type: "delivery", reward: { gold: [6, 12], affection: [12, 16], devotion: [3, 6] }, autoSettleDelay: 22 }
      ]
    },

    graveDecayInterval: 120,
    graveMaxDecay: 4
};

export default DATA;
