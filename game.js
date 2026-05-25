(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const statsEl = document.getElementById("stats");
  const logEl = document.getElementById("log");
  const toastEl = document.getElementById("toast");
  const gearPanelEl = document.getElementById("gearPanel");
  const backpackEl = document.getElementById("backpackPanel");
  const questPanelEl = document.getElementById("questPanel");
  const shopPanelEl = document.getElementById("shopPanel");
  const forgePanelEl = document.getElementById("forgePanel");
  const magicPanelEl = document.getElementById("magicPanel");
  const mainMenuEl = document.getElementById("mainMenu");
  const pauseMenuEl = document.getElementById("pauseMenu");

  const W = canvas.width;
  const H = canvas.height;
  const tile = 32;
  const worldW = 96;
  const worldH = 72;
  const viewW = Math.floor(W / tile);
  const viewH = Math.floor(H / tile);
  const magicChantTimeScale = 3.5;
  const raceStartPoints = {
    "人类": { scene: "field", x: 11.5, y: 10.5 },
    "精灵": { scene: "silverleaf", x: 18.5, y: 16.5 },
    "矮人": { scene: "stonegorge", x: 18.5, y: 18.5 }
  };
  const playableRaces = ["人类", "精灵", "矮人"];

  const keys = new Set();
  const logs = [];
  const data = window.OverfantasyData;
  if (!data) throw new Error("Missing OverfantasyData. Load src/data.js before game.js.");
  const { regions, colors, sceneNames, bestiary, gearCatalog, materialCatalog, resourceCatalog = {}, weaponForgeCatalog = {}, petCatalog, magicCatalog, questCatalog, graveDecayInterval, graveMaxDecay } = data;
  const gearNameToId = Object.fromEntries(Object.entries(gearCatalog).map(([id, gear]) => [gear.name, id]));
  const saveSchemaVersion = 2;
  const localPlayerId = "player:local";
  const localPartyId = "party:local";
  const worldOwnerId = "world";
  const removedMapWeaponPickupNames = new Set(["短木弓", "铁剑", "石剑", "橡木锤", "战锤", "剑的概念"]);
  const languageOptions = [
    { id: "zh", htmlLang: "zh-CN", label: "中文" },
    { id: "ja", htmlLang: "ja", label: "日本語" },
    { id: "en", htmlLang: "en", label: "English" }
  ];
  const uiText = {
    zh: {
      "document.title": "OVERFANTASY Prototype",
      "side.title": "Classic 2D Prototype",
      "legend.actor": "玩家/生物",
      "legend.building": "房屋/商店/设施",
      "legend.pickup": "药草/武器/道具",
      "action.talk": "交谈/使用",
      "action.attack": "攻击",
      "action.defend": "防御",
      "action.dodge": "闪避",
      "action.gift": "赠礼",
      "action.rest": "休息",
      "action.backpack": "背包",
      "action.magic": "魔法",
      "menu.new": "新游戏",
      "menu.continue": "继续游戏",
      "menu.load": "加载存档",
      "menu.help": "操作说明",
      "menu.language": "语言",
      "menu.back": "返回",
      "menu.start": "开始游戏",
      "menu.delete": "删除存档",
      "menu.confirmDelete": "确认删除",
      "menu.cancel": "取消",
      "menu.noSaves": "还没有存档。",
      "menu.load.title": "加载存档",
      "menu.help.title": "操作说明",
      "menu.help.text": "WASD/方向键移动，Shift 奔跑，空格闪避，左键攻击，右键防御，E 互动，B 背包，J 当前任务，F 打开魔法书，Esc 暂停。打开背包、任务、交易、锻造、魔法或暂停菜单时游戏时间停止。",
      "menu.race.title": "选择种族",
      "menu.race.note": "不同种族会从各自聚集地开始旅程。种族特性不会在状态栏中明示。",
      "menu.main.note": "新游戏会先选择种族，并创建新的当前存档槽，不会删除旧存档。",
      "menu.language.title": "语言",
      "menu.language.note": "选择界面语言。剧情、物品名和日志会逐步翻译。",
      "menu.currentLanguage": "当前语言",
      "pause.title": "暂停",
      "pause.text": "游戏已暂停。Esc 返回游戏。",
      "pause.save": "保存",
      "pause.main": "返回主界面",
      "panel.paused": "游戏暂停",
      "panel.closeEsc": "关闭 Esc",
      "race.人类": "人类",
      "race.精灵": "精灵",
      "race.矮人": "矮人",
      "stat.status": "状态",
      "stat.hp": "生命",
      "stat.mp": "魔力",
      "stat.stamina": "体力",
      "stat.attackDefense": "攻防",
      "stat.supplies": "物资",
      "stat.resources": "资源",
      "stat.materials": "素材",
      "stat.weapon": "武器",
      "stat.performance": "性能",
      "stat.cooldown": "冷却",
      "stat.area": "区域",
      "stat.action": "动作",
      "stat.pet": "宠物",
      "stat.quest": "任务",
      "stat.relation": "关系",
      "status.monster": "魔物势力",
      "status.pathos": "悲怆",
      "status.running": "奔跑中",
      "status.blocking": "防御中",
      "status.ready": "可行动",
      "status.dodge": "闪避",
      "status.none": "无",
      "unit.attack": "攻",
      "unit.defense": "防",
      "unit.range": "距",
      "unit.attackCooldown": "攻击间隔",
      "unit.attackShort": "攻击",
      "unit.dodgeShort": "闪避",
      "unit.trust": "信",
      "unit.hate": "仇",
      "unit.injured": "重伤"
    },
    ja: {
      "document.title": "OVERFANTASY Prototype",
      "side.title": "クラシック2Dプロトタイプ",
      "legend.actor": "プレイヤー/生物",
      "legend.building": "家/店/施設",
      "legend.pickup": "薬草/武器/道具",
      "action.talk": "会話/使用",
      "action.attack": "攻撃",
      "action.defend": "防御",
      "action.dodge": "回避",
      "action.gift": "贈り物",
      "action.rest": "休む",
      "action.backpack": "バッグ",
      "action.magic": "魔法",
      "menu.new": "新しいゲーム",
      "menu.continue": "続きから",
      "menu.load": "セーブをロード",
      "menu.help": "操作説明",
      "menu.language": "言語",
      "menu.back": "戻る",
      "menu.start": "開始",
      "menu.delete": "セーブ削除",
      "menu.confirmDelete": "削除する",
      "menu.cancel": "キャンセル",
      "menu.noSaves": "セーブデータはありません。",
      "menu.load.title": "セーブをロード",
      "menu.help.title": "操作説明",
      "menu.help.text": "WASD/方向キーで移動、Shiftで走る、Spaceで回避、左クリックで攻撃、右クリックで防御、Eで調べる、Bでバッグ、Jでクエスト、Fで魔法書、Escで一時停止。バッグ、クエスト、取引、鍛造、魔法、一時停止メニューを開いている間はゲーム時間が止まります。",
      "menu.race.title": "種族を選択",
      "menu.race.note": "種族ごとの集落から旅が始まります。種族特性はステータス欄には表示されません。",
      "menu.main.note": "新しいゲームでは先に種族を選び、新しい現在のセーブ枠を作成します。既存のセーブは削除されません。",
      "menu.language.title": "言語",
      "menu.language.note": "画面表示の言語を選びます。物語、アイテム名、ログは今後少しずつ翻訳します。",
      "menu.currentLanguage": "現在の言語",
      "pause.title": "一時停止",
      "pause.text": "ゲームは一時停止中です。Escで戻ります。",
      "pause.save": "保存",
      "pause.main": "メインメニューへ",
      "panel.paused": "一時停止中",
      "panel.closeEsc": "閉じる Esc",
      "race.人类": "人間",
      "race.精灵": "エルフ",
      "race.矮人": "ドワーフ",
      "stat.status": "状態",
      "stat.hp": "HP",
      "stat.mp": "MP",
      "stat.stamina": "スタミナ",
      "stat.attackDefense": "攻防",
      "stat.supplies": "物資",
      "stat.resources": "資源",
      "stat.materials": "素材",
      "stat.weapon": "武器",
      "stat.performance": "性能",
      "stat.cooldown": "クールダウン",
      "stat.area": "地域",
      "stat.action": "行動",
      "stat.pet": "ペット",
      "stat.quest": "クエスト",
      "stat.relation": "関係",
      "status.monster": "魔物勢力",
      "status.pathos": "悲愴",
      "status.running": "走行中",
      "status.blocking": "防御中",
      "status.ready": "行動可能",
      "status.dodge": "回避",
      "status.none": "なし",
      "unit.attack": "攻",
      "unit.defense": "防",
      "unit.range": "距離",
      "unit.attackCooldown": "攻撃間隔",
      "unit.attackShort": "攻撃",
      "unit.dodgeShort": "回避",
      "unit.trust": "信頼",
      "unit.hate": "憎悪",
      "unit.injured": "重傷"
    },
    en: {
      "document.title": "OVERFANTASY Prototype",
      "side.title": "Classic 2D Prototype",
      "legend.actor": "Player/Creatures",
      "legend.building": "Homes/Shops/Facilities",
      "legend.pickup": "Herbs/Weapons/Items",
      "action.talk": "Talk/Use",
      "action.attack": "Attack",
      "action.defend": "Defend",
      "action.dodge": "Dodge",
      "action.gift": "Gift",
      "action.rest": "Rest",
      "action.backpack": "Backpack",
      "action.magic": "Magic",
      "menu.new": "New Game",
      "menu.continue": "Continue",
      "menu.load": "Load Save",
      "menu.help": "Controls",
      "menu.language": "Language",
      "menu.back": "Back",
      "menu.start": "Start",
      "menu.delete": "Delete Save",
      "menu.confirmDelete": "Confirm Delete",
      "menu.cancel": "Cancel",
      "menu.noSaves": "No saves yet.",
      "menu.load.title": "Load Save",
      "menu.help.title": "Controls",
      "menu.help.text": "Move with WASD/arrow keys, run with Shift, dodge with Space, attack with left mouse, defend with right mouse, interact with E, open backpack with B, quests with J, spellbook with F, and pause with Esc. Time stops while backpack, quests, trade, forging, magic, or pause menus are open.",
      "menu.race.title": "Choose Race",
      "menu.race.note": "Each race starts from its own homeland. Race traits are hidden from the status panel.",
      "menu.main.note": "New Game lets you choose a race first and creates a new current save slot without deleting old saves.",
      "menu.language.title": "Language",
      "menu.language.note": "Choose the interface language. Story text, item names, and logs will be translated gradually.",
      "menu.currentLanguage": "Current Language",
      "pause.title": "Paused",
      "pause.text": "The game is paused. Press Esc to return.",
      "pause.save": "Save",
      "pause.main": "Main Menu",
      "panel.paused": "Paused",
      "panel.closeEsc": "Close Esc",
      "race.人类": "Human",
      "race.精灵": "Elf",
      "race.矮人": "Dwarf",
      "stat.status": "Status",
      "stat.hp": "HP",
      "stat.mp": "MP",
      "stat.stamina": "Stamina",
      "stat.attackDefense": "Atk/Def",
      "stat.supplies": "Supplies",
      "stat.resources": "Resources",
      "stat.materials": "Materials",
      "stat.weapon": "Weapon",
      "stat.performance": "Stats",
      "stat.cooldown": "Cooldown",
      "stat.area": "Area",
      "stat.action": "Action",
      "stat.pet": "Pet",
      "stat.quest": "Quest",
      "stat.relation": "Relation",
      "status.monster": "Monster Side",
      "status.pathos": "Pathos",
      "status.running": "Running",
      "status.blocking": "Blocking",
      "status.ready": "Ready",
      "status.dodge": "Dodge",
      "status.none": "None",
      "unit.attack": "ATK",
      "unit.defense": "DEF",
      "unit.range": "Range",
      "unit.attackCooldown": "Attack CD",
      "unit.attackShort": "Atk",
      "unit.dodgeShort": "Dodge",
      "unit.trust": "Trust",
      "unit.hate": "Hate",
      "unit.injured": "Injured"
    }
  };
  const backpackCategories = [
    ["consumables", "消耗品"],
    ["materials", "素材"],
    ["loot", "战利品"],
    ["equipment", "装备"],
    ["important", "重要物品"]
  ];
  let backpackOpen = false;
  let backpackCategory = "consumables";
  let backpackSelected = null;
  let lastBackpackHtml = "";
  let questOpen = false;
  let questMode = "guild";
  let questNpcName = null;
  let lastQuestHtml = "";
  let shopOpen = false;
  let shopTab = "buy";
  let lastShopHtml = "";
  let forgeOpen = false;
  let forgeTab = "ring";
  let forgeSelectedMaterial = null;
  let forgeWeaponCategory = "剑";
  let forgeSelectedWeapon = null;
  let lastForgeHtml = "";
  let magicOpen = false;
  let magicMode = "book";
  let magicPanelTitle = "魔法";
  let magicInput = "";
  let lastMagicHtml = "";
  const saveStorageKey = "overfantasy.saves.v1";
  const languageStorageKey = "overfantasy.language.v1";
  let appMode = "menu";
  let currentSaveId = null;
  let selectedSaveId = null;
  let pendingDeleteSaveId = null;
  let menuView = "main";
  let lastMenuHtml = "";
  let lastPauseHtml = "";
  let memorySaveSlots = [];
  let aimVector = { x: 1, y: 0 };
  let aimWorld = null;
  let attackEffect = null;
  const magicEffects = [];
  const flyingArrows = [];
  let bowCharge = null;
  let pendingMagicCast = null;
  let hitStopTimer = 0;
  const hitReactions = new WeakMap();
  const hitReactionEntities = new Set();

  // Runtime state
  const state = {
    schemaVersion: saveSchemaVersion,
    session: defaultSessionState(),
    settings: { language: readLanguageSetting() },
    mode: "world",
    scene: "field",
    time: 0,
    dayClock: 0,
    newsClock: 0,
    spawnClock: 8,
    toastTimer: 0,
    player: {
      id: localPlayerId,
      ownerId: localPlayerId,
      partyId: localPartyId,
      control: "local",
      actorType: "player",
      x: 11.5,
      y: 10.5,
      r: 11,
      hp: 42,
      maxHp: 42,
      mp: 18,
      maxMp: 18,
      stamina: 30,
      gold: 16,
      herbs: 1,
      potions: 0,
      arrows: 0,
      rings: 0,
      wood: 0,
      stone: 0,
      resources: {},
      atk: 7,
      def: 0,
      race: "人类",
      job: "剑士",
      weapon: "练习剑",
      gear: {
        weapon: "trainingSword",
        head: null,
        body: "clothTunic",
        legs: "linenPants",
        feet: null,
        accessory: null
      },
      gearBag: ["trainingSword", "clothTunic", "linenPants"],
      gearMods: {},
      materials: {},
      magicKnown: [],
      magicClues: {},
      mpRegenLock: 0,
      monsterForm: false,
      spouse: null,
      conceptSword: false,
      lastHitBy: null,
      invuln: 0,
      attackCooldown: 0,
      giftCooldown: 0,
      dodgeCooldown: 0,
      dodgeTimer: 0,
      blockTimer: 0,
      running: false
    },
    map: [],
    solids: [],
    entities: [],
    pets: [],
    petRemains: [],
    quests: { major: null, small: [] },
    npcMemory: {},
    npcMemoryByPlayer: { [localPlayerId]: {} },
    objects: [],
    pickups: [],
    dungeon: null
  };
  const initialState = clonePlain(state);
  const initialRegions = clonePlain(regions);

  // Shared utilities
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function formatNumber(value, digits = 1) {
    const n = Number(value || 0);
    return n.toFixed(digits).replace(/\.0$/, "");
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function choice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function normalize(dx, dy, fallback = aimVector) {
    const len = Math.hypot(dx, dy);
    if (len < 0.0001) return { x: fallback.x, y: fallback.y };
    return { x: dx / len, y: dy / len };
  }

  function angleBetween(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
  }

  function playerAimAngle() {
    return Math.atan2(aimVector.y, aimVector.x);
  }

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function replaceObject(target, source) {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, clonePlain(source));
  }

  function isValidLanguage(value) {
    return languageOptions.some(option => option.id === value);
  }

  function readLanguageSetting() {
    try {
      const stored = window.localStorage?.getItem(languageStorageKey);
      return isValidLanguage(stored) ? stored : "zh";
    } catch {
      return "zh";
    }
  }

  function writeLanguageSetting(language) {
    try {
      if (window.localStorage) window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // localStorage can be unavailable in some browser privacy modes.
    }
  }

  function currentLanguage() {
    return isValidLanguage(state.settings?.language) ? state.settings.language : "zh";
  }

  function t(key) {
    const lang = currentLanguage();
    return uiText[lang]?.[key] ?? uiText.zh[key] ?? key;
  }

  function raceLabel(race) {
    return t(`race.${race}`);
  }

  function applyLanguage() {
    const option = languageOptions.find(item => item.id === currentLanguage()) || languageOptions[0];
    document.documentElement.lang = option.htmlLang;
    document.title = t("document.title");
    const titleEl = document.querySelector(".panel header h1");
    if (titleEl) titleEl.textContent = t("side.title");
    const legendRows = document.querySelectorAll(".legend div");
    if (legendRows[0]) legendRows[0].innerHTML = `<span class="dot player"></span>${t("legend.actor")}`;
    if (legendRows[1]) legendRows[1].innerHTML = `<span class="square"></span>${t("legend.building")}`;
    if (legendRows[2]) legendRows[2].innerHTML = `<span class="tri"></span>${t("legend.pickup")}`;
    const buttonLabels = {
      btnTalk: "action.talk",
      btnAttack: "action.attack",
      btnDefend: "action.defend",
      btnDodge: "action.dodge",
      btnGift: "action.gift",
      btnRest: "action.rest",
      btnBackpack: "action.backpack",
      btnMagic: "action.magic"
    };
    for (const [id, key] of Object.entries(buttonLabels)) {
      const button = document.getElementById(id);
      if (button) button.textContent = t(key);
    }
  }

  function clearLanguageRenderCaches() {
    lastMenuHtml = "";
    lastPauseHtml = "";
    lastBackpackHtml = "";
    lastQuestHtml = "";
    lastShopHtml = "";
    lastForgeHtml = "";
    lastMagicHtml = "";
    lastGearHtml = "";
  }

  function setLanguage(language) {
    if (!isValidLanguage(language)) return;
    if (!state.settings || typeof state.settings !== "object") state.settings = {};
    state.settings.language = language;
    writeLanguageSetting(language);
    applyLanguage();
    clearLanguageRenderCaches();
    renderStats();
    renderGearPanel();
  }

  function defaultSessionState() {
    return {
      schemaVersion: saveSchemaVersion,
      playMode: "single",
      localPlayerId,
      hostPlayerId: localPlayerId,
      partyId: localPartyId,
      players: {
        [localPlayerId]: {
          id: localPlayerId,
          name: "本地玩家",
          partyId: localPartyId,
          control: "local",
          connected: true
        }
      }
    };
  }

  function makeRuntimeId(prefix = "id") {
    const safePrefix = String(prefix).replace(/[^a-zA-Z0-9:_-]/g, "_");
    return `${safePrefix}:${Date.now().toString(36)}:${Math.floor(Math.random() * 0xffffff).toString(36)}`;
  }

  function ensureSessionState() {
    if (!state.session || typeof state.session !== "object") state.session = defaultSessionState();
    const defaults = defaultSessionState();
    for (const [key, value] of Object.entries(defaults)) {
      if (state.session[key] === undefined) state.session[key] = clonePlain(value);
    }
    if (!state.session.players || typeof state.session.players !== "object") state.session.players = {};
    if (!state.session.localPlayerId) state.session.localPlayerId = state.player?.id || localPlayerId;
    if (!state.session.partyId) state.session.partyId = state.player?.partyId || localPartyId;
    if (!state.session.players[state.session.localPlayerId]) {
      state.session.players[state.session.localPlayerId] = {
        id: state.session.localPlayerId,
        name: "本地玩家",
        partyId: state.session.partyId,
        control: "local",
        connected: true
      };
    }
    if (!state.schemaVersion || state.schemaVersion < saveSchemaVersion) state.schemaVersion = saveSchemaVersion;
  }

  function currentPlayerId() {
    return state.session?.localPlayerId || state.player?.id || localPlayerId;
  }

  function currentPartyId() {
    return state.session?.partyId || state.player?.partyId || localPartyId;
  }

  function ownedByCurrentPlayer(record) {
    return !record?.ownerId || record.ownerId === currentPlayerId();
  }

  function questBelongsToCurrentPlayer(quest) {
    return !!quest && (!quest.ownerId || quest.ownerId === currentPlayerId());
  }

  function ensureOwnedRecord(record, fallbackOwnerId = currentPlayerId()) {
    if (!record) return record;
    if (!record.ownerId) record.ownerId = fallbackOwnerId;
    if (!record.partyId && fallbackOwnerId !== worldOwnerId) record.partyId = currentPartyId();
    return record;
  }

  function ensureQuestOwnership(quest) {
    if (!quest) return null;
    ensureOwnedRecord(quest, currentPlayerId());
    if (!quest.instanceId) quest.instanceId = makeRuntimeId(`quest:${quest.id || quest.type || "unknown"}`);
    return quest;
  }

  function ensureNpcMemoryOwnership() {
    if (!state.npcMemory || typeof state.npcMemory !== "object") state.npcMemory = {};
    if (!state.npcMemoryByPlayer || typeof state.npcMemoryByPlayer !== "object") state.npcMemoryByPlayer = {};
    const playerId = currentPlayerId();
    if (!state.npcMemoryByPlayer[playerId]) state.npcMemoryByPlayer[playerId] = {};
    for (const [npcName, memory] of Object.entries(state.npcMemory)) {
      if (!state.npcMemoryByPlayer[playerId][npcName]) state.npcMemoryByPlayer[playerId][npcName] = memory;
    }
    state.npcMemory = state.npcMemoryByPlayer[playerId];
  }

  function npcMemoryKey(npcOrName) {
    return typeof npcOrName === "string" ? npcOrName : (npcOrName?.relationId || npcOrName?.name || "");
  }

  function npcMemoryFor(npcOrName, playerId = currentPlayerId()) {
    ensureNpcMemoryOwnership();
    const key = npcMemoryKey(npcOrName);
    return key ? state.npcMemoryByPlayer[playerId]?.[key] || null : null;
  }

  function petsForCurrentPlayer() {
    return state.pets.filter(pet => ownedByCurrentPlayer(pet));
  }

  function ensureQuestState() {
    if (!state.quests) state.quests = { major: null, small: [] };
    if (!Array.isArray(state.quests.small)) state.quests.small = [];
    if (!state.npcMemory) state.npcMemory = {};
    ensureNpcMemoryOwnership();
    if (state.quests.major) ensureQuestOwnership(state.quests.major);
    for (const quest of state.quests.small) ensureQuestOwnership(quest);
  }

  function ensureStateShape() {
    if (!state.player) state.player = clonePlain(initialState.player);
    for (const [key, value] of Object.entries(initialState.player)) {
      if (state.player[key] === undefined) state.player[key] = clonePlain(value);
    }
    ensureSessionState();
    if (!state.settings || typeof state.settings !== "object") state.settings = { language: readLanguageSetting() };
    if (!isValidLanguage(state.settings.language)) state.settings.language = readLanguageSetting();
    state.player.id = currentPlayerId();
    state.player.ownerId = currentPlayerId();
    state.player.partyId = currentPartyId();
    state.player.control = state.player.control || "local";
    state.player.actorType = "player";
    if (!state.player.gear) state.player.gear = clonePlain(initialState.player.gear);
    for (const [slot, gearId] of Object.entries(initialState.player.gear)) {
      if (state.player.gear[slot] === undefined) state.player.gear[slot] = gearId;
    }
    if (!Array.isArray(state.player.gearBag)) state.player.gearBag = clonePlain(initialState.player.gearBag);
    for (const gearId of Object.values(state.player.gear)) {
      if (gearId && !state.player.gearBag.includes(gearId)) state.player.gearBag.push(gearId);
    }
    if (!state.player.gear.weapon) {
      state.player.gear.weapon = "trainingSword";
      if (!state.player.gearBag.includes("trainingSword")) state.player.gearBag.push("trainingSword");
    }
    if (!state.player.gearMods || typeof state.player.gearMods !== "object") state.player.gearMods = {};
    if (!state.player.materials || typeof state.player.materials !== "object") state.player.materials = {};
    const hadResources = state.player.resources && typeof state.player.resources === "object" && !Array.isArray(state.player.resources);
    if (!hadResources) state.player.resources = {};
    if (!hadResources) {
      if ((state.player.wood || 0) > 0) state.player.resources["木材"] = (state.player.resources["木材"] || 0) + state.player.wood;
      if ((state.player.stone || 0) > 0) state.player.resources["反重力石"] = (state.player.resources["反重力石"] || 0) + state.player.stone;
    }
    syncResourceTotals();
    if (!Array.isArray(state.player.magicKnown)) state.player.magicKnown = [];
    if (!state.player.magicClues || typeof state.player.magicClues !== "object") state.player.magicClues = {};
    if (!Array.isArray(state.map)) state.map = [];
    if (!Array.isArray(state.solids)) state.solids = [];
    if (!Array.isArray(state.entities)) state.entities = [];
    for (const entity of state.entities) {
      if (!entity.id) entity.id = makeRuntimeId(entity.species || entity.kind || "entity");
      if (!entity.ownerId) entity.ownerId = worldOwnerId;
      if ((entity.kind === "npc" || entity.kind === "friendly") && !entity.relationId) entity.relationId = entity.name;
    }
    if (!Array.isArray(state.objects)) state.objects = [];
    for (const object of state.objects) {
      if (!object.id) object.id = makeRuntimeId(`object:${object.kind || "unknown"}`);
      if (!object.ownerId) object.ownerId = worldOwnerId;
    }
    if (!Array.isArray(state.pickups)) state.pickups = [];
    for (const pickup of state.pickups) {
      if (!pickup.id) pickup.id = makeRuntimeId("pickup");
      if (!pickup.ownerId) pickup.ownerId = worldOwnerId;
      if (pickup.reservedFor === undefined) pickup.reservedFor = null;
      if (pickup.takenBy === undefined) pickup.takenBy = null;
    }
    state.pickups = state.pickups.filter(p => !isRemovedMapWeaponPickup(p));
    if (!Array.isArray(state.pets)) state.pets = [];
    for (const pet of state.pets) ensureOwnedRecord(pet, currentPlayerId());
    if (!Array.isArray(state.petRemains)) state.petRemains = [];
    for (const remain of state.petRemains) ensureOwnedRecord(remain, currentPlayerId());
    if (!state.scene) state.scene = "field";
    if (!state.mode) state.mode = "world";
    if (typeof state.time !== "number") state.time = 0;
    if (typeof state.dayClock !== "number") state.dayClock = 0;
    if (typeof state.newsClock !== "number") state.newsClock = 0;
    if (typeof state.spawnClock !== "number") state.spawnClock = 8;
    ensureQuestState();
  }

  function raceStartPoint(race = state.player?.race) {
    return raceStartPoints[race] || raceStartPoints["人类"];
  }

  function raceDamageMultiplier(kind, weapon = currentWeapon()) {
    const race = state.player?.race || "人类";
    if (kind === "magic") {
      if (race === "精灵") return 1.2;
      if (race === "矮人") return 0.8;
      return 1;
    }
    const type = weapon?.type || "";
    const isSword = type.includes("剑");
    const isDagger = type === "匕首";
    const isBow = kind === "bow" || type === "弓";
    const isMagic = kind === "magic";
    const isHammer = type === "锤";
    const isSpear = type.includes("枪");
    if (race === "精灵") {
      if (isBow || isMagic) return 1.2;
      if (isHammer || isSpear) return 0.8;
    }
    if (race === "矮人") {
      if (isHammer || isSpear) return 1.2;
      if (isBow || isMagic) return 0.8;
    }
    if (race === "人类" && (isSword || isDagger)) return 1.05;
    return 1;
  }

  function raceMoveSpeedMultiplier() {
    return state.player?.race === "矮人" ? 0.95 : 1;
  }

  function raceDefenseMultiplier() {
    return state.player?.race === "矮人" ? 1.1 : 1;
  }

  function raceStaminaRegenMultiplier() {
    return state.player?.race === "精灵" ? 1.2 : 1;
  }

  function applyRaceFinalAmount(amount, multiplier, min = 1) {
    return Math.max(min, Math.round(amount * multiplier));
  }

  function applyRaceInitialRegionRelations(race) {
    if (race === "精灵" && regions.stonegorge) {
      regions.stonegorge.trust = clamp(regions.stonegorge.trust - 20, 0, 100);
      regions.stonegorge.hate = clamp(regions.stonegorge.hate + 20, 0, 100);
    }
    if (race === "矮人" && regions.silverleaf) {
      regions.silverleaf.trust = clamp(regions.silverleaf.trust - 20, 0, 100);
      regions.silverleaf.hate = clamp(regions.silverleaf.hate + 20, 0, 100);
    }
  }

  function applyRaceStartingLoadout(race) {
    const nonWeaponGear = state.player.gearBag.filter(id => gearCatalog[id]?.slot !== "weapon");
    if (race === "精灵") {
      state.player.gear.weapon = "shortBow";
      state.player.gearBag = [...new Set(["shortBow", "trainingSword", ...nonWeaponGear])];
      state.player.arrows = 5;
      return;
    }
    if (race === "矮人") {
      state.player.gear.weapon = "oakHammer";
      state.player.gearBag = [...new Set(["oakHammer", ...nonWeaponGear])];
      state.player.arrows = 0;
      return;
    }
    state.player.gear.weapon = "trainingSword";
  }

  function hostileRaceDialogue(npc) {
    const race = state.player?.race;
    return (race === "精灵" && npc?.faction === "dwarf") || (race === "矮人" && npc?.faction === "elf");
  }

  // Equipment and derived combat stats
  function currentWeapon() {
    if (state.player.monsterForm) return gearCatalog.demonClaw;
    const base = gearCatalog[state.player.gear.weapon] || gearCatalog.trainingSword;
    const mods = gearModList(state.player.gear.weapon);
    const cooldownMult = mods.reduce((mult, mod) => mult * (mod.cooldownMult || 1), 1);
    return { ...base, cooldown: Math.max(0.08, base.cooldown * cooldownMult) };
  }

  function equippedGear() {
    return Object.values(state.player.gear)
      .filter(Boolean)
      .map(id => gearCatalog[id])
      .filter(Boolean);
  }

  function gearModList(gearId) {
    return state.player.gearMods[gearId] || [];
  }

  function equippedModList() {
    return Object.values(state.player.gear)
      .filter(Boolean)
      .flatMap(id => gearModList(id));
  }

  function totalAtk() {
    if (state.player.monsterForm) return gearCatalog.demonClaw.atk;
    const gearAtk = equippedGear().reduce((sum, gear) => sum + (gear.atk || 0), 0);
    const modAtk = equippedModList().reduce((sum, mod) => sum + (mod.atk || 0), 0);
    return gearAtk + modAtk;
  }

  function totalDef() {
    const gearDef = equippedGear().reduce((sum, gear) => sum + (gear.def || 0), 0);
    const modDef = equippedModList().reduce((sum, mod) => sum + (mod.def || 0), 0);
    return gearDef + modDef;
  }

  function hasPathosEffect() {
    return petsForCurrentPlayer().some(pet => pet.injured && !pet.lost);
  }

  function refreshCombatStats() {
    const weapon = currentWeapon();
    const atk = totalAtk();
    const def = totalDef();
    if (hasPathosEffect()) {
      state.player.atk = Math.max(1, Math.ceil(atk * 0.01));
      state.player.def = Math.ceil(def * 1.5);
    } else {
      state.player.atk = atk;
      state.player.def = def;
    }
    state.player.weapon = weapon.name;
  }

  function gearLabel(id) {
    const gear = gearCatalog[id];
    if (!gear) return "";
    const mods = gearModList(id).map(mod => mod.label).join(",");
    const modText = mods ? ` [${mods}]` : "";
    if (gear.slot === "weapon") return `${gear.name} ${gear.type} 攻${gear.atk} 距${gear.range} 速${gear.cooldown.toFixed(2)} ${gear.note}${modText}`;
    return `${gear.name} ${slotName(gear.slot)} 攻${gear.atk || 0} 防${gear.def || 0} ${gear.note}${modText}`;
  }

  function slotName(slot) {
    return {
      weapon: "武器",
      head: "头",
      body: "衣服",
      legs: "裤子",
      feet: "鞋",
      accessory: "饰品"
    }[slot] || slot;
  }

  // Messaging
  function log(text) {
    logs.unshift(text);
    logs.splice(14);
    logEl.innerHTML = logs.map(line => `<p>${line}</p>`).join("");
    toast(text);
  }

  function toast(text) {
    toastEl.textContent = text;
    state.toastTimer = 4.2;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  // Save data
  function readSaveSlots() {
    try {
      if (!window.localStorage) return memorySaveSlots;
      const saves = JSON.parse(window.localStorage.getItem(saveStorageKey) || "[]");
      return Array.isArray(saves) ? saves : [];
    } catch {
      return memorySaveSlots;
    }
  }

  function writeSaveSlots(saves) {
    memorySaveSlots = saves;
    try {
      if (window.localStorage) window.localStorage.setItem(saveStorageKey, JSON.stringify(saves));
    } catch {
      memorySaveSlots = saves;
    }
  }

  function saveMeta(snapshot) {
    const p = snapshot.player || state.player;
    return {
      scene: snapshot.mode === "dungeon" ? "排列迷宫" : (sceneNames[snapshot.scene] || snapshot.scene || "未知"),
      hp: `${Math.max(0, Math.floor(p.hp))}/${p.maxHp}`,
      gold: p.gold || 0,
      time: Number(snapshot.time || 0)
    };
  }

  function formatGameTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    if (currentLanguage() === "ja") return `${min}分${String(sec).padStart(2, "0")}秒`;
    if (currentLanguage() === "en") return `${min}m ${String(sec).padStart(2, "0")}s`;
    return `${min}分${String(sec).padStart(2, "0")}秒`;
  }

  function formatSaveTime(value) {
    const locale = currentLanguage() === "ja" ? "ja-JP" : (currentLanguage() === "en" ? "en-US" : "zh-CN");
    return new Date(value).toLocaleString(locale, { hour12: false });
  }

  function makeSaveId() {
    return `save-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function saveCurrentGame(announce = false) {
    if (!currentSaveId) currentSaveId = makeSaveId();
    const saves = readSaveSlots();
    const existing = saves.find(save => save.id === currentSaveId);
    const snapshot = clonePlain(state);
    const record = {
      id: currentSaveId,
      schemaVersion: saveSchemaVersion,
      playMode: state.session?.playMode || "single",
      name: existing?.name || `存档 ${saves.length + 1}`,
      savedAt: new Date().toISOString(),
      state: snapshot,
      regions: clonePlain(regions),
      meta: saveMeta(snapshot)
    };
    const next = existing
      ? saves.map(save => save.id === currentSaveId ? record : save)
      : [...saves, record];
    writeSaveSlots(next);
    lastMenuHtml = "";
    if (announce) log("游戏已保存。");
    return record;
  }

  function autoSave() {
    if (currentSaveId && appMode === "playing") saveCurrentGame(false);
  }

  function resetRuntimeUi() {
    keys.clear();
    backpackOpen = false;
    backpackEl.classList.add("hidden");
    questOpen = false;
    questPanelEl.classList.add("hidden");
    shopOpen = false;
    shopPanelEl.classList.add("hidden");
    forgeOpen = false;
    forgePanelEl.classList.add("hidden");
    magicOpen = false;
    magicPanelEl.classList.add("hidden");
    pauseMenuEl.classList.add("hidden");
    mainMenuEl.classList.add("hidden");
    lastBackpackHtml = "";
    lastQuestHtml = "";
    lastShopHtml = "";
    lastForgeHtml = "";
    lastMagicHtml = "";
    lastPauseHtml = "";
    lastGearHtml = "";
    bowCharge = null;
    flyingArrows.length = 0;
    magicPanelTitle = "魔法";
    pendingMagicCast = null;
    magicEffects.length = 0;
  }

  function resetGameState(race = "人类") {
    const language = currentLanguage();
    replaceObject(state, initialState);
    replaceObject(regions, initialRegions);
    state.settings.language = language;
    state.player.race = playableRaces.includes(race) ? race : "人类";
    applyRaceStartingLoadout(state.player.race);
    applyRaceInitialRegionRelations(state.player.race);
    logs.length = 0;
    logEl.innerHTML = "";
    toastEl.textContent = "";
    resetRuntimeUi();
    const start = raceStartPoint(state.player.race);
    makeMap(start.scene);
    spawnWorld(start.scene);
    state.player.x = start.x;
    state.player.y = start.y;
    refreshCombatStats();
    renderGearPanel();
    applyLanguage();
  }

  function startNewGame(race = "人类") {
    resetGameState(race);
    currentSaveId = makeSaveId();
    appMode = "playing";
    saveCurrentGame(false);
    log(`${state.player.race}角色的新游戏开始。当前存档槽已创建。`);
  }

  function startLoadedSave(saveId) {
    const save = readSaveSlots().find(item => item.id === saveId);
    if (!save) return;
    const language = currentLanguage();
    replaceObject(state, save.state || initialState);
    replaceObject(regions, save.regions || initialRegions);
    ensureStateShape();
    state.settings.language = language;
    currentSaveId = save.id;
    logs.length = 0;
    logEl.innerHTML = "";
    resetRuntimeUi();
    appMode = "playing";
    applyLanguage();
    refreshCombatStats();
    renderGearPanel();
    log(`读取了${save.name}。`);
  }

  function continueLatestSave() {
    const latest = readSaveSlots().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0];
    if (latest) startLoadedSave(latest.id);
  }

  function deleteSaveSlot(saveId) {
    const saves = readSaveSlots().filter(save => save.id !== saveId);
    writeSaveSlots(saves);
    if (selectedSaveId === saveId) selectedSaveId = null;
    if (pendingDeleteSaveId === saveId) pendingDeleteSaveId = null;
    if (currentSaveId === saveId) currentSaveId = null;
    lastMenuHtml = "";
    renderMainMenu();
  }

  // Map helpers
  function regionAt(x, y) {
    if (state.mode === "dungeon") return regions.ruins;
    if (state.scene === "forest") return y > 46 || x > 63 ? regions.swamp : regions.forest;
    if (state.scene === "ruins") return x > 58 || y > 42 ? regions.mountain : regions.ruins;
    if (state.scene === "demon") return regions.demon;
    if (state.scene === "silverleaf") return regions.silverleaf;
    if (state.scene === "peakless") return regions.peakless;
    if (state.scene === "stonegorge") return regions.stonegorge;
    if (state.scene === "hatepit") return regions.hatepit;
    if (x < 27 && y < 25) return regions.village;
    if (x >= 28 && x < 61 && y < 37) return regions.forest;
    if (x >= 58 && y >= 38) return regions.ruins;
    return regions.field;
  }

  function mapBounds() {
    if (state.mode === "dungeon" && state.dungeon) return { w: state.dungeon.w, h: state.dungeon.h };
    return { w: worldW, h: worldH };
  }

  function cameraOrigin() {
    const bounds = mapBounds();
    return {
      x: clamp(state.player.x - viewW / 2, 0, Math.max(0, bounds.w - viewW)),
      y: clamp(state.player.y - viewH / 2, 0, Math.max(0, bounds.h - viewH))
    };
  }

  function updateAimFromEvent(event) {
    if (!event || typeof event.clientX !== "number" || typeof event.clientY !== "number") return false;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const cam = cameraOrigin();
    const screenX = (event.clientX - rect.left) * (W / rect.width);
    const screenY = (event.clientY - rect.top) * (H / rect.height);
    const worldX = cam.x + screenX / tile;
    const worldY = cam.y + screenY / tile;
    aimVector = normalize(worldX - state.player.x, worldY - state.player.y);
    aimWorld = { x: worldX, y: worldY };
    return true;
  }

  function tileAt(x, y) {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const bounds = mapBounds();
    if (tx < 0 || ty < 0 || tx >= bounds.w || ty >= bounds.h) return "wall";
    return state.map[ty]?.[tx] || "wall";
  }

  function isSolid(x, y) {
    const t = tileAt(x, y);
    if (t === "water" || t === "wall") return true;
    return state.solids.some(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  }

  function circleHitsRect(x, y, radius, rect) {
    const closestX = clamp(x, rect.x, rect.x + rect.w);
    const closestY = clamp(y, rect.y, rect.y + rect.h);
    return Math.hypot(x - closestX, y - closestY) < radius;
  }

  function actorBlockedAt(actor, x, y) {
    const radius = (actor.r || 10) / tile;
    const probes = [
      [x, y],
      [x - radius, y],
      [x + radius, y],
      [x, y - radius],
      [x, y + radius],
      [x - radius * 0.72, y - radius * 0.72],
      [x + radius * 0.72, y - radius * 0.72],
      [x - radius * 0.72, y + radius * 0.72],
      [x + radius * 0.72, y + radius * 0.72]
    ];
    if (probes.some(([px, py]) => {
      const t = tileAt(px, py);
      return t === "water" || t === "wall";
    })) return true;
    return state.solids.some(rect => circleHitsRect(x, y, radius, rect));
  }

  function moveActor(actor, dx, dy, speed, dt) {
    const nx = actor.x + dx * speed * dt;
    const ny = actor.y + dy * speed * dt;
    const bounds = mapBounds();
    if (!actorBlockedAt(actor, nx, actor.y)) actor.x = nx;
    if (!actorBlockedAt(actor, actor.x, ny)) actor.y = ny;
    actor.x = clamp(actor.x, 0.5, bounds.w - 0.5);
    actor.y = clamp(actor.y, 0.5, bounds.h - 0.5);
  }

  // World construction
  function makeMap(scene = "field") {
    state.map = [];
    state.mode = "world";
    state.scene = scene;
    state.dungeon = null;
    for (let y = 0; y < worldH; y += 1) {
      const row = [];
      for (let x = 0; x < worldW; x += 1) {
        let t = "grass";
        if (scene === "field") {
          if (x < 27 && y < 25) t = "village";
          if (x >= 28 && x < 61 && y < 37) t = "forest";
          if (x >= 58 && y >= 38) t = "ruins";
          if ((x === 27 && y < 58) || (y === 26 && x < 78) || (y === 56 && x > 18 && x < 88)) t = "road";
        } else if (scene === "forest") {
          t = "forest";
          if ((x + y) % 13 === 0) t = "grass";
          if (x > 62 || y > 46) t = "swamp";
          if (x > 70 && y > 52) t = "water";
          if ((x === 47 && y > 5 && y < 66) || (y === 34 && x > 6 && x < 86)) t = "road";
        } else if (scene === "ruins") {
          t = "ruins";
          if (x < 22 && y < 22) t = "grass";
          if (x > 62 || y > 46) t = "mountain";
          if ((x === 45 && y > 7 && y < 64) || (y === 35 && x > 10 && x < 86)) t = "road";
        } else if (scene === "silverleaf") {
          t = "silverleaf";
          if ((x + y * 2) % 17 === 0) t = "paleGrove";
          if (x > 8 && x < 39 && y > 8 && y < 31) t = "paleGrove";
          if ((x === 48 && y > 5 && y < 68) || (y === 58 && x > 11 && x < 84) || (y === 18 && x > 9 && x < 42)) t = "elvenRoad";
          if (x > 73 && y < 20) t = "forest";
        } else if (scene === "peakless") {
          t = "mountain";
          if ((x * 3 + y) % 19 === 0) t = "ore";
          if ((y === 35 && x > 4 && x < 91) || (x === 48 && y > 10 && y < 63)) t = "road";
          if ((y === 24 && x > 20 && x < 70 && !(x > 43 && x < 53)) || (y === 49 && x > 31 && x < 83 && !(x > 45 && x < 56))) t = "wall";
        } else if (scene === "stonegorge") {
          t = "mountain";
          if (x > 8 && x < 39 && y > 9 && y < 33) t = "ore";
          if ((x + y) % 11 === 0) t = "ore";
          if ((y === 35 && x > 5 && x < 91) || (x === 48 && y > 5 && y < 66) || (y === 20 && x > 9 && x < 42)) t = "road";
          if ((x === 64 && y > 12 && y < 55 && !(y > 31 && y < 39)) || (y === 51 && x > 18 && x < 65 && !(x > 43 && x < 53))) t = "wall";
        } else if (scene === "hatepit") {
          t = "chasm";
          if ((x + y * 3) % 13 === 0) t = "ore";
          if ((x === 48 && y > 8 && y < 68) || (y === 36 && x > 10 && x < 75)) t = "road";
          if ((x > 38 && x < 59 && y > 23 && y < 46) || (x > 70 && y < 24)) t = "seal";
          if ((y === 18 && x > 17 && x < 79 && !(x > 44 && x < 52)) || (x === 76 && y > 28 && y < 60)) t = "wall";
        } else if (scene === "demon") {
          t = "ash";
          if (x > 19 && x < 77 && y > 12 && y < 58) t = "castle";
          if ((x === 48 && y > 5 && y < 67) || (y === 35 && x > 8 && x < 88)) t = "road";
          if ((x > 29 && x < 35 && y > 24 && y < 47) || (x > 61 && x < 67 && y > 24 && y < 47)) t = "wall";
        }
        if (x < 2 || y < 2 || x > worldW - 3 || y > worldH - 3) t = scene === "demon" ? "wall" : "water";
        row.push(t);
      }
      state.map.push(row);
    }
  }

  function addObject(kind, name, x, y, w, h, color, action) {
    const obj = { id: makeRuntimeId(`object:${kind}`), ownerId: worldOwnerId, kind, name, x, y, w, h, color, action };
    state.objects.push(obj);
    if (action !== "exit" && kind !== "portal") state.solids.push(obj);
    return obj;
  }

  function addEntity(entity) {
    if (!entity.id) entity.id = makeRuntimeId(entity.species || entity.kind || "entity");
    if (!entity.ownerId) entity.ownerId = worldOwnerId;
    if ((entity.kind === "npc" || entity.kind === "friendly") && !entity.relationId) entity.relationId = entity.name;
    const memory = (entity.kind === "npc" || entity.kind === "friendly") ? npcMemoryFor(entity) : null;
    if (memory) {
      entity.affection = Math.max(entity.affection || 0, memory.affection || 0);
      entity.devotion = Math.max(entity.devotion || 0, memory.devotion || 0);
    }
    entity.cooldown = rand(0, 1);
    entity.specialClock = rand(1.2, 3.6);
    entity.alive = true;
    state.entities.push(entity);
    return entity;
  }

  function addPickup(kind, name, x, y, color, value = 1, options = {}) {
    state.pickups.push({
      id: options.id || makeRuntimeId("pickup"),
      ownerId: options.ownerId || worldOwnerId,
      reservedFor: options.reservedFor || null,
      sourceId: options.sourceId || null,
      kind,
      name,
      x,
      y,
      color,
      value,
      taken: false,
      takenBy: null
    });
  }

  function addPortal(name, x, y, targetScene, targetX, targetY, color = "#d6c16d") {
    return addObject("portal", name, x, y, 2, 2, color, `portal:${targetScene}:${targetX}:${targetY}`);
  }

  function makeCreature(species, x, y, overrides = {}) {
    const template = bestiary[species];
    const slimeGen = species === "slime" ? (overrides.slimeGen || 1) : undefined;
    const genScale = species === "slime" ? [1, 0.55, 0.28][slimeGen - 1] || 1 : 1;
    const entity = {
      ...template,
      species,
      x,
      y,
      maxHp: Math.max(3, Math.ceil((overrides.maxHp || template.hp) * genScale)),
      region: overrides.region || state.scene,
      ...overrides
    };
    if (species === "slime") {
      entity.slimeGen = slimeGen;
      entity.name = slimeGen === 1 ? template.name : (slimeGen === 2 ? "小灰史莱姆" : "微型灰史莱姆");
      entity.atk = Math.max(1, Math.ceil(template.atk * genScale));
      entity.r = Math.max(6, Math.ceil(template.r * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.8 : 0.62)));
      entity.speed = Math.max(0.8, template.speed * (slimeGen === 1 ? 1 : slimeGen === 2 ? 0.88 : 0.72));
      entity.split = slimeGen < 3;
    }
    entity.maxHp = overrides.maxHp || entity.maxHp;
    entity.hp = overrides.hp || entity.maxHp;
    return entity;
  }

  function spawnCreature(species, x, y, overrides = {}) {
    return addEntity(makeCreature(species, x, y, overrides));
  }

  function scatterPickups(list) {
    for (const p of list) addPickup(p.kind, p.name, p.x, p.y, p.color, p.value || 1);
  }

  function addMaterial(name, amount = 1) {
    state.player.materials[name] = (state.player.materials[name] || 0) + amount;
  }

  function resourceGroup(name) {
    return resourceCatalog[name]?.group || null;
  }

  function syncResourceTotals() {
    const resources = state.player.resources || {};
    let wood = 0;
    let stone = 0;
    for (const [name, count] of Object.entries(resources)) {
      const amount = Math.max(0, Number(count) || 0);
      if (resourceGroup(name) === "wood") wood += amount;
      if (resourceGroup(name) === "stone") stone += amount;
    }
    state.player.wood = wood;
    state.player.stone = stone;
  }

  function addResource(name, amount = 1) {
    if (!state.player.resources || typeof state.player.resources !== "object") state.player.resources = {};
    state.player.resources[name] = (state.player.resources[name] || 0) + amount;
    syncResourceTotals();
  }

  function resourceCount(name) {
    return state.player.resources?.[name] || 0;
  }

  function consumeResource(name, amount = 1) {
    if (resourceCount(name) < amount) return false;
    state.player.resources[name] -= amount;
    if (state.player.resources[name] <= 0) delete state.player.resources[name];
    syncResourceTotals();
    return true;
  }

  function consumeAnyResource(group, preferredName, amount = 1) {
    if (group === "wood" && (state.player.wood || 0) < amount) return false;
    if (group === "stone" && (state.player.stone || 0) < amount) return false;
    let remaining = amount;
    if (preferredName && resourceGroup(preferredName) === group) {
      const used = Math.min(resourceCount(preferredName), remaining);
      if (used > 0) {
        state.player.resources[preferredName] -= used;
        if (state.player.resources[preferredName] <= 0) delete state.player.resources[preferredName];
        remaining -= used;
      }
    }
    for (const name of Object.keys(state.player.resources || {})) {
      if (remaining <= 0) break;
      if (resourceGroup(name) !== group) continue;
      const used = Math.min(resourceCount(name), remaining);
      state.player.resources[name] -= used;
      if (state.player.resources[name] <= 0) delete state.player.resources[name];
      remaining -= used;
    }
    syncResourceTotals();
    return remaining <= 0;
  }

  function materialCount() {
    return Object.values(state.player.materials).reduce((sum, count) => sum + count, 0);
  }

  function sellableMaterialCount() {
    return Object.entries(state.player.materials)
      .filter(([name]) => !materialCatalog[name]?.unsellable && materialCatalog[name]?.sell != null)
      .reduce((sum, [, count]) => sum + count, 0);
  }

  function materialSummary(limit = 3) {
    const entries = Object.entries(state.player.materials).filter(([, count]) => count > 0);
    if (!entries.length) return "无";
    return entries.slice(0, limit).map(([name, count]) => `${name}${count}`).join(" ");
  }

  // Pets
  function makePet(petId, x = state.player.x, y = state.player.y) {
    const template = petCatalog[petId];
    if (!template) return null;
    return {
      ...template,
      id: `${petId}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      ownerId: currentPlayerId(),
      partyId: currentPartyId(),
      petId,
      x: x + rand(-0.8, 0.8),
      y: y + rand(-0.8, 0.8),
      hp: template.maxHp,
      injured: false,
      carried: false,
      lost: false,
      rescueTimer: 0,
      scene: currentPetScene(),
      cooldownTimer: rand(0, 0.7),
      wanderTimer: 0,
      wanderX: rand(-1, 1),
      wanderY: rand(-1, 1),
      alive: true
    };
  }

  function adoptPetFromMaterial(name) {
    const material = materialCatalog[name];
    if (!material?.pet || (state.player.materials[name] || 0) <= 0) return;
    if (petsForCurrentPlayer().filter(p => !p.lost).length >= 3) {
      toast("当前最多同时带三只宠物。");
      return;
    }
    const pet = makePet(material.pet);
    if (!pet) return;
    state.player.materials[name] -= 1;
    if (state.player.materials[name] <= 0) delete state.player.materials[name];
    state.pets.push(pet);
    log(`${pet.name}成为了你的宠物。它会在你身边游荡，只在你已引发战斗时护主。`);
  }

  function recallPets() {
    for (const pet of state.pets) {
      if (!ownedByCurrentPlayer(pet)) continue;
      if (pet.injured || pet.lost) continue;
      pet.x = state.player.x + rand(-1.2, 1.2);
      pet.y = state.player.y + rand(-1.2, 1.2);
      pet.scene = currentPetScene();
      pet.alive = true;
      pet.hp = Math.max(1, pet.hp || pet.maxHp);
      pet.cooldownTimer = 0.4;
    }
  }

  // Scene population
  function spawnWorld(scene = state.scene) {
    state.entities = [];
    state.objects = [];
    state.solids = [];
    state.pickups = [];

    if (scene === "field") {
      addObject("shop", "杂货店", 7, 6, 3, 3, "#8fa0b2", "shop");
      addObject("house", "空屋", 12, 6, 3, 3, "#b28d65", "house");
      addObject("guild", "公会", 6, 12, 4, 2, "#8d77a6", "guild");
      addObject("shrine", "白石祠", 15, 12, 2, 2, "#ccd2dc", "cleanse");
      addObject("magicCottage", "魔法爱好者小屋", 21, 7, 3, 3, "#5f83b7", "magicCottage");
      addObject("forge", "锻造台", 31, 27, 2, 2, "#a6654f", "forge");
      addPortal("无峰山脉西路", 3, 25, "peakless", 88.5, 35.5, "#8b8170");
      addPortal("北部森林路标", 76, 24, "forest", 8.5, 35.5, "#5e9c63");
      addPortal("旧王城路标", 84, 55, "ruins", 12.5, 34.5, "#726a7d");

      addEntity({ kind: "npc", name: "莉娜", faction: "human", x: 10.5, y: 11.5, r: 10, hp: 18, maxHp: 18, atk: 2, color: "#83c5ff", region: "village", affection: 24, devotion: 0, wantsTalk: false });
      addEntity({ kind: "npc", name: "艾梅", faction: "elf", x: 18.5, y: 14.5, r: 10, hp: 16, maxHp: 16, atk: 2, color: "#9fe0a2", region: "village", affection: 10, devotion: 0, wantsTalk: false });
      addEntity({ kind: "npc", name: "陶格", faction: "dwarf", x: 33.5, y: 30.5, r: 10, hp: 22, maxHp: 22, atk: 4, color: "#d49b6a", region: "field", affection: 4, devotion: 0, wantsTalk: false });

      for (let i = 0; i < 14; i += 1) spawnCreature("rabbit", rand(32, 58), rand(8, 33), { region: "forest" });
      for (let i = 0; i < 7; i += 1) spawnCreature("slime", rand(62, 84), rand(39, 62), { region: "ruins" });
      for (let i = 0; i < 5; i += 1) spawnCreature("wolf", rand(51, 76), rand(8, 35), { region: "forest" });
      scatterPickups([
        { kind: "herb", name: "药草", x: 31.5, y: 8.5, color: "#6bd46c" },
        { kind: "herb", name: "药草", x: 47.5, y: 30.5, color: "#6bd46c" },
        { kind: "potion", name: "小回复药", x: 64.5, y: 44.5, color: "#5ad0ed" },
        { kind: "wood", name: "木材", x: 38.5, y: 21.5, color: "#b8895a" },
        { kind: "stone", name: "反重力石", x: 56.5, y: 53.5, color: "#b7c0ca" },
        { kind: "gear", name: "皮帽", x: 24.5, y: 29.5, color: "#c79b64" }
      ]);
    }

    if (scene === "forest") {
      addPortal("银叶林北径", 47, 4, "silverleaf", 48.5, 62.5, "#b9d9a2");
      addPortal("回到晨风原野", 4, 33, "field", 74.5, 25.5, "#83745c");
      addPortal("沼泽古径", 83, 61, "ruins", 22.5, 48.5, "#5e8a86");
      addObject("shrine", "树根祠", 43, 31, 2, 2, "#ccd2dc", "cleanse");
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

    if (scene === "silverleaf") {
      addPortal("树灵森林南径", 47, 66, "forest", 47.5, 7.5, "#5e9c63");
      addObject("house", "银叶殿堂", 12, 10, 5, 4, "#b8cda4", "house");
      addObject("shrine", "银叶祠", 23, 13, 2, 2, "#dbe6d2", "cleanse");
      addObject("magicCottage", "自然之拥", 31, 11, 3, 3, "#8ed0b2", "magicCottage");
      addObject("shop", "人类出张所", 14, 23, 3, 3, "#8fa0b2", "shop");
      addObject("guild", "公会", 23, 23, 4, 2, "#8d77a6", "guild");
      addObject("forge", "锻造台", 34, 23, 2, 2, "#a6654f", "forge");
      addEntity({ kind: "npc", name: "露希尔", faction: "elf", x: 19.5, y: 18.5, r: 10, hp: 16, maxHp: 16, atk: 2, color: "#b8f0c4", region: "silverleaf", affection: 18, devotion: 0, wantsTalk: false });
      addEntity({ kind: "npc", name: "银叶守望", faction: "elf", x: 41.5, y: 58.5, r: 10, hp: 18, maxHp: 18, atk: 3, color: "#d7efc0", region: "silverleaf", affection: 10, devotion: 0, wantsTalk: false });
      spawnCreature("treant", 58.5, 27.5, { region: "silverleaf", affection: 0, devotion: 0 });
      spawnCreature("treant", 70.5, 46.5, { region: "silverleaf", affection: 0, devotion: 0 });
      for (let i = 0; i < 16; i += 1) spawnCreature("rabbit", rand(42, 84), rand(12, 56), { region: "silverleaf" });
      for (let i = 0; i < 3; i += 1) spawnCreature("wolf", rand(68, 88), rand(47, 63), { region: "silverleaf" });
      scatterPickups([
        { kind: "herb", name: "银叶草", x: 54.5, y: 20.5, color: "#b8f0c4" },
        { kind: "herb", name: "月见草", x: 70.5, y: 38.5, color: "#8ce86f" },
        { kind: "wood", name: "银叶木", x: 61.5, y: 52.5, color: "#c7d7a4" },
        { kind: "potion", name: "小回复药", x: 28.5, y: 20.5, color: "#5ad0ed" },
        { kind: "gear", name: "旅靴", x: 78.5, y: 57.5, color: "#a98f6b" }
      ]);
    }

    if (scene === "peakless") {
      addPortal("回到晨风原野", 88, 34, "field", 4.5, 26.5, "#83745c");
      addPortal("石泉西路", 4, 34, "stonegorge", 88.5, 35.5, "#9a8f78");
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

    if (scene === "stonegorge") {
      addPortal("回到无峰山脉", 88, 34, "peakless", 6.5, 35.5, "#83745c");
      addPortal("仇恨之孔北梯", 47, 4, "hatepit", 48.5, 62.5, "#4c4655");
      addObject("house", "洞穴小家", 12, 12, 5, 4, "#94765d", "house");
      addObject("shrine", "英灵殿", 23, 13, 3, 3, "#b7c0ca", "cleanse");
      addObject("magicCottage", "术士研讨所", 33, 12, 4, 3, "#6c7b91", "magicCottage");
      addObject("shop", "人类出张所", 12, 25, 3, 3, "#8fa0b2", "shop");
      addObject("guild", "公会", 23, 25, 4, 2, "#8d77a6", "guild");
      addObject("forge", "铁魂工坊", 34, 24, 3, 3, "#a6654f", "forge");
      addEntity({ kind: "npc", name: "布洛克", faction: "dwarf", x: 20.5, y: 19.5, r: 10, hp: 22, maxHp: 22, atk: 4, color: "#d49b6a", region: "stonegorge", affection: 18, devotion: 0, wantsTalk: false });
      addEntity({ kind: "npc", name: "石泉匠", faction: "dwarf", x: 39.5, y: 27.5, r: 10, hp: 24, maxHp: 24, atk: 4, color: "#c9a37a", region: "stonegorge", affection: 10, devotion: 0, wantsTalk: false });
      for (let i = 0; i < 6; i += 1) spawnCreature("slime", rand(52, 82), rand(18, 58), { region: "stonegorge" });
      for (let i = 0; i < 4; i += 1) spawnCreature("wolf", rand(50, 84), rand(15, 55), { region: "stonegorge" });
      scatterPickups([
        { kind: "stone", name: "石泉矿石", x: 55.5, y: 21.5, color: "#b7c0ca" },
        { kind: "stone", name: "粗矿石", x: 70.5, y: 47.5, color: "#9fa8ad" },
        { kind: "potion", name: "小回复药", x: 29.5, y: 22.5, color: "#5ad0ed" },
        { kind: "gear", name: "铁盔", x: 62.5, y: 58.5, color: "#9fa8ad" }
      ]);
    }

    if (scene === "hatepit") {
      addPortal("回到石泉沟壑", 47, 66, "stonegorge", 47.5, 6.5, "#83745c");
      addObject("shrine", "封印柱", 45, 32, 3, 3, "#53506e", "cleanse");
      for (let i = 0; i < 12; i += 1) spawnCreature("skeleton", rand(16, 76), rand(12, 58), { region: "hatepit" });
      for (let i = 0; i < 8; i += 1) spawnCreature("wisp", rand(22, 80), rand(14, 60), { region: "hatepit" });
      for (let i = 0; i < 5; i += 1) spawnCreature("gargoyle", rand(42, 86), rand(20, 55), { region: "hatepit" });
      scatterPickups([
        { kind: "stone", name: "异常矿石", x: 61.5, y: 24.5, color: "#726c82" },
        { kind: "stone", name: "黑裂矿", x: 33.5, y: 44.5, color: "#53506e" },
        { kind: "potion", name: "小回复药", x: 25.5, y: 57.5, color: "#5ad0ed" },
        { kind: "cleanse", name: "净化药", x: 52.5, y: 40.5, color: "#d9d4ff" }
      ]);
    }

    if (scene === "ruins") {
      addPortal("回到晨风原野", 9, 34, "field", 83.5, 55.5, "#83745c");
      addPortal("魔王城远门", 84, 35, "demon", 10.5, 35.5, "#9b4b62");
      addObject("dungeon", "旧王城入口", 49, 32, 3, 3, "#4b4a59", "dungeon");
      addObject("shrine", "残破圣像", 20, 22, 2, 2, "#ccd2dc", "cleanse");
      for (let i = 0; i < 12; i += 1) spawnCreature("slime", rand(22, 61), rand(20, 58), { region: "ruins" });
      for (let i = 0; i < 12; i += 1) spawnCreature("skeleton", rand(38, 82), rand(14, 61), { region: "ruins" });
      for (let i = 0; i < 6; i += 1) spawnCreature("gargoyle", rand(62, 88), rand(40, 63), { region: "mountain" });
      scatterPickups([
        { kind: "stone", name: "反重力石", x: 68.5, y: 50.5, color: "#b7c0ca" },
        { kind: "potion", name: "小回复药", x: 34.5, y: 54.5, color: "#5ad0ed" },
        { kind: "gear", name: "锁子甲", x: 44.5, y: 22.5, color: "#9fa8ad" }
      ]);
    }

    if (scene === "demon") {
      addPortal("退回旧王城", 6, 35, "ruins", 82.5, 35.5, "#83745c");
      addObject("dungeon", "魔王城门", 78, 32, 4, 5, "#5b2d43", "demonKeep");
      for (let i = 0; i < 10; i += 1) spawnCreature("gargoyle", rand(20, 74), rand(14, 57), { region: "demon" });
      for (let i = 0; i < 9; i += 1) spawnCreature("demonKnight", rand(35, 86), rand(18, 54), { region: "demon" });
      scatterPickups([
        { kind: "potion", name: "高回复药", x: 26.5, y: 19.5, color: "#5ad0ed", value: 2 },
        { kind: "stone", name: "魔城黑石", x: 72.5, y: 50.5, color: "#726c82" },
        { kind: "gear", name: "铁盔", x: 43.5, y: 22.5, color: "#9fa8ad" },
        { kind: "gear", name: "银项链", x: 64.5, y: 43.5, color: "#d8e0e6" }
      ]);
    }
  }

  function currentAreaName() {
    if (state.mode === "dungeon") return "排列迷宫";
    return `${sceneNames[state.scene] || "未知地带"} / ${regionAt(state.player.x, state.player.y).name}`;
  }

  function currentPetScene() {
    return state.mode === "dungeon" ? "dungeon" : state.scene;
  }

  function nearestEntity(range = 1.3, filter = () => true) {
    let best = null;
    let bestD = Infinity;
    for (const e of state.entities) {
      if (!e.alive || !filter(e)) continue;
      const d = dist(state.player, e);
      if (d < range && d < bestD) {
        best = e;
        bestD = d;
      }
    }
    return best;
  }

  function bodyGap(a, b) {
    const radiusA = (a.r || 0) / tile;
    const radiusB = (b.r || 0) / tile;
    return Math.max(0, dist(a, b) - radiusA - radiusB);
  }

  function nearestAttackTarget(range, filter = () => true) {
    let best = null;
    let bestGap = Infinity;
    for (const e of state.entities) {
      if (!e.alive || !filter(e)) continue;
      const gap = bodyGap(state.player, e);
      if (gap <= range && gap < bestGap) {
        best = e;
        bestGap = gap;
      }
    }
    return best;
  }

  function attackSpecForWeapon(weapon, angle) {
    const playerRadius = state.player.r / tile;
    if (weapon.type === "匕首") {
      return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: 0.86, duration: 0.13, color: "#eaf7ff", lineWidth: 3 };
    }
    if (weapon.type.includes("剑")) {
      return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: weapon.name === "剑的概念" ? 1.16 : 1.02, duration: weapon.name === "剑的概念" ? 0.2 : 0.17, color: weapon.name === "剑的概念" ? "#fff4b0" : "#dbe4ea", lineWidth: weapon.name === "剑的概念" ? 5 : 4 };
    }
    if (weapon.type === "长枪") {
      return { shape: "line", effect: "thrust", angle, reach: weapon.range + playerRadius, halfWidth: 0.28, duration: 0.16, color: "#dbe4ea", lineWidth: 4 };
    }
    if (weapon.type === "锤") {
      const radius = Math.max(0.9, weapon.range * 0.85);
      return { shape: "impact", effect: "hammer", angle, centerDist: radius * 0.72, radius, duration: 0.22, color: "#f3c45b", lineWidth: 5 };
    }
    if (weapon.type === "魔物") {
      return { shape: "sector", effect: "claw", angle, reach: Math.min(weapon.range, 0.92) + playerRadius, halfAngle: Math.PI / 2, duration: 0.14, color: "#d986ff", lineWidth: 3 };
    }
    return { shape: "sector", effect: "slash", angle, reach: weapon.range + playerRadius, halfAngle: 0.95, duration: 0.16, color: "#dbe4ea", lineWidth: 3 };
  }

  function attackTargetScore(e, spec) {
    const p = state.player;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const targetRadius = (e.r || 0) / tile;
    const d = Math.hypot(dx, dy);
    const dirX = Math.cos(spec.angle);
    const dirY = Math.sin(spec.angle);
    if ((spec.shape === "sector" || spec.shape === "claw") && d <= targetRadius + (p.r / tile) * 0.65) return d;
    if (spec.shape === "sector" || spec.shape === "claw") {
      if (d > spec.reach + targetRadius) return Infinity;
      const targetAngle = Math.atan2(dy, dx);
      const angularBuffer = Math.asin(Math.min(1, targetRadius / Math.max(d, 0.01)));
      return angleBetween(targetAngle, spec.angle) <= spec.halfAngle + angularBuffer ? d : Infinity;
    }
    if (spec.shape === "line") {
      const forward = dx * dirX + dy * dirY;
      const side = Math.abs(dx * -dirY + dy * dirX);
      if (forward < -targetRadius || forward > spec.reach + targetRadius) return Infinity;
      return side <= spec.halfWidth + targetRadius ? forward + side * 0.35 : Infinity;
    }
    if (spec.shape === "impact") {
      const cx = p.x + dirX * spec.centerDist;
      const cy = p.y + dirY * spec.centerDist;
      const impactD = Math.hypot(e.x - cx, e.y - cy);
      return impactD <= spec.radius + targetRadius ? impactD : Infinity;
    }
    return Infinity;
  }

  function nearestAttackShapeTarget(spec, filter = () => true) {
    let best = null;
    let bestScore = Infinity;
    for (const e of state.entities) {
      if (!e.alive || !filter(e)) continue;
      const score = attackTargetScore(e, spec);
      if (score < bestScore) {
        best = e;
        bestScore = score;
      }
    }
    return best;
  }

  function startAttackEffect(weapon, spec, hit = false, critical = false) {
    attackEffect = { ...spec, weaponType: weapon.type, weaponName: weapon.name, time: 0, hit, critical };
  }

  function isBowWeapon(weapon = currentWeapon()) {
    return weapon?.type === "弓";
  }

  function canUseWorldActions() {
    return appMode === "playing" && !backpackOpen && !questOpen && !shopOpen && !forgeOpen && !magicOpen;
  }

  function bowChargeProgress() {
    return clamp((bowCharge?.time || 0) / 1.25, 0, 1);
  }

  function bowShotStats(weapon, charge) {
    const minRange = 3.5;
    const maxRange = weapon.range || 10;
    return {
      range: minRange + (maxRange - minRange) * charge,
      speed: 7 + 9 * charge,
      damageScale: 0.55 + 0.75 * charge
    };
  }

  function attackEntityFilter(e) {
    if (state.player.monsterForm) return e.faction !== "monster";
    return true;
  }

  function beginBowCharge() {
    if (!canUseWorldActions() || hitStopTimer > 0 || bowCharge) return false;
    const weapon = currentWeapon();
    if (!isBowWeapon(weapon)) return false;
    if ((state.player.arrows || 0) <= 0) {
      toast("没有箭。");
      return true;
    }
    if (state.player.stamina < weapon.stamina) {
      toast("体力不足，拉不开弓。");
      return true;
    }
    bowCharge = { time: 0, rushed: state.player.attackCooldown > 0 };
    state.player.blockTimer = 0;
    return true;
  }

  function releaseBowCharge() {
    if (!bowCharge) return false;
    if (!canUseWorldActions()) {
      bowCharge = null;
      return true;
    }
    const charge = bowChargeProgress();
    const rushed = bowCharge.rushed;
    bowCharge = null;
    fireArrow(charge, rushed);
    return true;
  }

  function fireArrow(charge, rushedAttack = false) {
    const weapon = currentWeapon();
    if (!isBowWeapon(weapon)) return;
    if ((state.player.arrows || 0) <= 0) {
      toast("没有箭。");
      return;
    }
    if (state.player.stamina < weapon.stamina) {
      toast("体力不足，箭射偏了。");
      return;
    }
    state.player.arrows -= 1;
    state.player.stamina = Math.max(0, state.player.stamina - weapon.stamina);
    state.player.attackCooldown = weapon.cooldown;
    const angle = playerAimAngle();
    const stats = bowShotStats(weapon, clamp(charge, 0, 1));
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    flyingArrows.push({
      x: state.player.x,
      y: state.player.y,
      startX: state.player.x,
      startY: state.player.y,
      endX: state.player.x + ux * stats.range,
      endY: state.player.y + uy * stats.range,
      vx: ux * stats.speed,
      vy: uy * stats.speed,
      speed: stats.speed,
      angle,
      range: stats.range,
      traveled: 0,
      damageScale: stats.damageScale * (rushedAttack ? 0.4 : 1),
      weaponAtk: weapon.atk || 0
    });
    log(`射出一支箭${rushedAttack ? "，攻击间隔未到只发挥四成威力" : ""}。`);
    renderStats();
  }

  function segmentPointDistance(ax, ay, bx, by, px, py) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy || 0.0001;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }

  function addArrowPickup(x, y) {
    addPickup("arrow", "箭", x, y, "#dbe4ea");
  }

  function dropEmbeddedArrows(e) {
    const count = Math.floor(e.arrowHits || 0);
    if (count <= 0) return;
    for (let i = 0; i < count; i += 1) addArrowPickup(e.x + rand(-0.35, 0.35), e.y + rand(-0.35, 0.35));
    e.arrowHits = 0;
  }

  function resolveArrowHit(arrow, target) {
    const critical = Math.random() < 0.05;
    const variance = 3;
    const baseDmg = Math.max(1, Math.ceil((state.player.atk + Math.floor(Math.random() * variance)) * arrow.damageScale * (critical ? 1.2 : 1)));
    const dmg = applyRaceFinalAmount(baseDmg, raceDamageMultiplier("bow"));
    target.hp -= dmg;
    target.arrowHits = (target.arrowHits || 0) + 1;
    target.playerAggro = (target.playerAggro || 0) + dmg + 8;
    markHitReaction(target, critical);
    if (critical) hitStopTimer = Math.max(hitStopTimer, 0.08);
    log(`弓箭命中${target.name}，造成${dmg}点伤害${critical ? "，暴击" : ""}。`);
    if (target.hp <= 0) defeatEntity(target);
  }

  function updateFlyingArrows(dt) {
    for (let i = flyingArrows.length - 1; i >= 0; i -= 1) {
      const arrow = flyingArrows[i];
      const oldX = arrow.x;
      const oldY = arrow.y;
      const step = Math.min(arrow.speed * dt, arrow.range - arrow.traveled);
      arrow.x += Math.cos(arrow.angle) * step;
      arrow.y += Math.sin(arrow.angle) * step;
      arrow.traveled += step;
      let hit = null;
      let best = Infinity;
      for (const e of state.entities) {
        if (!e.alive || !attackEntityFilter(e)) continue;
        const threshold = (e.r || 8) / tile + 0.08;
        const d = segmentPointDistance(oldX, oldY, arrow.x, arrow.y, e.x, e.y);
        if (d <= threshold && d < best) {
          hit = e;
          best = d;
        }
      }
      if (hit) {
        resolveArrowHit(arrow, hit);
        flyingArrows.splice(i, 1);
        continue;
      }
      if (arrow.traveled >= arrow.range - 0.001) {
        addArrowPickup(arrow.endX, arrow.endY);
        flyingArrows.splice(i, 1);
      }
    }
  }

  function markHitReaction(target, critical) {
    hitReactions.set(target, {
      time: 0,
      duration: critical ? 0.18 : 0.1,
      dx: state.player.x <= target.x ? 1 : -1,
      dy: 1,
      critical
    });
    hitReactionEntities.add(target);
  }

  function objectEdgeDistance(o, actor = state.player) {
    const dx = Math.max(o.x - actor.x, 0, actor.x - (o.x + o.w));
    const dy = Math.max(o.y - actor.y, 0, actor.y - (o.y + o.h));
    return Math.hypot(dx, dy);
  }

  function nearestObject(range = 1.4) {
    let best = null;
    let bestD = Infinity;
    for (const o of state.objects) {
      const edgeDistance = objectEdgeDistance(o);
      if (edgeDistance < range && edgeDistance < bestD) {
        best = o;
        bestD = edgeDistance;
      }
    }
    return best;
  }

  // Combat and defeat
  function damagePlayer(amount, source) {
    if (state.player.invuln > 0) return;
    refreshCombatStats();
    const blocked = state.player.blockTimer > 0;
    let finalAmount = blocked ? Math.ceil(amount * 0.35) : amount;
    finalAmount = Math.max(1, Math.ceil(finalAmount - (state.player.def * raceDefenseMultiplier()) * 0.55));
    state.player.hp -= finalAmount;
    state.player.lastHitBy = source;
    state.player.invuln = 0.65;
    if (blocked) log(`防御成功，受到${finalAmount}点伤害。`);
    if (source && source.alive) {
      const armorMods = Object.entries(state.player.gear)
        .filter(([slot]) => slot !== "weapon")
        .flatMap(([, gearId]) => gearId ? gearModList(gearId) : []);
      const thorns = equippedModList().reduce((sum, mod) => sum + (mod.thorns || 0), 0);
      const slowMod = armorMods.reduce((best, mod) => (mod.slowOnBlock || 0) > (best.slowOnBlock || 0) ? mod : best, {});
      if (slowMod.slowOnBlock) {
        source.slowTimer = Math.max(source.slowTimer || 0, slowMod.duration || 2.6);
        source.slowPower = Math.max(source.slowPower || 0, slowMod.slowOnBlock);
      }
      if (thorns > 0) {
        source.hp -= thorns;
        log(`${source.name}被装备上的狼牙反伤${thorns}点。`);
        if (source.hp <= 0) defeatEntity(source);
      }
    }
    if (state.player.hp <= 0) playerDefeated(source);
  }

  function damagePet(pet, amount, source) {
    if (!pet || !pet.alive) return;
    pet.hp -= Math.max(1, Math.ceil(amount));
    if (source) {
      if (!source.petAggro) source.petAggro = {};
      source.petAggro[pet.id] = (source.petAggro[pet.id] || 0) + amount;
    }
    if (pet.hp <= 0) {
      pet.alive = false;
      pet.injured = true;
      pet.carried = false;
      pet.rescueTimer = 900;
      pet.scene = currentPetScene();
      pet.hp = 0;
      log(`${pet.name}重伤倒下了。悲怆涌上来：移速和防御提升，攻击几乎消失。15分钟内靠近按E抱起，并带到白石祠恢复。`);
    }
  }

  function petDiesIrreversibly(pet) {
    if (!pet || pet.dead) return;
    pet.dead = true;
    pet.lost = true;
    pet.injured = false;
    pet.carried = false;
    pet.alive = false;
    pet.rescueTimer = 0;
    state.petRemains.push({
      id: `remain-${pet.id}`,
      ownerId: pet.ownerId || currentPlayerId(),
      partyId: pet.partyId || currentPartyId(),
      kind: "corpse",
      petName: pet.name,
      x: pet.x,
      y: pet.y,
      scene: pet.scene || currentPetScene(),
      color: pet.color,
      age: 0,
      decay: 0,
      decayClock: 0
    });
    refreshCombatStats();
    log(`${pet.name}没能及时送回神龛，已经不可复活地死亡。`);
    log('"AM I A GOOD BOY?"');
  }

  function petById(id) {
    return state.pets.find(pet => pet.id === id && pet.alive && !pet.injured && !pet.lost) || null;
  }

  // Quests
  function activeSmallQuestFor(npcName) {
    ensureQuestState();
    return state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.giver === npcName && !q.settled) || null;
  }

  function activeSmallQuestCount() {
    ensureQuestState();
    return state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled).length;
  }

  function adjustNpcMemory(npcName, affection, devotion) {
    ensureNpcMemoryOwnership();
    const key = npcMemoryKey(npcName);
    const store = state.npcMemoryByPlayer[currentPlayerId()];
    const memory = store[key] || { ownerId: currentPlayerId(), affection: 0, devotion: 0 };
    memory.affection = clamp((memory.affection || 0) + affection, -100, 100);
    memory.devotion = clamp((memory.devotion || 0) + devotion, 0, 100);
    memory.ownerId = currentPlayerId();
    store[key] = memory;
    state.npcMemory = store;
    const npc = state.entities.find(e => e.alive && npcMemoryKey(e) === key);
    if (npc) {
      npc.affection = clamp((npc.affection || 0) + affection, -100, 100);
      npc.devotion = clamp((npc.devotion || 0) + devotion, 0, 100);
    }
  }

  function majorQuestStatus(q) {
    if (!q) return "无大型任务。";
    if (q.type === "kill") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，可回公会结算" : ""}`;
    if (q.type === "scout") return `${q.name}：${q.goalDone ? "情报已取得，回公会结算" : "前往魔王城前庭任务点"}`;
    return q.name;
  }

  function smallQuestStatus(q) {
    if (!q) return "无小型任务。";
    if (q.type === "hunt") return `${q.name}：${q.progress}/${q.count}${q.goalDone ? "，回到委托人处交付" : ""}`;
    if (q.type === "delivery") return `${q.name}：${q.delivered ? "已送达，回委托人处结算" : `送给${q.targetNpc}`}`;
    return q.name;
  }

  function questRewardText(reward) {
    const amountText = value => Array.isArray(value) ? `${value[0]}-${value[1]}` : value;
    const parts = [];
    if (reward.gold) parts.push(`${amountText(reward.gold)}G`);
    if (reward.potions) parts.push(`药水${amountText(reward.potions)}`);
    if (reward.wood) parts.push(`木头${amountText(reward.wood)}`);
    if (reward.stone) parts.push(`石头${amountText(reward.stone)}`);
    if (reward.herbs) parts.push(`草药${amountText(reward.herbs)}`);
    if (reward.affection) parts.push(`好感+${amountText(reward.affection)}`);
    if (reward.devotion) parts.push(`献身+${amountText(reward.devotion)}`);
    return parts.join(" / ") || "无";
  }

  function rollQuestReward(reward = {}) {
    const rolled = {};
    for (const [key, value] of Object.entries(reward)) {
      const amount = Array.isArray(value) ? Math.floor(rand(value[0], value[1] + 1)) : value;
      if (amount) rolled[key] = amount;
    }
    return rolled;
  }

  function acceptMajorQuest(id) {
    if (questBelongsToCurrentPlayer(state.quests.major)) return toast("大型任务最多同时持有 1 个。");
    const template = questCatalog.major.find(q => q.id === id);
    if (!template) return;
    state.quests.major = ensureQuestOwnership({ ...clonePlain(template), reward: rollQuestReward(template.reward), progress: 0, goalDone: false, autoSettleAt: null, settled: false });
    log(`接取大型任务：${template.name}。`);
    autoSave();
    closeQuestPanel();
  }

  function chooseDeliveryTarget(giverName) {
    return state.entities.find(e => e.alive && e.kind === "npc" && e.name !== giverName)?.name || null;
  }

  function acceptSmallQuest(npcName, type) {
    if (activeSmallQuestCount() >= 3) return toast("小型任务最多同时持有 3 个。");
    if (activeSmallQuestFor(npcName)) return toast(`${npcName}已经委托过你一件事。`);
    const template = questCatalog.small.find(q => q.type === type) || questCatalog.small[0];
    const quest = ensureQuestOwnership({ ...clonePlain(template), reward: rollQuestReward(template.reward), giver: npcName, progress: 0, goalDone: false, delivered: false, autoSettleAt: null, settled: false });
    if (quest.type === "delivery") {
      quest.targetNpc = chooseDeliveryTarget(npcName);
      if (!quest.targetNpc) return toast("附近没有合适的收件人。");
      quest.name = `给${quest.targetNpc}送货`;
    }
    state.quests.small.push(quest);
    log(`${npcName}委托了小任务：${quest.name}。`);
    autoSave();
    closeQuestPanel();
  }

  function payQuestReward(q) {
    const reward = q.reward || {};
    state.player.gold = (state.player.gold || 0) + (reward.gold || 0);
    state.player.potions = (state.player.potions || 0) + (reward.potions || 0);
    if (reward.wood) addResource("木材", reward.wood);
    if (reward.stone) addResource("反重力石", reward.stone);
    state.player.herbs = (state.player.herbs || 0) + (reward.herbs || 0);
    if (q.giver) adjustNpcMemory(q.giver, reward.affection || 0, reward.devotion || 0);
  }

  function settleMajorQuest(auto = false) {
    const q = state.quests.major;
    if (!q || !questBelongsToCurrentPlayer(q) || !q.goalDone) return false;
    payQuestReward(q);
    if (auto && q.type === "kill") log(`消息传回公会，讨伐任务报酬已送达。获得${questRewardText(q.reward)}。`);
    else log(`公会结算了大型任务：${q.name}，获得${questRewardText(q.reward)}。`);
    state.quests.major = null;
    autoSave();
    return true;
  }

  function settleSmallQuest(q, auto = false) {
    if (!q || !questBelongsToCurrentPlayer(q) || !q.goalDone) return false;
    payQuestReward(q);
    q.settled = true;
    if (auto && q.type === "delivery") log(`送货结果会通过民间消息传回委托人。获得${questRewardText(q.reward)}。`);
    else log(`${q.giver}结算了小任务：${q.name}，获得${questRewardText(q.reward)}。`);
    state.quests.small = state.quests.small.filter(item => !item.settled);
    autoSave();
    return true;
  }

  function recordQuestDefeat(e) {
    const major = state.quests.major;
    if (major?.type === "kill" && questBelongsToCurrentPlayer(major) && !major.goalDone && e.species === major.species) {
      major.progress += 1;
      if (major.progress >= major.count) {
        major.goalDone = true;
        major.autoSettleAt = state.time + (major.autoSettleDelay || 30);
        log(`${major.name}目标完成。可回公会结算；若不返回，消息流通后也会自动结算。`);
        autoSave();
      }
    }
    for (const q of state.quests.small) {
      if (questBelongsToCurrentPlayer(q) && q.type === "hunt" && !q.goalDone && e.species === q.species) {
        q.progress += 1;
        if (q.progress >= q.count) {
          q.goalDone = true;
          log(`${q.name}目标完成。需要回到${q.giver}处交付。`);
          autoSave();
        }
      }
    }
  }

  function handleDeliveryTalk(npc) {
    const quest = state.quests.small.find(q => questBelongsToCurrentPlayer(q) && q.type === "delivery" && !q.delivered && q.targetNpc === npc.name);
    if (!quest) return false;
    quest.delivered = true;
    quest.goalDone = true;
    quest.autoSettleAt = state.time + (quest.autoSettleDelay || 22);
    log(`把货物交给了${npc.name}。回到${quest.giver}处可立即结算；否则消息传开后会自动结算。`);
    autoSave();
    return true;
  }

  function updateQuestProgress(dt) {
    ensureQuestState();
    const major = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
    if (major?.type === "scout" && !major.goalDone && state.scene === major.scene && Math.hypot(state.player.x - major.x, state.player.y - major.y) <= major.radius) {
      major.goalDone = true;
      log("你确认了魔王城前庭的情报。需要回公会报告。");
      autoSave();
    }
    if (major?.goalDone && major.autoSettleAt && state.time >= major.autoSettleAt) settleMajorQuest(true);
    for (const q of [...state.quests.small].filter(questBelongsToCurrentPlayer)) {
      if (q.goalDone && q.autoSettleAt && state.time >= q.autoSettleAt) settleSmallQuest(q, true);
    }
  }

  // Magic
  function magicList() {
    return Object.entries(magicCatalog || {}).map(([id, spell]) => ({ id, ...spell }));
  }

  function normalizeMagicTerm(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[\s　"'“”‘’.,，。!?！？・、\-_/\\]/g, "");
  }

  function magicByInput(input) {
    const normalized = normalizeMagicTerm(input);
    if (!normalized) return null;
    return magicList().find(spell => spell.aliases.some(alias => normalizeMagicTerm(alias) === normalized)) || null;
  }

  const forbiddenMagicInputs = [
    { aliases: ["阿瓦达索命", "アバダケダブラ", "Avada Kedavra"], message: "你不可以学这个，你不可以学这个的口牙！" },
    { aliases: ["钻心剜骨", "クルーシオ", "Crucio"], message: "还是想想你爱的人吧..." },
    { aliases: ["魂魄出窍", "インペリオ", "Imperio"], message: "你是否想过，朋友不再是朋友，家园不再是家园？" }
  ];

  function forbiddenMagicByInput(input) {
    const normalized = normalizeMagicTerm(input);
    if (!normalized) return null;
    return forbiddenMagicInputs.find(item => item.aliases.some(alias => normalizeMagicTerm(alias) === normalized)) || null;
  }

  function editDistance(a, b) {
    const aa = Array.from(a);
    const bb = Array.from(b);
    const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
    for (let i = 0; i <= aa.length; i += 1) dp[i][0] = i;
    for (let j = 0; j <= bb.length; j += 1) dp[0][j] = j;
    for (let i = 1; i <= aa.length; i += 1) {
      for (let j = 1; j <= bb.length; j += 1) {
        const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[aa.length][bb.length];
  }

  function isNearMagicName(input) {
    const normalized = normalizeMagicTerm(input);
    if (!normalized) return false;
    return magicList().some(spell => spell.aliases.some(alias => {
      const candidate = normalizeMagicTerm(alias);
      if (!candidate || candidate === normalized) return false;
      if (candidate.includes(normalized) || normalized.includes(candidate)) return Math.min(candidate.length, normalized.length) >= 2;
      return editDistance(normalized, candidate) <= Math.max(1, Math.floor(candidate.length * 0.34));
    }));
  }

  function knowsMagic(spellId) {
    return state.player.magicKnown.includes(spellId);
  }

  function hasMagicClue(spellId) {
    return !!state.player.magicClues[spellId];
  }

  function addMagicClue(spellId, message) {
    const spell = magicCatalog[spellId];
    if (!spell || hasMagicClue(spellId)) return false;
    state.player.magicClues[spellId] = true;
    log(message || spell.clueLine || `你得到了一点关于${spell.name}的线索。`);
    autoSave();
    return true;
  }

  function shareMagicRumor(npc) {
    const unknown = magicList().filter(spell => !hasMagicClue(spell.id));
    if (!unknown.length) return;
    const spell = unknown[0];
    addMagicClue(spell.id, `${npc.name}提到「${spell.aliases[0]}」：${spell.clueLine}`);
  }

  function learnMagicFromInput(input) {
    const forbidden = forbiddenMagicByInput(input);
    if (forbidden) {
      log(forbidden.message);
      return;
    }
    const spell = magicByInput(input);
    if (!spell) {
      log(isNearMagicName(input) ? "这个词语似乎接近某种魔法，但还不完整。" : "什么都没有发生。");
      return;
    }
    if (knowsMagic(spell.id)) {
      log("你已经掌握了这个魔法。");
      return;
    }
    if (!hasMagicClue(spell.id)) {
      log("文字发出微光，你似乎是个天才。但魔法无法成形，你还缺少某种理解。");
      return;
    }
    state.player.magicKnown.push(spell.id);
    log(`魔法回应了你。你学会了${spell.name}。`);
    autoSave();
  }

  function magicTargetFilter(e) {
    if (!e.alive) return false;
    if (state.player.monsterForm) return e.faction !== "monster" && e.kind !== "animal";
    return e.faction === "monster";
  }

  function hostileToPlayer(e) {
    return !!e?.alive && magicTargetFilter(e);
  }

  function playerHasEnemyAggro() {
    return state.entities.some(e => hostileToPlayer(e) && (e.playerAggro || 0) > 0.01);
  }

  function updateMpRegen(dt) {
    const p = state.player;
    p.mpRegenLock = Math.max(0, (p.mpRegenLock || 0) - dt);
    if (p.mpRegenLock > 0 || p.mp >= p.maxMp) {
      p.mp = Math.min(p.maxMp, p.mp);
      return;
    }
    const inCombat = playerHasEnemyAggro();
    const rate = inCombat ? (0.3 + p.maxMp * 0.02) : (1 + p.maxMp * 0.05);
    p.mp = Math.min(p.maxMp, p.mp + rate * dt);
  }

  function magicCastPoint(maxRange = 12.5) {
    const p = state.player;
    const raw = aimWorld || { x: p.x + aimVector.x * maxRange, y: p.y + aimVector.y * maxRange };
    const dx = raw.x - p.x;
    const dy = raw.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d <= maxRange) return { x: raw.x, y: raw.y };
    return { x: p.x + (dx / d) * maxRange, y: p.y + (dy / d) * maxRange };
  }

  function closestEnemyAtPoint(point, radius) {
    let best = null;
    let bestD = Infinity;
    for (const e of state.entities) {
      if (!magicTargetFilter(e)) continue;
      const d = Math.hypot(e.x - point.x, e.y - point.y);
      if (d <= radius && d < bestD) {
        best = e;
        bestD = d;
      }
    }
    return best;
  }

  function friendlyAtPoint(point, radius) {
    const pets = state.pets
      .filter(pet => !pet.lost && !pet.injured && pet.alive && currentPetScene() === (pet.scene || currentPetScene()))
      .map(pet => ({ target: pet, d: Math.hypot(pet.x - point.x, pet.y - point.y) }))
      .filter(item => item.d <= radius)
      .sort((a, b) => a.d - b.d);
    if (pets[0]) return pets[0].target;
    const npc = state.entities
      .filter(e => e.alive && (e.kind === "npc" || e.kind === "friendly"))
      .map(e => ({ target: e, d: Math.hypot(e.x - point.x, e.y - point.y) }))
      .filter(item => item.d <= radius)
      .sort((a, b) => a.d - b.d)[0];
    return npc?.target || null;
  }

  function damageByMagic(target, amount, spell) {
    const finalAmount = applyRaceFinalAmount(amount, raceDamageMultiplier("magic"));
    target.hp -= finalAmount;
    target.playerAggro = (target.playerAggro || 0) + finalAmount + 10;
    markHitReaction(target, spell.id === "thunderFlash");
    if (target.hp <= 0) defeatEntity(target);
    return finalAmount;
  }

  function startMagicEffect(spell, x, y, radius = 0.8) {
    magicEffects.push({
      spellId: spell.id,
      name: spell.name,
      kind: spell.kind,
      x,
      y,
      radius,
      color: spell.color || "#d9d4ff",
      time: 0,
      duration: spell.effectDuration || 0.8,
      tickTimer: 0,
      damagePerSecond: spell.damagePerSecond || 0,
      slowPower: spell.slowPower || 0
    });
  }

  function beginMagicCast(spellId) {
    const spell = magicCatalog[spellId];
    if (!spell || !knowsMagic(spellId)) return toast("还没有掌握这个魔法。");
    if (state.player.monsterForm) return toast("魔物化状态下无法稳定组织魔法。");
    if (state.player.mp < spell.cost) return toast("MP 不足。");
    state.player.mp -= spell.cost;
    const chantTime = (spell.chant || 0.5) * magicChantTimeScale;
    pendingMagicCast = { spellId, timer: chantTime, total: chantTime };
    log(`开始吟唱${spell.name}。`);
    closeMagicPanel();
    renderStats();
  }

  function resolveMagicCast(cast) {
    const spell = magicCatalog[cast.spellId];
    if (!spell) return;
    state.player.mpRegenLock = 1.5;
    const point = magicCastPoint(12.5);
    if (spell.kind === "heal") {
      const target = friendlyAtPoint(point, spell.radius) || state.player;
      const before = target.hp;
      const heal = applyRaceFinalAmount(spell.heal, raceDamageMultiplier("magic"));
      target.hp = Math.min(target.maxHp, target.hp + heal);
      startMagicEffect({ id: cast.spellId, ...spell }, target.x, target.y, spell.radius);
      log(`施放${spell.name}，${target === state.player ? "自己" : target.name}回复${Math.ceil(target.hp - before)}点 HP。`);
      return;
    }
    if (spell.kind === "single") {
      const target = closestEnemyAtPoint(point, spell.radius);
      startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
      if (!target) {
        log(`${spell.name}划过空处。`);
        return;
      }
      const dealt = damageByMagic(target, spell.damage, { id: cast.spellId, ...spell });
      log(`施放${spell.name}命中${target.name}，造成${dealt}点伤害。`);
      return;
    }
    if (spell.kind === "zone") {
      startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
      log(`施放${spell.name}，寒雾在指定位置扩散。`);
      return;
    }
    const affected = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - point.x, e.y - point.y) <= spell.radius);
    let dealt = 0;
    for (const e of [...affected]) dealt = damageByMagic(e, spell.damage, { id: cast.spellId, ...spell });
    startMagicEffect({ id: cast.spellId, ...spell }, point.x, point.y, spell.radius);
    log(`施放${spell.name}，${affected.length}个目标受到${dealt || applyRaceFinalAmount(spell.damage, raceDamageMultiplier("magic"))}点伤害。`);
  }

  function updateMagicZoneEffect(effect, dt) {
    if (effect.kind !== "zone") return;
    effect.tickTimer += dt;
    const targets = state.entities.filter(e => magicTargetFilter(e) && Math.hypot(e.x - effect.x, e.y - effect.y) <= effect.radius);
    for (const e of targets) {
      e.slowTimer = Math.max(e.slowTimer || 0, 0.25);
      e.slowPower = Math.max(e.slowPower || 0, effect.slowPower || 0.2);
    }
    while (effect.tickTimer >= 1) {
      effect.tickTimer -= 1;
      for (const e of [...targets]) {
        if (e.alive) damageByMagic(e, effect.damagePerSecond || 1, { id: effect.spellId });
      }
    }
  }

  function strongestPetAggro(e) {
    let best = null;
    let bestValue = 0;
    for (const [petId, value] of Object.entries(e.petAggro || {})) {
      const pet = petById(petId);
      if (pet && value > bestValue) {
        best = pet;
        bestValue = value;
      }
    }
    return { pet: best, value: bestValue };
  }

  function rollDrop(drop, x, y) {
    if (!drop || Math.random() > drop.chance) return false;
    addPickup(drop.kind, drop.name, x + rand(-0.35, 0.35), y + rand(-0.35, 0.35), drop.color, drop.value || 1);
    return true;
  }

  function dropLoot(e) {
    const template = bestiary[e.species];
    if (!template) return;
    const common = rollDrop(template.commonDrop, e.x, e.y);
    const rare = rollDrop(template.rareDrop, e.x, e.y);
    const extraDrops = (template.extraDrops || []).filter(drop => rollDrop(drop, e.x, e.y));
    if (rare) log(`${e.name}掉落了稀有物：${template.rareDrop.name}。`);
    if (extraDrops.length) log(`${e.name}掉落了超稀有物：${extraDrops.map(drop => drop.name).join("、")}。`);
    else if (common) log(`${e.name}留下了${template.commonDrop.name}。`);
  }

  function playerDefeated(source) {
    if (source && source.faction === "monster" && !state.player.monsterForm) {
      state.player.monsterForm = true;
      state.player.hp = Math.ceil(state.player.maxHp * 0.65);
      refreshCombatStats();
      log(`被${source.name}击倒后，角色被魔素污染，暂时转入魔物势力。`);
      return;
    }
    state.player.hp = Math.ceil(state.player.maxHp * 0.5);
    loadScene("field", 18.5, 13.5, "濒死后被搬回白石祠旁边，损失了一些时间。");
    state.player.blockTimer = 0;
    state.player.dodgeTimer = 0;
    state.player.invuln = 1.2;
  }

  function defeatEntity(e, attacker = "player") {
    e.alive = false;
    dropEmbeddedArrows(e);
    if (e.kind === "monster") {
      recordQuestDefeat(e);
      state.player.gold += 2 + Math.floor(Math.random() * 5);
      dropLoot(e);
      if (e.species === "slime" && e.split && (e.slimeGen || 1) < 3) {
        const childGen = (e.slimeGen || 1) + 1;
        spawnCreature("slime", e.x + 0.7, e.y + 0.4, { slimeGen: childGen, region: e.region });
        spawnCreature("slime", e.x - 0.7, e.y - 0.4, { slimeGen: childGen, region: e.region });
        log(`${e.name}分裂成第${childGen}代小史莱姆。第三代不会继续分裂。`);
      }
      log(`击败了${e.name}。`);
      return;
    }
    if (e.kind === "animal") {
      recordQuestDefeat(e);
      dropLoot(e);
      const r = regions[e.region] || regionAt(e.x, e.y);
      r.trust = clamp(r.trust - 3, 0, 100);
      r.hate = clamp(r.hate + 4, 0, 100);
      log(`猎获${e.name}，${r.name}的信任略降。`);
      return;
    }
    if (e.kind === "friendly" || e.kind === "npc") {
      dropLoot(e);
      const r = regions[e.region] || regionAt(e.x, e.y);
      r.trust = clamp(r.trust - 22, 0, 100);
      r.hate = clamp(r.hate + 26, 0, 100);
      log(`${e.name}倒下了。${r.name}信任下降，仇恨上升。`);
      return;
    }
    if (attacker === "monster") log(`${e.name}被卷入冲突。`);
  }

  function playerAttack() {
    if (hitStopTimer > 0) return;
    refreshCombatStats();
    const weapon = currentWeapon();
    if (isBowWeapon(weapon)) {
      if ((state.player.arrows || 0) <= 0) return toast("没有箭。");
      fireArrow(0.08, state.player.attackCooldown > 0);
      return;
    }
    const rushedAttack = state.player.attackCooldown > 0;
    if (state.player.stamina < weapon.stamina) {
      toast("体力不足，攻击会失手。");
      return;
    }
    const spec = attackSpecForWeapon(weapon, playerAimAngle());
    state.player.blockTimer = 0;
    state.player.attackCooldown = weapon.cooldown;
    state.player.stamina = Math.max(0, state.player.stamina - weapon.stamina);
    startAttackEffect(weapon, spec);
    const target = nearestAttackShapeTarget(spec, attackEntityFilter);
    if (!target) {
      const blockedMonster = state.player.monsterForm && nearestAttackShapeTarget(spec, () => true)?.faction === "monster";
      toast(blockedMonster ? "魔物化状态下无法攻击魔物势力。靠近白石祠可以恢复。" : "攻击挥空了。");
      return;
    }
    if (state.player.monsterForm && target.faction === "monster") {
      toast("魔物化状态下无法攻击魔物势力。靠近白石祠可以恢复。 ");
      return;
    }
    const guardCut = target.guard && weapon.type !== "锤" ? 0.72 : 1;
    const variance = weapon.type === "匕首" ? 2 : 4;
    const closeBonus = (weapon.type === "匕首" || weapon.type.includes("剑")) && bodyGap(state.player, target) <= 0.05 ? 1.3 : 1;
    const cooldownCut = rushedAttack ? 0.4 : 1;
    const critical = Math.random() < 0.05;
    const baseDmg = Math.ceil((state.player.atk + Math.floor(Math.random() * variance)) * guardCut * closeBonus * cooldownCut * (critical ? 1.2 : 1));
    const dmg = applyRaceFinalAmount(baseDmg, raceDamageMultiplier("weapon", weapon));
    target.hp -= dmg;
    target.playerAggro = (target.playerAggro || 0) + dmg + 8;
    attackEffect.hit = true;
    attackEffect.critical = critical;
    markHitReaction(target, critical);
    if (critical) hitStopTimer = Math.max(hitStopTimer, 0.08);
    const weaponMods = gearModList(state.player.gear.weapon);
    const slowMod = weaponMods.reduce((best, mod) => (mod.slowOnHit || 0) > (best.slowOnHit || 0) ? mod : best, {});
    if (slowMod.slowOnHit) {
      target.slowTimer = Math.max(target.slowTimer || 0, slowMod.duration || 2.6);
      target.slowPower = Math.max(target.slowPower || 0, slowMod.slowOnHit);
    }
    const aoeMod = weaponMods.reduce((best, mod) => (mod.aoeSlowOnHit || 0) > (best.aoeSlowOnHit || 0) ? mod : best, {});
    if (aoeMod.aoeSlowOnHit) {
      let affected = 0;
      for (const e of state.entities) {
        if (!e.alive || e === target) continue;
        if (Math.hypot(e.x - target.x, e.y - target.y) <= (aoeMod.radius || 3.2)) {
          e.slowTimer = Math.max(e.slowTimer || 0, aoeMod.duration || 4.0);
          e.slowPower = Math.max(e.slowPower || 0, aoeMod.aoeSlowOnHit);
          affected += 1;
        }
      }
      target.slowTimer = Math.max(target.slowTimer || 0, aoeMod.duration || 4.0);
      target.slowPower = Math.max(target.slowPower || 0, aoeMod.aoeSlowOnHit);
      if (affected > 0) log(`凝胶爆弹扩散，周围${affected}个生物被减速。`);
    }
    log(`${weapon.type}攻击${target.name}，造成${dmg}点伤害${critical ? "，暴击" : ""}${rushedAttack ? "，攻击间隔未到只发挥四成威力" : ""}${closeBonus > 1 ? "，贴身命中要害" : ""}${target.guard && weapon.type !== "锤" ? "，但它的防御抵消了一部分" : ""}。`);
    if (target.hp <= 0) defeatEntity(target);
  }

  function playerDefend() {
    if (state.player.monsterForm) {
      toast("魔物化状态更适合突进，不能稳定防御。");
      return;
    }
    if (state.player.stamina < 2) {
      toast("体力不足，架势撑不起来。");
      return;
    }
    state.player.stamina = Math.max(0, state.player.stamina - 2);
    state.player.blockTimer = 0.95;
    state.player.attackCooldown = Math.max(state.player.attackCooldown, 0.25);
    log("进入防御架势，短时间内受到的伤害会明显降低。");
  }

  function playerDodge() {
    const cooldownCut = state.player.gear.feet === "travelBoots" ? 0.82 : 1;
    if (state.player.dodgeCooldown > 0) {
      toast("闪避还没缓过来。");
      return;
    }
    if (state.player.stamina < 6) {
      toast("体力不足，闪避会变成踉跄。");
      return;
    }
    state.player.stamina = Math.max(0, state.player.stamina - 6);
    state.player.dodgeTimer = 0.28;
    state.player.dodgeCooldown = 1.15 * cooldownCut;
    state.player.invuln = Math.max(state.player.invuln, 0.34);
    state.player.blockTimer = 0;
    log("闪避！短时间内不会受到伤害，移动速度提升。");
  }

  // Player actions and interactions
  function chatWithNpc(npc, message) {
    const freshTalk = (npc.lastTalk || 0) + 8 < state.time;
    if (freshTalk) {
      adjustNpcMemory(npc, 1, 0);
      npc.lastTalk = state.time;
    }
    npc.wantsTalk = false;
    const hostileTone = hostileRaceDialogue(npc);
    log(hostileTone ? `${npc.name}和你说话时语气明显带刺。` : (message || `${npc.name}和你聊了一会儿。对方的态度似乎柔和了一点。`));
    if (freshTalk) shareMagicRumor(npc);
  }

  function talkOrUse() {
    if (handlePetMemorial()) return;
    const npc = nearestEntity(1.5, e => e.kind === "npc" || e.kind === "friendly");
    if (npc) {
      if (state.player.monsterForm) {
        toast(`${npc.name}后退了。魔物化状态下很难正常交谈。`);
        return;
      }
      if (handleDeliveryTalk(npc)) return;
      const activeSmall = activeSmallQuestFor(npc.name);
      if (activeSmall?.goalDone) {
        settleSmallQuest(activeSmall, false);
        return;
      }
      if (npc.kind === "npc") {
        openNpcQuestPanel(npc);
        return;
      }
      chatWithNpc(npc);
      if (npc.affection >= 80 && state.player.rings > 0 && !state.player.spouse) {
        state.player.rings -= 1;
        if (Math.random() < 0.72) {
          state.player.spouse = npc.name;
          npc.devotion = 40;
          const memory = npcMemoryFor(npc);
          if (memory) memory.devotion = Math.max(memory.devotion || 0, 40);
          log(`${npc.name}收下了戒指。你们决定一起生活。`);
        } else {
          log(`${npc.name}收下心意但还没准备好。`);
        }
      }
      return;
    }
    const obj = nearestObject();
    if (obj) {
      useObject(obj);
      return;
    }
    toast("周围没有可以互动的对象。");
  }

  function gift() {
    if (state.player.giftCooldown > 0) {
      toast("刚送过礼，继续硬塞只会让人困扰。");
      return;
    }
    const npc = nearestEntity(1.5, e => e.kind === "npc" || e.kind === "friendly");
    if (!npc) {
      toast("附近没有适合赠礼的对象。");
      return;
    }
    if (state.player.potions <= 0 && state.player.rings <= 0) {
      toast("普通药草不再算像样的礼物。至少需要药水，戒指则用于求婚。");
      return;
    }
    let gain = 0;
    if (state.player.potions > 0) {
      state.player.potions -= 1;
      gain = 4 + Math.floor(Math.random() * 4);
    } else {
      state.player.rings -= 1;
      gain = 12;
    }
    state.player.giftCooldown = 18;
    adjustNpcMemory(npc, gain, Math.ceil(gain / 3));
    log(`${npc.name}接受了礼物。你看不见具体变化，只能从反应里猜测距离。`);
  }

  function rest() {
    if (state.mode === "dungeon") {
      toast("迷宫里无法安心休息。 ");
      return;
    }
    const obj = nearestObject(2.0);
    if (!obj || obj.kind !== "house") {
      toast("需要靠近空屋才能休息。 ");
      return;
    }
    state.player.hp = state.player.maxHp;
    state.player.stamina = 30;
    state.player.mp = state.player.maxMp;
    for (const pet of state.pets) {
      if (!pet.injured && !pet.lost) {
        pet.alive = true;
        pet.hp = pet.maxHp;
      }
    }
    recallPets();
    log("在空屋休息了一晚。伴侣系统、共用房屋不满事件可继续接到这里。 ");
    autoSave();
  }

  function isNearAction(action, range = 2.3) {
    return state.objects.some(obj => obj.action === action && objectEdgeDistance(obj) < range);
  }

  // Economy and forging
  function sellMaterial(name, amount = 1) {
    const material = materialCatalog[name];
    const owned = state.player.materials[name] || 0;
    if (!material || owned <= 0) return 0;
    if (material.unsellable || material.sell == null) {
      toast(`${name}不能出售。`);
      return 0;
    }
    const count = Math.min(amount, owned);
    state.player.materials[name] -= count;
    if (state.player.materials[name] <= 0) delete state.player.materials[name];
    const gold = material.sell * count;
    state.player.gold += gold;
    return gold;
  }

  function sellAllMaterials() {
    let gold = 0;
    for (const [name, count] of Object.entries({ ...state.player.materials })) {
      if (materialCatalog[name]?.unsellable) continue;
      gold += sellMaterial(name, count);
    }
    return gold;
  }

  function buyPotion() {
    if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
    if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
    if (state.player.gold < 8) return toast("钱不够。");
    state.player.gold -= 8;
    state.player.potions += 1;
    log("买到一瓶小回复药。");
  }

  function buyArrows(amount = 1) {
    const count = Math.max(1, Number(amount) || 1);
    const price = count;
    if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
    if (!isNearAction("shop")) return toast("需要靠近商店才能交易。");
    if (state.player.gold < price) return toast("钱不够。");
    state.player.gold -= price;
    state.player.arrows = (state.player.arrows || 0) + count;
    log(`买到${count}支箭。`);
  }

  function forgeRing() {
    if (!isNearAction("forge")) return toast("需要靠近锻造台才能锻造戒指。");
    if (state.player.wood < 1 || state.player.stone < 1) return toast("锻造需要木材和反重力石。");
    consumeAnyResource("wood", "木材", 1);
    consumeAnyResource("stone", "反重力石", 1);
    if (Math.random() < 0.62) {
      state.player.rings += 1;
      log("锻造成功，得到一枚粗制戒指。 ");
    } else {
      log("锻造失败。不同种族的锻造概率以后会接入这里。 ");
    }
    autoSave();
  }

  function armorForgeTarget() {
    return state.player.gear.body || state.player.gear.head || state.player.gear.legs || state.player.gear.feet || state.player.gear.accessory;
  }

  function materialMod(name, targetSlot) {
    const material = materialCatalog[name];
    if (!material) return null;
    const mod = { material: name, label: name, atk: 0, def: 0, thorns: 0, slowOnHit: 0, slowOnBlock: 0, aoeSlowOnHit: 0, repelMonsters: false, cooldownMult: 1, radius: material.radius || 0, duration: material.duration || 0 };
    if (name === "旧时代之钻") {
      if (targetSlot === "weapon") mod.cooldownMult = material.cooldownMult || 0.3;
      else if (targetSlot === "head") mod.repelMonsters = true;
    }
    if (name === "魔狼牙") {
      mod.thorns = material.thorns || 2;
      if (targetSlot === "weapon") mod.atk = material.atk || 1;
      else mod.def = material.def || 1;
    }
    if (name === "凝胶爆弹") {
      if (targetSlot === "weapon") {
        mod.aoeSlowOnHit = material.aoeSlow || 0.62;
      } else {
        mod.slowOnBlock = material.slow || 0.8;
      }
    }
    if (material.slow) {
      if (targetSlot === "weapon" && name !== "凝胶爆弹") mod.slowOnHit = material.slow;
      else if (name !== "凝胶爆弹") mod.slowOnBlock = material.slow;
    }
    if (material.def && targetSlot !== "weapon") mod.def += material.def;
    if (!mod.atk && !mod.def && !mod.thorns && !mod.slowOnHit && !mod.slowOnBlock && !mod.aoeSlowOnHit && !mod.repelMonsters && mod.cooldownMult === 1) return null;
    return mod;
  }

  function forgeMaterial(name, targetSlot) {
    if (!isNearAction("forge")) {
      toast("需要靠近锻造台才能把素材锻到装备上。");
      return;
    }
    if ((state.player.materials[name] || 0) <= 0) return;
    const targetGearId = state.player.gear[targetSlot];
    const gear = gearCatalog[targetGearId];
    if (!gear) {
      toast(`没有可锻造的${slotName(targetSlot)}装备。`);
      return;
    }
    const mod = materialMod(name, targetSlot);
    if (!mod) {
      toast(`${name}暂时不能锻到${slotName(targetSlot)}上。`);
      return;
    }
    const mods = gearModList(targetGearId);
    if (mods.length >= 3) {
      toast(`${gear.name}已经有三个锻造词条了。`);
      return;
    }
    if (mods.some(existing => existing.material === name)) {
      toast(`${gear.name}上已经锻过${name}了。`);
      return;
    }
    state.player.materials[name] -= 1;
    if (state.player.materials[name] <= 0) delete state.player.materials[name];
    if (!state.player.gearMods[targetGearId]) state.player.gearMods[targetGearId] = [];
    state.player.gearMods[targetGearId].push(mod);
    refreshCombatStats();
    log(`把${name}锻到了${gear.name}上。`);
    autoSave();
  }

  function weaponForgeEntries(category = forgeWeaponCategory) {
    return (weaponForgeCatalog[category] || [])
      .map(recipe => ({ ...recipe, gear: gearCatalog[recipe.gearId] }))
      .filter(entry => entry.gear);
  }

  function weaponForgeRecipe(gearId) {
    for (const entries of Object.values(weaponForgeCatalog)) {
      const recipe = entries.find(item => item.gearId === gearId);
      if (recipe) return recipe;
    }
    return null;
  }

  function forgeIngredientCount(name) {
    if (resourceCatalog[name]) return resourceCount(name);
    return state.player.materials[name] || 0;
  }

  function hasForgeIngredients(materials = {}) {
    return Object.entries(materials).every(([name, amount]) => forgeIngredientCount(name) >= amount);
  }

  function consumeForgeIngredients(materials = {}) {
    if (!hasForgeIngredients(materials)) return false;
    for (const [name, amount] of Object.entries(materials)) {
      if (resourceCatalog[name]) {
        consumeResource(name, amount);
      } else {
        state.player.materials[name] -= amount;
        if (state.player.materials[name] <= 0) delete state.player.materials[name];
      }
    }
    return true;
  }

  function forgeWeapon(gearId) {
    if (!isNearAction("forge")) return toast("需要靠近锻造台才能锻造武器。");
    const recipe = weaponForgeRecipe(gearId);
    const gear = gearCatalog[gearId];
    if (!recipe || !gear) return toast("没有找到这个武器的锻造方法。");
    if (state.player.gearBag.includes(gearId)) return toast(`已经拥有${gear.name}。`);
    if (!consumeForgeIngredients(recipe.materials)) return toast("材料不足。");
    state.player.gearBag.push(gearId);
    log(`锻造成功：${gear.name}。已放入装备栏。`);
    autoSave();
  }

  function useObject(obj) {
    if (obj.action && obj.action.startsWith("portal:")) {
      const [, scene, x, y] = obj.action.split(":");
      loadScene(scene, Number(x), Number(y), `穿过${obj.name}，来到${sceneNames[scene] || "新区域"}。`);
      return;
    }
    if (obj.action === "shop") {
      if (state.player.monsterForm) {
        toast("商人拒绝和魔物化角色交易。 ");
        return;
      }
      openShopPanel();
      return;
    }
    if (obj.action === "house") rest();
    if (obj.action === "guild") {
      openGuildPanel();
      return;
    }
    if (obj.action === "news") worldNews(true);
    if (obj.action === "cleanse") {
      const shrineName = obj.name || "祠";
      if (state.player.monsterForm) {
        state.player.monsterForm = false;
        refreshCombatStats();
        state.player.hp = state.player.maxHp;
        restoreInjuredPets();
        log(`${shrineName}驱散了魔素，角色回到正常势力。 `);
      } else if (!restoreInjuredPets()) toast(`${shrineName}很安静。 `);
    }
    if (obj.action === "dungeon") enterDungeon();
    if (obj.action === "demonKeep") {
      toast("魔王城内层还没开放。这里会接概率极低的魔王/继任者事件。");
    }
    if (obj.action === "forge") {
      openForgePanel();
      return;
    }
    if (obj.action === "magicCottage") {
      openMagicPanel("study", obj.name);
      return;
    }
  }

  function addGearToBag(gearId) {
    const gear = gearCatalog[gearId];
    if (!gear) return false;
    if (!state.player.gearBag.includes(gearId)) state.player.gearBag.push(gearId);
    log(`获得装备：${gear.name}。已放入装备栏，点击装备栏里的“装备”来更换。`);
    autoSave();
    return true;
  }

  function gearIdForPickup(p) {
    if (p.kind === "conceptSword") return "conceptSword";
    return gearNameToId[p.name] || null;
  }

  function isRemovedMapWeaponPickup(p) {
    return p && removedMapWeaponPickupNames.has(p.name) && (p.kind === "weapon" || p.kind === "gear" || p.kind === "conceptSword");
  }

  function equipGear(gearId) {
    const gear = gearCatalog[gearId];
    if (!gear || !state.player.gearBag.includes(gearId)) return;
    if (state.player.monsterForm) {
      toast("魔物化状态下无法整理装备。");
      return;
    }
    state.player.gear[gear.slot] = gearId;
    refreshCombatStats();
    log(`装备了${gear.name}。`);
  }

  function pickupItems() {
    for (const p of state.pickups) {
      if (p.taken) continue;
      if (p.reservedFor && p.reservedFor !== currentPlayerId()) continue;
      if (Math.hypot(state.player.x - p.x, state.player.y - p.y) < 0.75) {
        p.taken = true;
        p.takenBy = currentPlayerId();
        if (p.kind === "herb") state.player.herbs += p.value;
        if (p.kind === "potion") state.player.potions += p.value;
        if (p.kind === "arrow") state.player.arrows = (state.player.arrows || 0) + p.value;
        if (p.kind === "gold") state.player.gold += p.value;
        if (p.kind === "material") addMaterial(p.name, p.value);
        if (p.kind === "wood" || p.kind === "stone" || p.kind === "resource") addResource(p.name, p.value);
        if (p.kind === "weapon" || p.kind === "gear" || p.kind === "armor" || p.kind === "accessory" || p.kind === "ring") {
          const gearId = gearIdForPickup(p);
          if (gearId) addGearToBag(gearId);
          else {
            state.player.rings += p.value;
            autoSave();
          }
        }
        if (p.kind === "conceptSword") {
          addGearToBag("conceptSword");
          state.player.conceptSword = true;
          autoSave();
        }
    if (p.kind === "cleanse") {
      state.player.monsterForm = false;
      state.player.hp = state.player.maxHp;
      restoreInjuredPets();
    }
        log(p.kind === "arrow" ? "拾回了箭。" : `拾取了${p.name}。`);
      }
    }
  }

  // World events and rescue interactions
  function worldNews(force = false) {
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

  function helpWounded() {
    const wounded = nearestEntity(1.45, e => e.wounded && e.alive);
    if (!wounded) return false;
    if (state.player.herbs <= 0 && state.player.potions <= 0) return false;
    if (state.player.potions > 0) state.player.potions -= 1;
    else state.player.herbs -= 1;
    wounded.wounded = false;
    wounded.hp = wounded.maxHp;
    wounded.affection = 55;
    wounded.devotion = 35;
    regions.village.trust = clamp(regions.village.trust + 8, 0, 100);
    log("你把物资交给伤者。没有任务提示，但有人记住了这件事。 ");
    return true;
  }

  function handlePetRescue() {
    const carried = state.pets.find(pet => ownedByCurrentPlayer(pet) && pet.injured && pet.carried && !pet.lost);
    if (carried) {
      if (isNearAction("cleanse", 2.5)) return false;
      toast(`你正抱着${carried.name}。带它去白石祠、树根祠或残破圣像。`);
      return true;
    }
    const sceneKey = currentPetScene();
    const pet = state.pets.find(candidate => ownedByCurrentPlayer(candidate) && candidate.injured && !candidate.carried && !candidate.lost && candidate.scene === sceneKey && dist(candidate, state.player) < 1.5);
    if (!pet) return false;
    pet.carried = true;
    pet.x = state.player.x;
    pet.y = state.player.y;
    log(`你抱起了重伤的${pet.name}。剩余${Math.ceil(pet.rescueTimer / 60)}分钟。`);
    return true;
  }

  function restoreInjuredPets() {
    const sceneKey = currentPetScene();
    const targets = state.pets.filter(pet => ownedByCurrentPlayer(pet) && pet.injured && !pet.lost && (pet.carried || (pet.scene === sceneKey && dist(pet, state.player) < 2.0)));
    if (!targets.length) return false;
    for (const pet of targets) {
      pet.injured = false;
      pet.carried = false;
      pet.alive = true;
      pet.hp = pet.maxHp;
      pet.rescueTimer = 0;
      pet.scene = sceneKey;
      pet.x = state.player.x + rand(-1.0, 1.0);
      pet.y = state.player.y + rand(-1.0, 1.0);
      pet.cooldownTimer = 0.5;
    }
    log(`神龛恢复了${targets.map(pet => pet.name).join("、")}。`);
    return true;
  }

  function nearestPetRemain(kind, range = 1.45) {
    const sceneKey = currentPetScene();
    let best = null;
    let bestD = Infinity;
    for (const remain of state.petRemains) {
      if (!ownedByCurrentPlayer(remain)) continue;
      if (remain.kind !== kind || remain.scene !== sceneKey) continue;
      const d = dist(remain, state.player);
      if (d < range && d < bestD) {
        best = remain;
        bestD = d;
      }
    }
    return best;
  }

  function handlePetMemorial() {
    const corpse = nearestPetRemain("corpse");
    if (!corpse) return false;
    corpse.kind = "grave";
    corpse.age = 0;
    corpse.decay = 0;
    corpse.decayClock = 0;
    log('"YOU ARE THE BEST...MY DEAR DEAR FRIEND..."');
    log(`原地留下了${corpse.petName}的坟墓。`);
    return true;
  }

  function updatePetRemains(dt) {
    for (const remain of state.petRemains) {
      if (remain.kind !== "grave") continue;
      remain.age += dt;
      remain.decayClock += dt;
      if (remain.decayClock >= graveDecayInterval) {
        remain.decayClock = 0;
        remain.decay += 1;
        if (remain.decay < graveMaxDecay && remain.scene === currentPetScene()) {
          log(`${remain.petName}的坟墓又腐败了一点。`);
        }
      }
    }
    const before = state.petRemains.length;
    state.petRemains = state.petRemains.filter(remain => remain.kind !== "grave" || remain.decay < graveMaxDecay);
    if (state.petRemains.length < before) log("一座宠物的坟墓彻底消失了。");
  }

  // Scene flow and dungeon
  function loadScene(scene, x, y, message) {
    bowCharge = null;
    flyingArrows.length = 0;
    makeMap(scene);
    spawnWorld(scene);
    state.player.x = x;
    state.player.y = y;
    recallPets();
    state.spawnClock = 6;
    log(message);
    autoSave();
  }

  function enterDungeon() {
    bowCharge = null;
    flyingArrows.length = 0;
    state.mode = "dungeon";
    state.player.x = 5.5;
    state.player.y = 5.5;
    generateDungeon();
    recallPets();
    log("进入旧王城的排列迷宫。房间由模板重新组合，深处藏着唯一武器。 ");
    autoSave();
  }

  function leaveDungeon() {
    loadScene("ruins", 50.5, 36.5, "离开迷宫，回到旧王城入口。 ");
  }

  function generateDungeon() {
    const dw = 30;
    const dh = 20;
    state.dungeon = { w: dw, h: dh };
    state.map = [];
    state.solids = [];
    state.objects = [];
    state.entities = [];
    state.pickups = [];
    for (let y = 0; y < dh; y += 1) {
      const row = [];
      for (let x = 0; x < dw; x += 1) {
        row.push(x === 0 || y === 0 || x === dw - 1 || y === dh - 1 ? "wall" : "dungeon");
      }
      state.map.push(row);
    }
    for (let x = 3; x < 27; x += 1) state.map[9][x] = "road";
    for (let y = 3; y < 17; y += 1) state.map[y][14] = "road";
    const blocks = [
      [8, 4, 3, 1], [19, 5, 1, 4], [5, 13, 5, 1], [21, 12, 3, 1], [12, 2, 1, 4], [16, 15, 1, 3]
    ].sort(() => Math.random() - 0.5);
    for (const [x, y, w, h] of blocks.slice(0, 4)) {
      addObject("block", "石墙", x, y, w, h, "#171d24", "none");
    }
    addObject("exit", "出口", 2, 8, 2, 3, "#596879", "exit");
    addObject("door", "机关门", 23, 8, 1, 3, "#76694b", "none");
    for (let i = 0; i < 5; i += 1) spawnCreature("skeleton", rand(7, 26), rand(4, 16), { region: "ruins" });
    for (let i = 0; i < 4; i += 1) spawnCreature("wisp", rand(9, 25), rand(5, 15), { region: "ruins" });
    for (let i = 0; i < 3; i += 1) spawnCreature("gargoyle", rand(15, 27), rand(7, 17), { region: "ruins" });
    addPickup("potion", "小回复药", 12.5, 5.5, "#5ad0ed");
    addPickup("cleanse", "净化药", 18.5, 14.5, "#d9d4ff");
  }

  // Simulation updates
  function updateCombatFeedback(dt) {
    if (bowCharge && (!canUseWorldActions() || !isBowWeapon() || (state.player.arrows || 0) <= 0)) bowCharge = null;
    if (bowCharge) bowCharge.time += dt;
    updateFlyingArrows(dt);
    if (attackEffect) {
      attackEffect.time += dt;
      if (attackEffect.time >= attackEffect.duration) attackEffect = null;
    }
    if (pendingMagicCast) {
      pendingMagicCast.timer -= dt;
      if (pendingMagicCast.timer <= 0) {
        const cast = pendingMagicCast;
        pendingMagicCast = null;
        resolveMagicCast(cast);
      }
    }
    for (let i = magicEffects.length - 1; i >= 0; i -= 1) {
      updateMagicZoneEffect(magicEffects[i], dt);
      magicEffects[i].time += dt;
      if (magicEffects[i].time >= magicEffects[i].duration) magicEffects.splice(i, 1);
    }
    for (const e of [...hitReactionEntities]) {
      const reaction = hitReactions.get(e);
      if (!reaction || !e.alive) {
        hitReactionEntities.delete(e);
        hitReactions.delete(e);
        continue;
      }
      reaction.time += dt;
      if (reaction.time >= reaction.duration) {
        hitReactionEntities.delete(e);
        hitReactions.delete(e);
      }
    }
  }

  function updatePlayer(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
    const wantsRun = keys.has("shift") && state.player.stamina > 1 && state.player.dodgeTimer <= 0;
    state.player.running = !!(dx || dy) && wantsRun;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      const fatigue = state.player.stamina < 8 ? 0.72 : 1;
      const attackDrag = state.player.attackCooldown > 0 ? 0.62 : 1;
      const dodgeBoost = state.player.dodgeTimer > 0 ? 2.35 : 1;
      const runBoost = state.player.running ? 1.45 : 1;
      const pathosBoost = hasPathosEffect() ? 1.5 : 1;
      moveActor(state.player, dx / len, dy / len, (state.player.monsterForm ? 4.1 : 3.6) * fatigue * attackDrag * dodgeBoost * runBoost * pathosBoost * raceMoveSpeedMultiplier(), dt);
      if (state.player.running) state.player.stamina = Math.max(0, state.player.stamina - dt * 1.8);
    }
    state.player.invuln = Math.max(0, state.player.invuln - dt);
    state.player.attackCooldown = Math.max(0, state.player.attackCooldown - dt);
    state.player.giftCooldown = Math.max(0, state.player.giftCooldown - dt);
    state.player.dodgeCooldown = Math.max(0, state.player.dodgeCooldown - dt);
    state.player.dodgeTimer = Math.max(0, state.player.dodgeTimer - dt);
    state.player.blockTimer = Math.max(0, state.player.blockTimer - dt);
    if (state.player.stamina < 30 && !state.player.running) state.player.stamina += dt * (0.8 + 30 * 0.02) * raceStaminaRegenMultiplier();
    pickupItems();
  }

  function updatePets(dt) {
    for (const pet of state.pets) {
      if (!ownedByCurrentPlayer(pet)) continue;
      if (pet.lost) continue;
      if (pet.injured) {
        pet.rescueTimer = Math.max(0, pet.rescueTimer - dt);
        if (pet.carried) {
          pet.scene = currentPetScene();
          pet.x = state.player.x - 0.55;
          pet.y = state.player.y + 0.55;
        }
        if (pet.rescueTimer <= 0) {
          petDiesIrreversibly(pet);
        }
        continue;
      }
      if (!pet.alive) continue;
      pet.cooldownTimer = Math.max(0, pet.cooldownTimer - dt);
      pet.wanderTimer -= dt;
      if (pet.wanderTimer <= 0) {
        pet.wanderTimer = rand(0.8, 1.8);
        pet.wanderX = rand(-1, 1);
        pet.wanderY = rand(-1, 1);
      }

      const engaged = state.entities
        .filter(e => e.alive && e.faction === "monster" && (e.playerAggro || 0) > 0 && dist(e, state.player) <= pet.guardRange)
        .sort((a, b) => dist(a, pet) - dist(b, pet))[0];

      if (engaged) {
        const d = dist(pet, engaged);
        if (d > pet.attackRange) {
          moveActor(pet, (engaged.x - pet.x) / Math.max(0.001, d), (engaged.y - pet.y) / Math.max(0.001, d), pet.speed, dt);
        } else if (pet.cooldownTimer <= 0) {
          engaged.hp -= pet.atk;
          if (!engaged.petAggro) engaged.petAggro = {};
          engaged.petAggro[pet.id] = (engaged.petAggro[pet.id] || 0) + pet.atk + 3;
          pet.cooldownTimer = pet.cooldown;
          log(`${pet.name}护主攻击${engaged.name}，造成${pet.atk}点伤害。`);
          if (engaged.hp <= 0) defeatEntity(engaged, "pet");
        }
        continue;
      }

      const homeD = dist(pet, state.player);
      if (homeD > pet.roamRadius) {
        moveActor(pet, (state.player.x - pet.x) / Math.max(0.001, homeD), (state.player.y - pet.y) / Math.max(0.001, homeD), pet.speed * 1.15, dt);
      } else {
        const len = Math.hypot(pet.wanderX, pet.wanderY) || 1;
        moveActor(pet, pet.wanderX / len, pet.wanderY / len, pet.speed * 0.32, dt);
      }
    }
  }

  function updateEntities(dt) {
    const p = state.player;
    for (const e of state.entities) {
      if (!e.alive) continue;
      e.cooldown = Math.max(0, e.cooldown - dt);
      e.slowTimer = Math.max(0, (e.slowTimer || 0) - dt);
      e.playerAggro = Math.max(0, (e.playerAggro || 0) - dt * 0.18);
      for (const petId of Object.keys(e.petAggro || {})) {
        e.petAggro[petId] = Math.max(0, e.petAggro[petId] - dt * 0.22);
        if (e.petAggro[petId] <= 0.01) delete e.petAggro[petId];
      }
      const playerD = dist(e, p);
      const petThreat = strongestPetAggro(e);
      const canTargetPlayer = (e.faction === "monster" && !p.monsterForm) || (p.monsterForm && e.faction !== "monster" && e.kind !== "animal");
      if (canTargetPlayer && playerD < 11.5) e.playerAggro = Math.max(e.playerAggro || 0, 3);
      const target = petThreat.pet && petThreat.value > (e.playerAggro || 0) ? petThreat.pet : p;
      const d = dist(e, target);
      const shouldAttack = (canTargetPlayer && playerD < 11.5) || !!petThreat.pet;
      if (shouldAttack) {
        const dx = (target.x - e.x) / Math.max(0.001, d);
        const dy = (target.y - e.y) / Math.max(0.001, d);
        if (target === p && playerRepelsMonsters() && e.faction === "monster" && e.species !== "demonKing" && d < 6.5) {
          moveActor(e, -dx, -dy, (e.speed || 1.5) + 1.4, dt);
          continue;
        }
        e.specialClock = Math.max(0, (e.specialClock || 0) - dt);
        const hateBoost = Math.min(1.6, (regions[e.region]?.hate || 20) / 65);
        let speed = (e.speed || 1.5) + hateBoost;
        if (e.pounce && e.specialClock <= 0 && d < 4.8) {
          speed += 3.2;
          e.specialClock = rand(2.4, 4.1);
        }
        if (e.slowTimer > 0) speed *= Math.max(0.3, 1 - (e.slowPower || 0.35));
        moveActor(e, dx, dy, speed, dt);
        if (e.ranged && d < 4.6 && e.cooldown <= 0) {
          if (target === p) damagePlayer(Math.ceil((e.atk || 3) * 0.72), e);
          else damagePet(target, Math.ceil((e.atk || 3) * 0.72), e);
          e.cooldown = rand(1.6, 2.3);
          if (e.species === "wisp") {
            log(`${e.name}从远处释放了像火球术一样的魔弹。`);
            addMagicClue("fireball", "你亲眼见到魔弹凝成火球，终于理解了火球术的一部分。");
          } else {
            log(`${e.name}从远处释放了魔弹。`);
          }
        }
        if (d < 0.9 && e.cooldown <= 0) {
          if (target === p) damagePlayer(e.atk || 2, e);
          else damagePet(target, e.atk || 2, e);
          e.cooldown = e.guard ? 0.95 : 1.08;
        }
      } else if (e.flee && d < 3.5) {
        const dx = (e.x - p.x) / Math.max(0.001, d);
        const dy = (e.y - p.y) / Math.max(0.001, d);
        moveActor(e, dx, dy, 1.8, dt);
      } else if (e.kind === "npc" && e.affection >= 60 && !e.wounded && !p.monsterForm) {
        if (d > 3.5 && Math.random() < dt * 0.18) {
          const dx = (p.x - e.x) / Math.max(0.001, d);
          const dy = (p.y - e.y) / Math.max(0.001, d);
          moveActor(e, dx, dy, 1.3, dt);
          e.wantsTalk = true;
        }
      } else if (Math.random() < dt * 0.18) {
        moveActor(e, rand(-1, 1), rand(-1, 1), 0.45, dt);
      }
    }

    const savior = state.entities.find(e => e.alive && e.kind === "npc" && e.devotion >= 60 && dist(e, p) < 2.0);
    if (savior && p.hp <= 8 && Math.random() < dt * 0.8) {
      p.hp = 18;
      savior.alive = false;
      log(`${savior.name}冲到你身前挡下致命一击。献身值系统触发。`);
    }
  }

  function livingCount(species) {
    return state.entities.filter(e => e.alive && e.species === species).length;
  }

  function playerRepelsMonsters() {
    return equippedModList().some(mod => mod.repelMonsters);
  }

  function spawnForCurrentScene() {
    if (state.mode !== "world") return;
    const table = {
      field: [
        ["rabbit", 18, [31, 59], [7, 34], "forest"],
        ["slime", 10, [61, 86], [39, 63], "ruins"],
        ["wolf", 8, [50, 78], [7, 35], "forest"]
      ],
      forest: [
        ["rabbit", 22, [8, 70], [6, 45], "forest"],
        ["wolf", 16, [25, 88], [8, 58], "forest"],
        ["wisp", 12, [60, 88], [45, 66], "swamp"]
      ],
      ruins: [
        ["slime", 14, [22, 62], [18, 60], "ruins"],
        ["skeleton", 16, [37, 85], [13, 63], "ruins"],
        ["gargoyle", 9, [60, 89], [38, 65], "mountain"]
      ],
      demon: [
        ["gargoyle", 12, [20, 78], [12, 59], "demon"],
        ["demonKnight", 13, [32, 88], [17, 56], "demon"]
      ]
    }[state.scene] || [];

    for (const [species, cap, xs, ys, region] of table) {
      if (livingCount(species) < cap && Math.random() < 0.78) {
        spawnCreature(species, rand(xs[0], xs[1]), rand(ys[0], ys[1]), { region });
      }
    }
  }

  function updateWorld(dt) {
    state.time += dt;
    state.dayClock += dt;
    state.newsClock -= dt;
    state.spawnClock -= dt;
    updateQuestProgress(dt);
    updateMpRegen(dt);
    if (state.mode === "world") worldNews(false);
    if (state.spawnClock <= 0) {
      spawnForCurrentScene();
      state.spawnClock = state.scene === "demon" ? 5.5 : 7.5;
    }
    if (state.dayClock > 24) {
      state.dayClock = 0;
      for (const r of Object.values(regions)) {
        r.hate = clamp(r.hate - 1, 0, 100);
      }
    }
    if (state.toastTimer > 0) {
      state.toastTimer -= dt;
      if (state.toastTimer <= 0) toastEl.textContent = "";
    }
  }

  // Rendering
  function colorToRgba(color, alpha) {
    if (!color || !color.startsWith("#")) return `rgba(255,255,255,${alpha})`;
    const hex = color.length === 4
      ? color.slice(1).split("").map(ch => ch + ch).join("")
      : color.slice(1, 7);
    const n = Number.parseInt(hex, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function brightenColor(color, amount = 0.32) {
    if (!color || !color.startsWith("#")) return color;
    const hex = color.length === 4
      ? color.slice(1).split("").map(ch => ch + ch).join("")
      : color.slice(1, 7);
    const n = Number.parseInt(hex, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const mix = channel => Math.min(255, Math.round(channel + (255 - channel) * amount));
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }

  function hitReactionVisual(e) {
    const reaction = hitReactions.get(e);
    if (!reaction) return { x: 0, y: 0, bright: false };
    const progress = clamp(reaction.time / reaction.duration, 0, 1);
    const pulses = reaction.critical ? 2 : 1;
    const pulse = Math.abs(Math.sin(progress * Math.PI * pulses));
    const amp = reaction.critical ? 9 : 6;
    return {
      x: reaction.dx * amp * pulse,
      y: reaction.dy * amp * 0.55 * pulse,
      bright: true,
      critical: reaction.critical
    };
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    const cam = cameraOrigin();
    const camX = cam.x;
    const camY = cam.y;

    for (let y = Math.floor(camY); y <= Math.ceil(camY + viewH); y += 1) {
      for (let x = Math.floor(camX); x <= Math.ceil(camX + viewW); x += 1) {
        const t = tileAt(x, y);
        ctx.fillStyle = colors[t] || colors.grass;
        ctx.fillRect(Math.floor((x - camX) * tile), Math.floor((y - camY) * tile), tile + 1, tile + 1);
        ctx.strokeStyle = "rgba(0,0,0,0.11)";
        ctx.strokeRect(Math.floor((x - camX) * tile), Math.floor((y - camY) * tile), tile, tile);
      }
    }

    for (const o of state.objects) drawObject(o, camX, camY);
    for (const p of state.pickups) if (!p.taken) drawPickup(p, camX, camY);
    const sceneKey = currentPetScene();
    for (const remain of state.petRemains) if (remain.scene === sceneKey) drawPetRemain(remain, camX, camY);
    for (const e of state.entities) if (e.alive) drawEntity(e, camX, camY);
    for (const pet of state.pets) if (!pet.lost && (pet.carried || pet.scene === sceneKey) && (pet.alive || pet.injured)) drawPet(pet, camX, camY);
    drawPlayer(camX, camY);
    drawAttackEffect(camX, camY);
    drawFlyingArrows(camX, camY);
    drawBowChargeIndicator(camX, camY);
    drawMagicEffects(camX, camY);
    drawOverlay();
    renderStats();
    renderGearPanel();
  }

  function drawObject(o, camX, camY) {
    const x = (o.x - camX) * tile;
    const y = (o.y - camY) * tile;
    ctx.fillStyle = o.color;
    ctx.fillRect(x + 3, y + 3, o.w * tile - 6, o.h * tile - 6);
    ctx.strokeStyle = "#0b0e12";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 3, y + 3, o.w * tile - 6, o.h * tile - 6);
    ctx.lineWidth = 1;
    if (o.kind === "portal" || Math.hypot(state.player.x - (o.x + o.w / 2), state.player.y - (o.y + o.h / 2)) < 4) {
      ctx.fillStyle = "rgba(8, 10, 12, 0.7)";
      ctx.fillRect(x - 4, y - 18, Math.max(54, o.name.length * 13), 17);
      ctx.fillStyle = "#edf3f7";
      ctx.font = "12px Microsoft YaHei, sans-serif";
      ctx.fillText(o.name, x, y - 5);
    }
  }

  function drawPickup(p, camX, camY) {
    const x = (p.x - camX) * tile;
    const y = (p.y - camY) * tile;
    ctx.beginPath();
    ctx.moveTo(x, y - 13);
    ctx.lineTo(x - 12, y + 11);
    ctx.lineTo(x + 12, y + 11);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = "#101317";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  function drawEntity(e, camX, camY) {
    const reaction = hitReactionVisual(e);
    const x = (e.x - camX) * tile + reaction.x;
    const y = (e.y - camY) * tile + reaction.y;
    const baseColor = e.wounded ? "#f1a381" : e.color;
    ctx.beginPath();
    ctx.arc(x, y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = reaction.bright ? brightenColor(baseColor, reaction.critical ? 0.55 : 0.34) : baseColor;
    ctx.fill();
    ctx.strokeStyle = e.slowTimer > 0 ? "#6ee0d2" : (e.wantsTalk ? "#f3c45b" : "#0b0e12");
    ctx.lineWidth = e.slowTimer > 0 || e.wantsTalk ? 3 : 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    if (e.hp < e.maxHp) {
      ctx.fillStyle = "#111820";
      ctx.fillRect(x - 13, y - e.r - 10, 26, 4);
      ctx.fillStyle = "#62c78f";
      ctx.fillRect(x - 13, y - e.r - 10, 26 * clamp(e.hp / e.maxHp, 0, 1), 4);
    }
  }

  function drawPet(pet, camX, camY) {
    const x = (pet.x - camX) * tile;
    const y = (pet.y - camY) * tile;
    const injured = pet.injured && !pet.lost;
    ctx.beginPath();
    ctx.arc(x, y, injured ? Math.max(6, pet.r - 2) : pet.r, 0, Math.PI * 2);
    ctx.fillStyle = injured ? "#5d5961" : pet.color;
    ctx.fill();
    ctx.strokeStyle = injured ? "#ff8f70" : "#fff4b0";
    ctx.lineWidth = injured ? 3 : 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    if (injured) {
      ctx.fillStyle = "rgba(8, 10, 12, 0.76)";
      ctx.fillRect(x - 24, y - pet.r - 22, 48, 15);
      ctx.fillStyle = "#ffe0c5";
      ctx.font = "11px Microsoft YaHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.ceil(pet.rescueTimer / 60)}分`, x, y - pet.r - 11);
      ctx.textAlign = "start";
    }
    ctx.fillStyle = "rgba(8, 10, 12, 0.72)";
    ctx.fillRect(x - 19, y + pet.r + 3, 38, 5);
    ctx.fillStyle = injured ? "#ff8f70" : "#62c78f";
    ctx.fillRect(x - 19, y + pet.r + 3, 38 * clamp(pet.hp / pet.maxHp, 0, 1), 5);
  }

  function drawPetRemain(remain, camX, camY) {
    const x = (remain.x - camX) * tile;
    const y = (remain.y - camY) * tile;
    const near = Math.hypot(state.player.x - remain.x, state.player.y - remain.y) < 3.2;
    if (remain.kind === "corpse") {
      ctx.beginPath();
      ctx.ellipse(x, y + 5, 14, 7, -0.25, 0, Math.PI * 2);
      ctx.fillStyle = "#3f3b3d";
      ctx.fill();
      ctx.strokeStyle = remain.color || "#ff8f70";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
    } else {
      const rot = clamp(remain.decay / graveMaxDecay, 0, 1);
      const alpha = 0.95 - rot * 0.55;
      const h = 24 - remain.decay * 3;
      ctx.fillStyle = `rgba(142, 138, 130, ${alpha})`;
      ctx.fillRect(x - 9, y - h + 7, 18, h);
      ctx.fillStyle = `rgba(75, 70, 66, ${alpha})`;
      ctx.fillRect(x - 14, y + 7, 28, 7);
      ctx.strokeStyle = `rgba(18, 17, 16, ${alpha})`;
      ctx.strokeRect(x - 9, y - h + 7, 18, h);
      ctx.strokeRect(x - 14, y + 7, 28, 7);
    }
    if (near) {
      const text = remain.kind === "corpse" ? "宠物尸体" : "宠物的坟墓";
      ctx.fillStyle = "rgba(8, 10, 12, 0.72)";
      ctx.fillRect(x - 36, y - 30, 72, 17);
      ctx.fillStyle = "#edf3f7";
      ctx.font = "12px Microsoft YaHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, x, y - 17);
      ctx.textAlign = "start";
    }
  }

  function drawPlayer(camX, camY) {
    const p = state.player;
    const weapon = currentWeapon();
    const x = (p.x - camX) * tile;
    const y = (p.y - camY) * tile;
    ctx.beginPath();
    ctx.arc(x, y, p.r + (p.invuln > 0 ? 2 : 0), 0, Math.PI * 2);
    ctx.fillStyle = p.monsterForm ? "#ad6cff" : (p.blockTimer > 0 ? "#9ed6ff" : "#f3c45b");
    ctx.fill();
    ctx.strokeStyle = weapon.name === "剑的概念" ? "#ffffff" : "#101317";
    ctx.lineWidth = weapon.name === "剑的概念" ? 4 : 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    drawHeldWeapon(x, y, weapon);
  }

  function drawHeldWeapon(x, y, weapon) {
    const angle = playerAimAngle();
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const px = -uy;
    const py = ux;
    const color = weapon.name === "剑的概念" ? "#fff4b0" : (weapon.type === "魔物" ? "#d986ff" : "#dbe4ea");
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    if (weapon.type.includes("剑")) {
      const length = weapon.name === "剑的概念" ? 38 : 28;
      ctx.lineWidth = weapon.name === "剑的概念" ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(x + ux * 8, y + uy * 8);
      ctx.lineTo(x + ux * length, y + uy * length);
      ctx.stroke();
    } else if (weapon.type === "长枪") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + ux * 7, y + uy * 7);
      ctx.lineTo(x + ux * 48, y + uy * 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + ux * 52, y + uy * 52);
      ctx.lineTo(x + ux * 44 + px * 4, y + uy * 44 + py * 4);
      ctx.lineTo(x + ux * 44 - px * 4, y + uy * 44 - py * 4);
      ctx.closePath();
      ctx.fill();
    } else if (weapon.type === "锤") {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + ux * 7, y + uy * 7);
      ctx.lineTo(x + ux * 27, y + uy * 27);
      ctx.stroke();
      ctx.fillRect(x + ux * 28 - px * 7 - 5, y + uy * 28 - py * 7 - 5, 14, 10);
    } else if (weapon.type === "匕首") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + ux * 8, y + uy * 8);
      ctx.lineTo(x + ux * 19, y + uy * 19);
      ctx.stroke();
    } else if (weapon.type === "弓") {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + ux * 16, y + uy * 16, 15, angle - 1.15, angle + 1.15);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + ux * 16 + Math.cos(angle - 1.15) * 15, y + uy * 16 + Math.sin(angle - 1.15) * 15);
      ctx.lineTo(x + ux * 16 + Math.cos(angle + 1.15) * 15, y + uy * 16 + Math.sin(angle + 1.15) * 15);
      ctx.stroke();
    } else if (weapon.type === "魔物") {
      ctx.lineWidth = 2;
      for (const offset of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(x + ux * 9 + px * offset, y + uy * 9 + py * offset);
        ctx.lineTo(x + ux * 21 + px * offset, y + uy * 21 + py * offset);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawArrowShape(x, y, angle, scale = 1) {
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const px = -uy;
    const py = ux;
    const length = 18 * scale;
    const width = 3.2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + ux * length * 0.55, y + uy * length * 0.55);
    ctx.lineTo(x - ux * length * 0.1 + px * width, y - uy * length * 0.1 + py * width);
    ctx.lineTo(x - ux * length * 0.55, y - uy * length * 0.55);
    ctx.lineTo(x - ux * length * 0.1 - px * width, y - uy * length * 0.1 - py * width);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawFlyingArrows(camX, camY) {
    if (!flyingArrows.length) return;
    ctx.save();
    ctx.fillStyle = "#dbe4ea";
    ctx.strokeStyle = "#101317";
    ctx.lineWidth = 1.5;
    for (const arrow of flyingArrows) {
      drawArrowShape((arrow.x - camX) * tile, (arrow.y - camY) * tile, arrow.angle, 1);
    }
    ctx.restore();
  }

  function drawBowChargeIndicator(camX, camY) {
    if (!bowCharge || !canUseWorldActions() || !isBowWeapon() || (state.player.arrows || 0) <= 0) return;
    const weapon = currentWeapon();
    const charge = bowChargeProgress();
    const stats = bowShotStats(weapon, charge);
    const angle = playerAimAngle();
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const x = (state.player.x - camX) * tile;
    const y = (state.player.y - camY) * tile;
    const endX = x + ux * stats.range * tile;
    const endY = y + uy * stats.range * tile;
    ctx.save();
    ctx.setLineDash([8, 7]);
    ctx.lineWidth = 2 + charge * 2;
    ctx.strokeStyle = colorToRgba("#edf3f7", 0.48 + charge * 0.42);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colorToRgba("#f3c45b", 0.6 + charge * 0.35);
    ctx.strokeStyle = "rgba(16,19,23,0.9)";
    drawArrowShape(endX, endY, angle, 0.85);
    ctx.restore();
  }

  function drawAttackEffect(camX, camY) {
    if (!attackEffect) return;
    const p = state.player;
    const x = (p.x - camX) * tile;
    const y = (p.y - camY) * tile;
    const progress = clamp(attackEffect.time / attackEffect.duration, 0, 1);
    const alpha = attackEffect.critical ? 0.58 : 0.46;
    const ux = Math.cos(attackEffect.angle);
    const uy = Math.sin(attackEffect.angle);
    const px = -uy;
    const py = ux;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (attackEffect.effect === "slash") {
      const radius = attackEffect.reach * tile;
      const start = attackEffect.angle - attackEffect.halfAngle;
      const end = attackEffect.angle + attackEffect.halfAngle;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = colorToRgba(attackEffect.color, alpha * (1 - progress * 0.35));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, radius * (0.78 + progress * 0.18), start + attackEffect.halfAngle * 0.16, end - attackEffect.halfAngle * 0.16);
      ctx.strokeStyle = colorToRgba(attackEffect.color, attackEffect.critical ? 1 : 0.92);
      ctx.lineWidth = attackEffect.lineWidth + 1 + (attackEffect.critical ? 2 : 0);
      ctx.stroke();
    } else if (attackEffect.effect === "thrust") {
      const reach = attackEffect.reach * tile;
      const length = reach * (0.7 + progress * 0.3);
      ctx.strokeStyle = colorToRgba(attackEffect.color, 0.38);
      ctx.lineWidth = Math.max(12, attackEffect.halfWidth * tile * 2);
      ctx.beginPath();
      ctx.moveTo(x + ux * 8, y + uy * 8);
      ctx.lineTo(x + ux * length, y + uy * length);
      ctx.stroke();
      ctx.strokeStyle = colorToRgba(attackEffect.color, 0.9);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + ux * 10, y + uy * 10);
      ctx.lineTo(x + ux * (length + 10), y + uy * (length + 10));
      ctx.stroke();
    } else if (attackEffect.effect === "hammer") {
      const cx = x + ux * attackEffect.centerDist * tile;
      const cy = y + uy * attackEffect.centerDist * tile;
      const radius = attackEffect.radius * tile * (0.82 + progress * 0.18);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = colorToRgba(attackEffect.color, 0.32);
      ctx.fill();
      ctx.strokeStyle = colorToRgba(attackEffect.color, 0.92);
      ctx.lineWidth = attackEffect.lineWidth;
      ctx.stroke();
    } else if (attackEffect.effect === "claw") {
      const radius = attackEffect.reach * tile;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, attackEffect.angle - Math.PI / 2, attackEffect.angle + Math.PI / 2);
      ctx.closePath();
      ctx.fillStyle = colorToRgba(attackEffect.color, 0.32);
      ctx.fill();
      ctx.strokeStyle = colorToRgba(attackEffect.color, 0.9);
      ctx.lineWidth = attackEffect.lineWidth;
      for (const offset of [-0.34, 0, 0.34]) {
        const a = attackEffect.angle + offset;
        const ex = x + Math.cos(a) * radius;
        const ey = y + Math.sin(a) * radius;
        const mx = x + ux * radius * 0.55 + px * offset * 25;
        const my = y + uy * radius * 0.55 + py * offset * 25;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();
      }
    }
    if (attackEffect.critical) {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + ux * 28, y + uy * 28, 8 + progress * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMagicEffects(camX, camY) {
    for (const effect of magicEffects) {
      const x = (effect.x - camX) * tile;
      const y = (effect.y - camY) * tile;
      const progress = clamp(effect.time / effect.duration, 0, 1);
      const radius = effect.radius * tile * (0.65 + progress * 0.45);
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = colorToRgba(effect.color, 0.85 * (1 - progress * 0.4));
      ctx.fillStyle = colorToRgba(effect.color, 0.24 * (1 - progress * 0.2));
      ctx.lineWidth = effect.spellId === "thunderFlash" ? 5 : 3;
      if (effect.spellId === "littleCold") {
        const fogPulse = 0.03 + Math.sin(effect.time * 7) * 0.025;
        const coldRadius = effect.radius * tile * (0.98 + Math.sin(effect.time * 2.3) * 0.025);
        ctx.fillStyle = colorToRgba(effect.color, 0.18 + fogPulse);
        ctx.strokeStyle = colorToRgba(effect.color, 0.45 + fogPulse);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, coldRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(220,245,255,0.78)";
        for (let i = 0; i < 22; i += 1) {
          const angle = i * 2.399 + effect.time * 0.35;
          const band = ((i * 37) % 100) / 100;
          const rr = coldRadius * (0.12 + band * 0.78);
          const drift = Math.sin(effect.time * (1.2 + i * 0.08) + i) * 4;
          const sx = x + Math.cos(angle) * rr + drift;
          const sy = y + Math.sin(angle) * rr + Math.cos(effect.time * 1.5 + i) * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, i % 3 === 0 ? 2.2 : 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }
      if (effect.spellId !== "leafCutter") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (effect.spellId === "thunderFlash") {
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.lineWidth = 3;
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(x + i * 13, y - radius);
          ctx.lineTo(x - 8 + i * 9, y - 6);
          ctx.lineTo(x + 10 + i * 7, y + radius * 0.35);
          ctx.stroke();
        }
      } else if (effect.spellId === "leafCutter") {
        const sweep = (progress - 0.5) * 70;
        const cx = x + sweep;
        ctx.fillStyle = colorToRgba(effect.color, 0.72);
        ctx.strokeStyle = colorToRgba(effect.color, 0.98);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, y - 22);
        ctx.lineTo(cx + 24, y);
        ctx.lineTo(cx, y + 22);
        ctx.lineTo(cx - 24, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawOverlay() {
    refreshCombatStats();
    const weapon = currentWeapon();
    const pathos = hasPathosEffect();
    ctx.fillStyle = "rgba(7,9,11,0.62)";
    ctx.fillRect(12, 12, 560, 124);
    ctx.fillStyle = "#edf3f7";
    ctx.font = "16px Microsoft YaHei, sans-serif";
    ctx.fillText(`${currentAreaName()}  ${state.player.monsterForm ? "魔物化" : state.player.race + " " + state.player.job}${pathos ? " 悲怆" : ""}`, 24, 36);
    ctx.fillStyle = "#f3c45b";
    ctx.fillText(`${weapon.name} ${weapon.type} 攻${state.player.atk} 防${state.player.def}  箭${state.player.arrows || 0}`, 24, 58);
    ctx.font = "12px Microsoft YaHei, sans-serif";
    const drawStatusBar = (label, value, max, y, color) => {
      const safeMax = Math.max(1, max || 1);
      ctx.fillStyle = "#dbe4ea";
      ctx.fillText(`${label} ${formatNumber(value)}/${safeMax}`, 24, y + 9);
      ctx.fillStyle = "#111820";
      ctx.fillRect(104, y, 180, 9);
      ctx.fillStyle = color;
      ctx.fillRect(104, y, 180 * clamp(value / safeMax, 0, 1), 9);
    };
    drawStatusBar("生命", Math.max(0, state.player.hp), state.player.maxHp, 70, "#e85b5b");
    drawStatusBar("魔力", state.player.mp, state.player.maxMp, 86, "#5aa7ff");
    drawStatusBar("体力", state.player.stamina, 30, 102, state.player.running ? "#f3c45b" : "#62c78f");
    ctx.fillStyle = "#dbe4ea";
    ctx.fillText(`冷却 攻${state.player.attackCooldown.toFixed(2)}s  闪${state.player.dodgeCooldown.toFixed(2)}s`, 304, 111);

    if (state.mode === "dungeon") {
      const exitObj = state.objects.find(o => o.kind === "exit");
      if (exitObj && Math.abs(state.player.x - 3) < 1.2 && Math.abs(state.player.y - 9.5) < 2.0) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText("出口", 24, 128);
      }
    }
    drawMagicChantBar();
  }

  function drawMagicChantBar() {
    if (!pendingMagicCast) return;
    const spell = magicCatalog[pendingMagicCast.spellId];
    const progress = clamp(1 - pendingMagicCast.timer / Math.max(0.001, pendingMagicCast.total || pendingMagicCast.timer), 0, 1);
    const barW = W * 0.5;
    const barH = 18;
    const x = (W - barW) / 2;
    const y = H * 0.8;
    ctx.save();
    ctx.fillStyle = "rgba(7,9,11,0.72)";
    ctx.fillRect(x - 4, y - 28, barW + 8, 50);
    ctx.strokeStyle = "rgba(237,243,247,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barW, barH);
    ctx.fillStyle = spell?.color || "#d9d4ff";
    ctx.fillRect(x + 2, y + 2, Math.max(0, (barW - 4) * progress), barH - 4);
    ctx.fillStyle = "#edf3f7";
    ctx.font = "14px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`吟唱 ${spell?.name || "魔法"} ${(progress * 100).toFixed(0)}%`, W / 2, y - 9);
    ctx.restore();
  }

  // Side panel UI
  function renderStats() {
    refreshCombatStats();
    const area = state.mode === "world" ? regionAt(state.player.x, state.player.y) : regions.ruins;
    const weapon = currentWeapon();
    const pathos = hasPathosEffect();
    const activePets = petsForCurrentPlayer().filter(pet => !pet.lost);
    const livingPets = activePets.filter(pet => pet.alive && !pet.injured);
    const injuredPets = activePets.filter(pet => pet.injured);
    ensureQuestState();
    const currentMajorQuest = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
    const currentSmallQuests = state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled);
    const questText = currentMajorQuest ? currentMajorQuest.name : (currentSmallQuests[0]?.name || t("status.none"));
    const pathosText = pathos ? ` ${t("status.pathos")}` : "";
    const statusText = state.player.monsterForm
      ? `${t("status.monster")}${pathosText}`
      : `${raceLabel(state.player.race)}/${state.player.job}${pathosText}`;
    const actionText = state.player.running
      ? t("status.running")
      : (state.player.blockTimer > 0 ? t("status.blocking") : (state.player.dodgeCooldown > 0 ? `${t("status.dodge")}${state.player.dodgeCooldown.toFixed(1)}s` : t("status.ready")));
    statsEl.innerHTML = [
      [t("stat.status"), statusText],
      [t("stat.hp"), `${Math.max(0, Math.floor(state.player.hp))}/${state.player.maxHp}`],
      [t("stat.mp"), `${formatNumber(state.player.mp)}/${state.player.maxMp}`],
      [t("stat.stamina"), `${state.player.stamina.toFixed(1)}/30${state.player.running ? ` ${t("status.running")}` : ""}`],
      [t("stat.attackDefense"), `${t("unit.attack")}${state.player.atk} ${t("unit.defense")}${state.player.def}`],
      [t("stat.supplies"), `药草${state.player.herbs} 药水${state.player.potions} 箭${state.player.arrows || 0}`],
      [t("stat.resources"), `木${state.player.wood} 石${state.player.stone} ${state.player.gold}G`],
      [t("stat.materials"), materialSummary(2)],
      [t("stat.weapon"), `${weapon.name}/${weapon.type}`],
      [t("stat.performance"), `${t("unit.range")}${weapon.range} ${t("unit.attackCooldown")}${weapon.cooldown.toFixed(2)}s`],
      [t("stat.cooldown"), `${t("unit.attackShort")}${state.player.attackCooldown.toFixed(2)}s ${t("unit.dodgeShort")}${state.player.dodgeCooldown.toFixed(2)}s`],
      [t("stat.area"), `${t("unit.trust")}${area.trust} ${t("unit.hate")}${area.hate}`],
      [t("stat.action"), actionText],
      [t("stat.pet"), injuredPets.length ? `${livingPets.length}/${activePets.length} ${t("unit.injured")}${injuredPets.length}` : `${livingPets.length}/${activePets.length}`],
      [t("stat.quest"), questText],
      [t("stat.relation"), `${state.player.spouse || t("status.none")} 戒${state.player.rings}`]
    ].map(([k, v]) => `<div class="stat"><b>${k}</b><span>${v}</span></div>`).join("");
  }

  let lastGearHtml = "";

  function renderGearPanel() {
    const rows = state.player.gearBag
      .map(id => {
        const gear = gearCatalog[id];
        if (!gear) return "";
        const equipped = state.player.gear[gear.slot] === id || (state.player.monsterForm && id === "demonClaw");
        const button = equipped ? "已装备" : "装备";
        return `<div class="gear-row"><span>${gearLabel(id)}</span><button type="button" data-gear="${id}" ${equipped ? "disabled" : ""}>${button}</button></div>`;
      })
      .join("");
    const materialRows = Object.entries(state.player.materials)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => {
        const material = materialCatalog[name] || { desc: "素材" };
        const sellButton = material.unsellable ? `<button type="button" disabled>不可卖</button>` : `<button type="button" data-material="${name}" data-action="sell">卖</button>`;
        const petButton = material.pet ? `<button type="button" data-material="${name}" data-action="adoptPet">宠物</button>` : "";
        const forgeButtons = [
          ["weapon", "武"],
          ["head", "头"],
          ["body", "衣"],
          ["legs", "裤"],
          ["feet", "鞋"],
          ["accessory", "饰"]
        ].map(([slot, label]) => `<button type="button" data-material="${name}" data-action="forge" data-slot="${slot}" title="锻造到${slotName(slot)}">${label}</button>`).join("");
        return `<div class="gear-row material-row"><span>${name} x${count} ${material.desc}</span><span class="material-actions">${sellButton}${forgeButtons}${petButton}</span></div>`;
      })
      .join("");
    const html = `<strong>装备栏</strong>${rows || "<div class=\"gear-row\"><span>暂无装备</span></div>"}<strong>素材</strong>${materialRows || "<div class=\"gear-row\"><span>暂无素材</span></div>"}`;
    if (html !== lastGearHtml) {
      gearPanelEl.innerHTML = html;
      lastGearHtml = html;
    }
  }

  // Backpack UI
  function backpackItems(category) {
    const p = state.player;
    if (category === "consumables") {
      return [
        p.herbs > 0 && { id: "herb", name: "药草", count: p.herbs, desc: "简单处理伤口，回复少量 HP。", action: "use" },
        p.potions > 0 && { id: "potion", name: "回复药", count: p.potions, desc: "饮用后回复较多 HP。", action: "use" },
        (p.arrows || 0) > 0 && { id: "arrow", name: "箭", count: p.arrows, desc: "弓使用的消耗性战斗道具。装备弓后按住鼠标左键可蓄力射击。" }
      ].filter(Boolean);
    }
    if (category === "materials") {
      return Object.entries(p.resources || {})
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ id: `resource:${name}`, name, count, desc: resourceCatalog[name]?.desc || "建筑或锻造用素材。" }));
    }
    if (category === "loot") {
      return Object.entries(p.materials)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ id: name, name, count, desc: materialCatalog[name]?.desc || "生物掉落的战利品。" }));
    }
    if (category === "equipment") {
      return p.gearBag.map(id => {
        const gear = gearCatalog[id];
        const equipped = gear && p.gear[gear.slot] === id;
        return gear && { id, name: gear.name, count: equipped ? "已装备" : "", desc: gearLabel(id), gear };
      }).filter(Boolean);
    }
    if (category === "important") {
      return p.rings > 0 ? [{ id: "ring", name: "戒指", count: p.rings, desc: "请将其交付于至爱之人。" }] : [];
    }
    return [];
  }

  function backpackSelectedItem() {
    const items = backpackItems(backpackCategory);
    if (!items.length) return null;
    if (!backpackSelected || !items.some(item => item.id === backpackSelected)) backpackSelected = items[0].id;
    return items.find(item => item.id === backpackSelected) || items[0];
  }

  function modSummary(mod) {
    const parts = [];
    if (mod.atk) parts.push(`攻击+${mod.atk}`);
    if (mod.def) parts.push(`防御+${mod.def}`);
    if (mod.thorns) parts.push(`反伤+${mod.thorns}`);
    if (mod.slowOnHit) parts.push(`命中减速${Math.round(mod.slowOnHit * 100)}%`);
    if (mod.slowOnBlock) parts.push(`受击减速${Math.round(mod.slowOnBlock * 100)}%`);
    if (mod.aoeSlowOnHit) parts.push(`范围减速${Math.round(mod.aoeSlowOnHit * 100)}%`);
    if (mod.repelMonsters) parts.push("普通魔物不敢靠近");
    if (mod.cooldownMult !== 1) parts.push(`攻击间隔-${Math.round((1 - mod.cooldownMult) * 100)}%`);
    return parts.join("、");
  }

  function forgeEffectText(name) {
    const slots = ["weapon", "head", "body", "legs", "feet", "accessory"];
    const lines = slots
      .map(slot => {
        const mod = materialMod(name, slot);
        return mod ? `${slotName(slot)}：${modSummary(mod)}` : "";
      })
      .filter(Boolean);
    return lines.length ? lines.join("<br>") : "暂时没有可用锻造效果。";
  }

  function backpackDetailHtml(item) {
    if (!item) return "<p>这个分类里暂时没有物品。</p>";
    if (backpackCategory === "loot") {
      return `<h2>${escapeHtml(item.name)} x${item.count}</h2><p>${escapeHtml(item.desc)}</p><p><b>锻造效果</b><br>${forgeEffectText(item.name)}</p>`;
    }
    if (backpackCategory === "equipment") {
      const gear = item.gear;
      const equipped = state.player.gear[gear.slot] === item.id;
      const action = equipped && gear.slot !== "weapon" ? "卸下" : "装备";
      const actionButton = equipped && gear.slot === "weapon"
        ? "<button type=\"button\" disabled>已装备</button>"
        : `<button type="button" data-bag-action="gearToggle" data-id="${escapeHtml(item.id)}">${action}</button>`;
      return `<h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.desc)}</p><p>部位：${slotName(gear.slot)}　攻击：${gear.atk || 0}　防御：${gear.def || 0}</p><div class="backpack-actions">${actionButton}</div>`;
    }
    const useButton = item.action === "use" ? `<button type="button" data-bag-action="use" data-id="${escapeHtml(item.id)}">使用</button>` : "";
    return `<h2>${escapeHtml(item.name)}${item.count ? ` x${item.count}` : ""}</h2><p>${escapeHtml(item.desc)}</p>${useButton ? `<div class="backpack-actions">${useButton}</div>` : ""}`;
  }

  function renderBackpack() {
    if (!backpackOpen) return;
    const items = backpackItems(backpackCategory);
    const selected = backpackSelectedItem();
    const tabs = backpackCategories
      .map(([id, label]) => `<button type="button" data-bag-category="${id}" class="${id === backpackCategory ? "active" : ""}">${label}</button>`)
      .join("");
    const list = items.length
      ? items.map(item => `<button type="button" class="backpack-item ${item.id === backpackSelected ? "active" : ""}" data-bag-item="${escapeHtml(item.id)}"><span>${escapeHtml(item.name)}</span><b>${escapeHtml(item.count || "")}</b></button>`).join("")
      : "<p>暂无物品。</p>";
    const html = `<div class="backpack-head"><strong>背包</strong><span class="backpack-paused">游戏暂停</span><button type="button" class="backpack-close" data-bag-action="close">关闭 B / Esc</button></div><div class="backpack-tabs">${tabs}</div><div class="backpack-body"><div class="backpack-list">${list}</div><div class="backpack-detail">${backpackDetailHtml(selected)}</div></div>`;
    if (html !== lastBackpackHtml) {
      backpackEl.innerHTML = html;
      lastBackpackHtml = html;
    }
  }

  function toggleBackpack(force) {
    backpackOpen = typeof force === "boolean" ? force : !backpackOpen;
    backpackEl.classList.toggle("hidden", !backpackOpen);
    lastBackpackHtml = "";
    if (backpackOpen) renderBackpack();
  }

  function useBackpackItem(id) {
    const p = state.player;
    if (id === "herb") {
      if (p.herbs <= 0) return;
      if (p.hp >= p.maxHp) return toast("生命已经是满的。");
      p.herbs -= 1;
      p.hp = Math.min(p.maxHp, p.hp + 10);
      log("使用药草，回复了少量 HP。");
    }
    if (id === "potion") {
      if (p.potions <= 0) return;
      if (p.hp >= p.maxHp) return toast("生命已经是满的。");
      p.potions -= 1;
      p.hp = Math.min(p.maxHp, p.hp + 24);
      log("使用回复药，HP 明显恢复。");
    }
    lastBackpackHtml = "";
    renderBackpack();
  }

  function toggleBackpackGear(id) {
    const gear = gearCatalog[id];
    if (!gear) return;
    if (state.player.gear[gear.slot] === id) {
      if (gear.slot === "weapon") return toast("武器不能空手卸下。");
      state.player.gear[gear.slot] = null;
      refreshCombatStats();
      log(`卸下了${gear.name}。`);
    } else {
      equipGear(id);
    }
    lastBackpackHtml = "";
    renderBackpack();
  }

  // Shop and forge UI
  function panelHeader(title, actionName) {
    return `<div class="backpack-head"><strong>${escapeHtml(title)}</strong><span class="backpack-paused">${t("panel.paused")}</span><button type="button" class="backpack-close" data-${actionName}-action="close">${t("panel.closeEsc")}</button></div>`;
  }

  function closeShopPanel() {
    shopOpen = false;
    shopPanelEl.classList.add("hidden");
    lastShopHtml = "";
  }

  function closeForgePanel() {
    forgeOpen = false;
    forgePanelEl.classList.add("hidden");
    lastForgeHtml = "";
  }

  function openShopPanel() {
    if (state.player.monsterForm) return toast("商人拒绝和魔物化角色交易。");
    backpackOpen = false;
    backpackEl.classList.add("hidden");
    questOpen = false;
    questPanelEl.classList.add("hidden");
    closeForgePanel();
    closeMagicPanel();
    keys.clear();
    shopOpen = true;
    shopPanelEl.classList.remove("hidden");
    lastShopHtml = "";
    renderShopPanel();
  }

  function openForgePanel() {
    backpackOpen = false;
    backpackEl.classList.add("hidden");
    questOpen = false;
    questPanelEl.classList.add("hidden");
    closeShopPanel();
    closeMagicPanel();
    keys.clear();
    forgeOpen = true;
    forgePanelEl.classList.remove("hidden");
    lastForgeHtml = "";
    renderForgePanel();
  }

  function refreshShopPanel() {
    lastShopHtml = "";
    renderShopPanel();
    renderStats();
    renderGearPanel();
  }

  function refreshForgePanel() {
    lastForgeHtml = "";
    renderForgePanel();
    renderStats();
    renderGearPanel();
  }

  function sellableMaterialEntries() {
    return Object.entries(state.player.materials)
      .filter(([name, count]) => count > 0 && !materialCatalog[name]?.unsellable && materialCatalog[name]?.sell != null);
  }

  function renderShopPanel() {
    if (!shopOpen) return;
    const tabs = `<div class="backpack-tabs"><button type="button" data-shop-tab="buy" class="${shopTab === "buy" ? "active" : ""}">购买</button><button type="button" data-shop-tab="sell" class="${shopTab === "sell" ? "active" : ""}">出售</button></div>`;
    const body = shopTab === "buy"
      ? `<div class="trade-card"><h3>小回复药</h3><p>价格：8G。当前金币：${state.player.gold}G。</p><div class="quest-actions"><button type="button" data-shop-action="buyPotion" ${state.player.gold >= 8 ? "" : "disabled"}>购买</button></div></div><div class="trade-card"><h3>箭</h3><p>价格：1G / 支。当前持有：${state.player.arrows || 0} 支。</p><div class="quest-actions"><button type="button" data-shop-action="buyArrow" data-amount="1" ${state.player.gold >= 1 ? "" : "disabled"}>购买 1 支</button><button type="button" data-shop-action="buyArrow" data-amount="5" ${state.player.gold >= 5 ? "" : "disabled"}>购买 5 支</button></div></div>`
      : (sellableMaterialEntries().length
        ? sellableMaterialEntries().map(([name, count]) => {
          const unit = materialCatalog[name].sell || 0;
          return `<div class="trade-row"><span>${escapeHtml(name)}</span><span>数量 ${count}</span><span>单价 ${unit}G</span><button type="button" data-shop-action="sellOne" data-material="${escapeHtml(name)}">出售一个</button><button type="button" data-shop-action="sellAll" data-material="${escapeHtml(name)}">全部出售</button></div>`;
        }).join("")
        : '<div class="trade-card"><p>当前没有可出售素材。</p></div>');
    const html = `${panelHeader("商店", "shop")}${tabs}<div class="trade-list">${body}</div>`;
    if (html !== lastShopHtml) {
      shopPanelEl.innerHTML = html;
      lastShopHtml = html;
    }
  }

  function materialOptionList() {
    return Object.entries(state.player.materials)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ name, count, desc: materialCatalog[name]?.desc || "生物掉落的战利品。" }));
  }

  function selectedForgeMaterial() {
    const options = materialOptionList();
    if (!options.length) {
      forgeSelectedMaterial = null;
      return null;
    }
    if (!forgeSelectedMaterial || !options.some(item => item.name === forgeSelectedMaterial)) forgeSelectedMaterial = options[0].name;
    return options.find(item => item.name === forgeSelectedMaterial) || options[0];
  }

  function forgeSlotButton(materialName, slot) {
    const gearId = state.player.gear[slot];
    const gear = gearCatalog[gearId];
    const mod = materialMod(materialName, slot);
    const mods = gearId ? gearModList(gearId) : [];
    const disabled = !gear || !mod;
    const note = !gear ? "未装备" : !mod ? "无效果" : mods.length >= 3 ? "词条已满" : modSummary(mod);
    return `<button type="button" data-forge-action="forgeMaterial" data-material="${escapeHtml(materialName)}" data-slot="${slot}" ${disabled ? "disabled" : ""}>${slotName(slot)}：${gear ? escapeHtml(gear.name) : "无"}｜${escapeHtml(note)}</button>`;
  }

  function weaponForgeCategories() {
    return Object.keys(weaponForgeCatalog).filter(category => weaponForgeEntries(category).length > 0);
  }

  function selectedWeaponForgeEntry() {
    const categories = weaponForgeCategories();
    if (!categories.includes(forgeWeaponCategory)) forgeWeaponCategory = categories[0] || "剑";
    const entries = weaponForgeEntries(forgeWeaponCategory);
    if (!entries.length) {
      forgeSelectedWeapon = null;
      return null;
    }
    if (!forgeSelectedWeapon || !entries.some(entry => entry.gearId === forgeSelectedWeapon)) forgeSelectedWeapon = entries[0].gearId;
    return entries.find(entry => entry.gearId === forgeSelectedWeapon) || entries[0];
  }

  function forgeRequirementHtml(materials = {}) {
    return Object.entries(materials)
      .map(([name, amount]) => {
        const owned = forgeIngredientCount(name);
        const enough = owned >= amount;
        return `<div class="trade-row"><span>${escapeHtml(name)}</span><span>${owned} / ${amount}</span><span>${enough ? "足够" : "不足"}</span></div>`;
      })
      .join("");
  }

  function renderWeaponForgePanel() {
    const categories = weaponForgeCategories();
    const selected = selectedWeaponForgeEntry();
    if (!selected) return '<div class="trade-card"><p>当前没有可锻造武器。</p></div>';
    const categoryTabs = `<div class="backpack-tabs">${categories.map(category => `<button type="button" data-forge-weapon-category="${escapeHtml(category)}" class="${category === forgeWeaponCategory ? "active" : ""}">${escapeHtml(category)}</button>`).join("")}</div>`;
    const entries = weaponForgeEntries(forgeWeaponCategory);
    const list = entries.map(entry => `<button type="button" class="backpack-item ${entry.gearId === selected.gearId ? "active" : ""}" data-forge-weapon="${escapeHtml(entry.gearId)}"><span>${escapeHtml(entry.gear.name)}</span><b>${escapeHtml(entry.gear.type)}</b></button>`).join("");
    const gear = selected.gear;
    const enough = hasForgeIngredients(selected.materials);
    const owned = state.player.gearBag.includes(selected.gearId);
    const disabled = owned || !enough;
    const buttonText = owned ? "已拥有" : enough ? "锻造武器" : "材料不足";
    const detail = `<div class="backpack-detail"><h2>${escapeHtml(gear.name)}</h2><p>类型：${escapeHtml(gear.type)}　攻击：${gear.atk || 0}　防御：${gear.def || 0}</p><p>距离：${Number(gear.range || 0).toFixed(2)}　攻击间隔：${Number(gear.cooldown || 0).toFixed(2)}s　体力消耗：${Number(gear.stamina || 0).toFixed(1)}</p><h3>所需材料</h3><div class="trade-list">${forgeRequirementHtml(selected.materials)}</div><div class="quest-actions"><button type="button" data-forge-action="forgeWeapon" data-weapon="${escapeHtml(selected.gearId)}" ${disabled ? "disabled" : ""}>${buttonText}</button></div></div>`;
    return `${categoryTabs}<div class="backpack-body"><div class="backpack-list">${list}</div>${detail}</div>`;
  }

  function renderForgePanel() {
    if (!forgeOpen) return;
    const tabs = `<div class="backpack-tabs"><button type="button" data-forge-tab="ring" class="${forgeTab === "ring" ? "active" : ""}">戒指锻造</button><button type="button" data-forge-tab="material" class="${forgeTab === "material" ? "active" : ""}">素材锻造</button><button type="button" data-forge-tab="weapon" class="${forgeTab === "weapon" ? "active" : ""}">武器锻造</button></div>`;
    const ringHtml = `<div class="trade-card"><h3>粗制戒指</h3><p>所需材料：木材 1 / 反重力石 1。</p><p>当前拥有：木材 ${state.player.wood || 0} / 反重力石 ${state.player.stone || 0} / 戒指 ${state.player.rings || 0}。</p><div class="quest-actions"><button type="button" data-forge-action="forgeRing" ${(state.player.wood >= 1 && state.player.stone >= 1) ? "" : "disabled"}>锻造戒指</button></div></div>`;
    const selected = selectedForgeMaterial();
    const materialList = materialOptionList();
    const materialHtml = selected
      ? `<div class="backpack-body"><div class="backpack-list">${materialList.map(item => `<button type="button" class="backpack-item ${item.name === selected.name ? "active" : ""}" data-forge-material="${escapeHtml(item.name)}"><span>${escapeHtml(item.name)}</span><b>${item.count}</b></button>`).join("")}</div><div class="backpack-detail"><h2>${escapeHtml(selected.name)} x${selected.count}</h2><p>${escapeHtml(selected.desc)}</p><p><b>可用效果</b><br>${forgeEffectText(selected.name)}</p><div class="forge-slot-grid">${["weapon", "head", "body", "legs", "feet", "accessory"].map(slot => forgeSlotButton(selected.name, slot)).join("")}</div></div></div>`
      : '<div class="trade-card"><p>当前没有可用于锻造的素材。</p></div>';
    const body = forgeTab === "ring" ? ringHtml : forgeTab === "weapon" ? renderWeaponForgePanel() : materialHtml;
    const html = `${panelHeader("锻造台", "forge")}${tabs}${body}`;
    if (html !== lastForgeHtml) {
      forgePanelEl.innerHTML = html;
      lastForgeHtml = html;
    }
  }

  function closeMagicPanel() {
    magicOpen = false;
    magicPanelEl.classList.add("hidden");
    lastMagicHtml = "";
  }

  function openMagicPanel(mode = "book", title = null) {
    backpackOpen = false;
    backpackEl.classList.add("hidden");
    questOpen = false;
    questPanelEl.classList.add("hidden");
    closeShopPanel();
    closeForgePanel();
    keys.clear();
    magicMode = mode;
    magicPanelTitle = title || (mode === "study" ? "魔法爱好者小屋" : "魔法");
    magicInput = "";
    magicOpen = true;
    magicPanelEl.classList.remove("hidden");
    lastMagicHtml = "";
    renderMagicPanel();
  }

  function refreshMagicPanel() {
    lastMagicHtml = "";
    renderMagicPanel();
    renderStats();
  }

  function knownMagicCards(allowCast = true) {
    const known = state.player.magicKnown.map(id => ({ id, ...magicCatalog[id] })).filter(spell => spell.name);
    if (!known.length) return '<div class="trade-card"><p>还没有学会魔法。</p></div>';
    return known.map(spell => {
      const castButton = allowCast ? `<div class="quest-actions"><button type="button" data-magic-action="cast" data-spell="${spell.id}" ${state.player.mp >= spell.cost && !pendingMagicCast ? "" : "disabled"}>施放</button></div>` : "";
      return `<div class="trade-card"><h3>${escapeHtml(spell.name)}</h3><p>MP 消耗：${spell.cost}</p><p>${escapeHtml(spell.desc || "")}</p>${castButton}</div>`;
    }).join("");
  }

  function renderMagicPanel() {
    if (!magicOpen) return;
    const clueCount = Object.keys(state.player.magicClues || {}).length;
    const html = magicMode === "study"
      ? `${panelHeader(magicPanelTitle, "magic")}<div class="trade-list"><div class="trade-card"><h3>请输入你理解到的魔法：</h3><div class="magic-input"><input type="text" data-magic-input autocomplete="off" /><button type="button" data-magic-action="parse">解析</button></div><p>这间小屋里堆满了半懂不懂的笔记。没有线索时，正确的词也无法成形。</p></div><div class="trade-card"><h3>已理解线索</h3><p>${clueCount}/${magicList().length}</p></div><div class="trade-card"><h3>已学会魔法</h3><p>${state.player.magicKnown.length ? state.player.magicKnown.map(id => magicCatalog[id]?.name).filter(Boolean).join("、") : "无"}</p></div></div>`
      : `${panelHeader(magicPanelTitle, "magic")}<div class="trade-list"><div class="trade-card"><h3>当前 MP</h3><p>${formatNumber(state.player.mp)}/${state.player.maxMp}</p>${pendingMagicCast ? `<p>正在吟唱${escapeHtml(magicCatalog[pendingMagicCast.spellId]?.name || "魔法")}...</p>` : ""}</div>${knownMagicCards(true)}</div>`;
    if (html !== lastMagicHtml) {
      magicPanelEl.innerHTML = html;
      lastMagicHtml = html;
      const input = magicPanelEl.querySelector("[data-magic-input]");
      if (input) input.focus();
    }
  }

  // Quest UI
  function questPanelHeader(title) {
    return `<div class="quest-head"><strong>${escapeHtml(title)}</strong><button type="button" data-quest-action="close">关闭</button></div>`;
  }

  function questObjectiveText(q) {
    if (q.type === "kill") return `讨伐${q.targetName}：${q.progress || 0}/${q.count}`;
    if (q.type === "hunt") return `捕获${q.targetName}：${q.progress || 0}/${q.count}`;
    if (q.type === "delivery") return `送货给${q.targetNpc || "指定 NPC"}：${q.delivered ? "已送达" : "未送达"}`;
    if (q.type === "scout") return `抵达魔王城前庭任务点：${q.goalDone ? "情报已取得" : "未完成"}`;
    return q.name;
  }

  function questAutoSettlementText(q) {
    if (q.type === "kill") return "允许自动结算：目标完成后一段时间，消息会传回公会。";
    if (q.type === "delivery") return "允许自动结算：送货结果会通过民间消息传回委托人。";
    if (q.type === "hunt") return "不允许自动结算：需要玩家交付捕获的动物。";
    if (q.type === "scout") return "不允许自动结算：情报必须由玩家亲自带回公会。";
    return "不允许自动结算。";
  }

  function questDetailCard(q, label) {
    const status = label === "大型任务" ? majorQuestStatus(q) : smallQuestStatus(q);
    return `<div class="quest-card"><h3>${escapeHtml(label)}：${escapeHtml(q.name)}</h3><p>任务目标：${escapeHtml(questObjectiveText(q))}</p><p>${escapeHtml(questAutoSettlementText(q))}</p><p>当前状态：${escapeHtml(status)}</p><p>报酬：${escapeHtml(questRewardText(q.reward || {}))}</p></div>`;
  }

  function renderCurrentQuestPanel() {
    ensureQuestState();
    const cards = [];
    const major = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
    if (major) cards.push(questDetailCard(major, "大型任务"));
    else cards.push('<div class="quest-card"><h3>大型任务</h3><p>当前没有接取大型任务。</p></div>');
    const smallQuests = state.quests.small.filter(q => questBelongsToCurrentPlayer(q) && !q.settled);
    if (smallQuests.length) smallQuests.forEach(q => cards.push(questDetailCard(q, "小型任务")));
    else cards.push('<div class="quest-card"><h3>小型任务 0/3</h3><p>当前没有接取小型任务。</p></div>');
    return `${questPanelHeader(`当前任务 ${smallQuests.length}/3`)}<div class="quest-list">${cards.join("")}</div>`;
  }

  function renderGuildPanel() {
    const active = questBelongsToCurrentPlayer(state.quests.major) ? state.quests.major : null;
    const activeHtml = active
      ? `<div class="quest-card"><h3>${escapeHtml(active.name)}</h3><p>${escapeHtml(majorQuestStatus(active))}</p><div class="quest-actions"><button type="button" data-quest-action="settleMajor" ${active.goalDone ? "" : "disabled"}>结算</button></div></div>`
      : questCatalog.major.map(q => `<div class="quest-card"><h3>${escapeHtml(q.name)}</h3><p>${q.type === "kill" ? `讨伐${q.count}只${q.targetName}` : "前往魔王城前庭打探，并带回情报"}。报酬：${questRewardText(q.reward)}</p><div class="quest-actions"><button type="button" data-quest-action="acceptMajor" data-quest-id="${q.id}">接取</button></div></div>`).join("");
    return `${questPanelHeader("公会任务")}<div class="quest-list">${activeHtml}</div>`;
  }

  function renderNpcQuestPanel() {
    const npc = state.entities.find(e => e.alive && e.name === questNpcName);
    if (!npc) return `${questPanelHeader("小任务")}<p>委托人已经不在附近。</p>`;
    const active = activeSmallQuestFor(npc.name);
    const smallCount = activeSmallQuestCount();
    const smallFull = smallCount >= 3;
    const chatText = hostileRaceDialogue(npc) ? `和${npc.name}聊了一会儿。对方语气明显带刺。` : `和${npc.name}聊了一会儿。对方的态度似乎柔和了一点。`;
    const taskHtml = active
      ? `<div class="quest-card"><h3>${escapeHtml(active.name)}</h3><p>${escapeHtml(smallQuestStatus(active))}</p><div class="quest-actions"><button type="button" data-quest-action="settleSmall" ${active.goalDone ? "" : "disabled"}>结算</button></div></div>`
      : `<div class="quest-card"><h3>小任务 ${smallCount}/3</h3><p>${npc.name}似乎有些轻便委托。每个 NPC 最多 1 个，当前玩家最多 3 个小型任务。</p><div class="quest-actions"><button type="button" data-quest-action="acceptSmall" data-quest-type="hunt" ${smallFull ? "disabled" : ""}>捕猎小动物</button><button type="button" data-quest-action="acceptSmall" data-quest-type="delivery" ${smallFull ? "disabled" : ""}>送货给另一 NPC</button></div></div>`;
    return `${questPanelHeader(npc.name)}<div class="quest-list"><div class="quest-card"><h3>普通聊天</h3><p>${chatText}</p><div class="quest-actions"><button type="button" data-quest-action="chatNpc">普通聊天</button></div></div>${taskHtml}</div>`;
  }

  function renderQuestPanel() {
    if (!questOpen) return;
    const html = questMode === "guild" ? renderGuildPanel() : questMode === "current" ? renderCurrentQuestPanel() : renderNpcQuestPanel();
    if (html !== lastQuestHtml) {
      questPanelEl.innerHTML = html;
      lastQuestHtml = html;
    }
  }

  function openGuildPanel() {
    questMode = "guild";
    questNpcName = null;
    questOpen = true;
    questPanelEl.classList.remove("hidden");
    lastQuestHtml = "";
    renderQuestPanel();
  }

  function openNpcQuestPanel(npc) {
    questMode = "npc";
    questNpcName = npc.name;
    questOpen = true;
    questPanelEl.classList.remove("hidden");
    lastQuestHtml = "";
    renderQuestPanel();
  }

  function openCurrentQuestPanel() {
    questMode = "current";
    questNpcName = null;
    questOpen = true;
    questPanelEl.classList.remove("hidden");
    lastQuestHtml = "";
    renderQuestPanel();
  }

  function closeQuestPanel() {
    questOpen = false;
    questPanelEl.classList.add("hidden");
    lastQuestHtml = "";
  }

  // Main menu and pause menu
  function saveRowHtml(save) {
    const meta = save.meta || saveMeta(save.state || {});
    const active = save.id === selectedSaveId ? " active" : "";
    return `<button type="button" class="save-row${active}" data-menu-action="selectSave" data-save-id="${save.id}"><b>${escapeHtml(save.name || save.id)}</b><span>${formatSaveTime(save.savedAt)}　${escapeHtml(meta.scene)}　HP ${escapeHtml(meta.hp)}　${meta.gold}G　${formatGameTime(meta.time || 0)}</span></button>`;
  }

  function selectedSaveActionsHtml() {
    const save = readSaveSlots().find(item => item.id === selectedSaveId);
    if (!save) return "";
    const confirm = pendingDeleteSaveId === save.id
      ? `<div class="confirm-delete">${t("menu.confirmDelete")} ${escapeHtml(save.name)}？<div class="save-actions"><button type="button" data-menu-action="confirmDelete" data-save-id="${save.id}">${t("menu.confirmDelete")}</button><button type="button" data-menu-action="cancelDelete">${t("menu.cancel")}</button></div></div>`
      : "";
    return `<div class="save-actions"><button type="button" data-menu-action="loadSelected" data-save-id="${save.id}">${t("menu.start")}</button><button type="button" data-menu-action="askDelete" data-save-id="${save.id}">${t("menu.delete")}</button></div>${confirm}`;
  }

  function renderLoadMenu() {
    const saves = readSaveSlots().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    const list = saves.length ? saves.map(saveRowHtml).join("") : `<p class="menu-note">${t("menu.noSaves")}</p>`;
    return `<div class="menu-card"><h2>${t("menu.load.title")}</h2><div class="save-list">${list}</div>${selectedSaveActionsHtml()}<div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
  }

  function renderHelpMenu() {
    return `<div class="menu-card"><h2>${t("menu.help.title")}</h2><p class="menu-note">${t("menu.help.text")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
  }

  function renderLanguageMenu() {
    const buttons = languageOptions
      .map(option => `<button type="button" data-menu-action="setLanguage" data-language="${option.id}" ${option.id === currentLanguage() ? "disabled" : ""}>${option.label}</button>`)
      .join("");
    const current = languageOptions.find(option => option.id === currentLanguage())?.label || "中文";
    return `<div class="menu-card"><h2>${t("menu.language.title")}</h2><div class="menu-actions">${buttons}</div><p class="menu-note">${t("menu.currentLanguage")}：${current}</p><p class="menu-note">${t("menu.language.note")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
  }

  function renderMainMenu() {
    if (appMode !== "menu") return;
    const saves = readSaveSlots();
    const disabled = saves.length ? "" : "disabled";
    let html = "";
    if (menuView === "load") html = renderLoadMenu();
    else if (menuView === "help") html = renderHelpMenu();
    else if (menuView === "language") html = renderLanguageMenu();
    else if (menuView === "race") {
      html = `<div class="menu-card"><h2>${t("menu.race.title")}</h2><div class="menu-actions">${playableRaces.map(race => `<button type="button" data-menu-action="startRace" data-race="${race}">${raceLabel(race)}</button>`).join("")}</div><p class="menu-note">${t("menu.race.note")}</p><div class="menu-actions"><button type="button" data-menu-action="main">${t("menu.back")}</button></div></div>`;
    }
    else {
      html = `<div class="menu-card"><h2>OVERFANTASY</h2><div class="menu-actions"><button type="button" data-menu-action="new">${t("menu.new")}</button><button type="button" data-menu-action="continue" ${disabled}>${t("menu.continue")}</button><button type="button" data-menu-action="load">${t("menu.load")}</button><button type="button" data-menu-action="language">${t("menu.language")}</button><button type="button" data-menu-action="help">${t("menu.help")}</button></div><p class="menu-note">${t("menu.main.note")}</p></div>`;
    }
    if (html !== lastMenuHtml) {
      mainMenuEl.innerHTML = html;
      lastMenuHtml = html;
    }
    mainMenuEl.classList.remove("hidden");
    pauseMenuEl.classList.add("hidden");
  }

  function openMainMenu() {
    appMode = "menu";
    currentSaveId = null;
    resetRuntimeUi();
    menuView = "main";
    lastMenuHtml = "";
    applyLanguage();
    renderMainMenu();
  }

  function renderPauseMenu() {
    if (appMode !== "paused") return;
    const html = `<div class="pause-card"><h2>${t("pause.title")}</h2><p class="menu-note">${t("pause.text")}</p><div class="pause-actions"><button type="button" data-pause-action="save">${t("pause.save")}</button><button type="button" data-pause-action="main">${t("pause.main")}</button></div></div>`;
    if (html !== lastPauseHtml) {
      pauseMenuEl.innerHTML = html;
      lastPauseHtml = html;
    }
    pauseMenuEl.classList.remove("hidden");
  }

  function openPauseMenu() {
    if (appMode !== "playing") return;
    appMode = "paused";
    keys.clear();
    lastPauseHtml = "";
    renderPauseMenu();
  }

  function closePauseMenu() {
    if (appMode !== "paused") return;
    appMode = "playing";
    pauseMenuEl.classList.add("hidden");
  }

  // Main loop and input binding
  function gameTick(now) {
    const t = now / 1000;
    const dt = Math.min(0.033, t - (gameTick.last || t));
    gameTick.last = t;
    if (appMode === "playing" && !backpackOpen && !questOpen && !shopOpen && !forgeOpen && !magicOpen) {
      if (hitStopTimer > 0) {
        hitStopTimer = Math.max(0, hitStopTimer - dt);
      } else {
        updatePlayer(dt);
        updatePets(dt);
        updateEntities(dt);
        updatePetRemains(dt);
        updateWorld(dt);
        updateCombatFeedback(dt);
        if (state.mode === "dungeon") {
          const exitObj = state.objects.find(o => o.kind === "exit");
          if (exitObj && Math.abs(state.player.x - 3) < 1.1 && Math.abs(state.player.y - 9.5) < 1.7) leaveDungeon();
        }
      }
    }
    render();
    if (backpackOpen) renderBackpack();
    if (questOpen) renderQuestPanel();
    if (shopOpen) renderShopPanel();
    if (forgeOpen) renderForgePanel();
    if (magicOpen) renderMagicPanel();
    if (appMode === "menu") renderMainMenu();
    if (appMode === "paused") renderPauseMenu();
    requestAnimationFrame(gameTick);
  }

  function handleKeyDown(e) {
    const k = e.key.toLowerCase();
    if (appMode === "menu") {
      if (k === "escape" && menuView !== "main") {
        menuView = "main";
        selectedSaveId = null;
        pendingDeleteSaveId = null;
        lastMenuHtml = "";
        renderMainMenu();
      }
      e.preventDefault();
      return;
    }
    if (magicOpen && e.target?.matches?.("[data-magic-input]")) {
      if (k === "escape") {
        closeMagicPanel();
        e.preventDefault();
      } else if (k === "enter") {
        magicInput = e.target.value;
        learnMagicFromInput(magicInput);
        magicInput = "";
        refreshMagicPanel();
        e.preventDefault();
      }
      return;
    }
    if (k === "b") {
      if (appMode === "playing" && !questOpen && !shopOpen && !forgeOpen && !magicOpen) toggleBackpack();
      e.preventDefault();
      return;
    }
    if (k === "j") {
      if (appMode === "playing" && !backpackOpen && !shopOpen && !forgeOpen && !magicOpen) openCurrentQuestPanel();
      e.preventDefault();
      return;
    }
    if (k === "f") {
      if (appMode === "playing" && !backpackOpen && !questOpen && !shopOpen && !forgeOpen && !magicOpen) openMagicPanel("book");
      e.preventDefault();
      return;
    }
    if (k === "escape" && backpackOpen) {
      toggleBackpack(false);
      e.preventDefault();
      return;
    }
    if (k === "escape" && questOpen) {
      closeQuestPanel();
      e.preventDefault();
      return;
    }
    if (k === "escape" && shopOpen) {
      closeShopPanel();
      e.preventDefault();
      return;
    }
    if (k === "escape" && forgeOpen) {
      closeForgePanel();
      e.preventDefault();
      return;
    }
    if (k === "escape" && magicOpen) {
      closeMagicPanel();
      e.preventDefault();
      return;
    }
    if (k === "escape" && appMode === "paused") {
      closePauseMenu();
      e.preventDefault();
      return;
    }
    if (k === "escape" && appMode === "playing") {
      openPauseMenu();
      e.preventDefault();
      return;
    }
    if (appMode !== "playing") {
      e.preventDefault();
      return;
    }
    if (backpackOpen || questOpen || shopOpen || forgeOpen || magicOpen) {
      e.preventDefault();
      return;
    }
    keys.add(k);
    if (k === "e") {
      if (!handlePetRescue() && !helpWounded()) talkOrUse();
    }
    if (k === " ") playerDodge();
    if (k === "g") gift();
    if (k === "r") rest();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "shift"].includes(k)) e.preventDefault();
  }

  function handleKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }

  function blockWorldAction(event) {
    if (!backpackOpen && !questOpen && !shopOpen && !forgeOpen && !magicOpen && appMode === "playing") return false;
    event.preventDefault();
    return true;
  }

  document.getElementById("btnTalk").addEventListener("click", event => { if (blockWorldAction(event)) return; if (!handlePetRescue() && !helpWounded()) talkOrUse(); });
  document.getElementById("btnAttack").addEventListener("click", event => { if (!blockWorldAction(event)) playerAttack(); });
  document.getElementById("btnDefend").addEventListener("click", event => { if (!blockWorldAction(event)) playerDefend(); });
  document.getElementById("btnDodge").addEventListener("click", event => { if (!blockWorldAction(event)) playerDodge(); });
  document.getElementById("btnGift").addEventListener("click", event => { if (!blockWorldAction(event)) gift(); });
  document.getElementById("btnRest").addEventListener("click", event => { if (!blockWorldAction(event)) rest(); });
  document.getElementById("btnBackpack").addEventListener("click", event => {
    if (appMode !== "playing" || questOpen || shopOpen || forgeOpen || magicOpen) {
      event.preventDefault();
      return;
    }
    toggleBackpack();
  });
  document.getElementById("btnMagic").addEventListener("click", event => {
    if (appMode !== "playing" || backpackOpen || questOpen || shopOpen || forgeOpen) {
      event.preventDefault();
      return;
    }
    openMagicPanel("book");
  });
  canvas.addEventListener("mousemove", updateAimFromEvent);
  canvas.addEventListener("mousedown", event => {
    updateAimFromEvent(event);
    if (blockWorldAction(event)) return;
    if (event.button === 0) {
      if (!beginBowCharge()) playerAttack();
    }
    if (event.button === 2) playerDefend();
  });
  window.addEventListener("mouseup", event => {
    if (event.button === 0) releaseBowCharge();
  });
  canvas.addEventListener("contextmenu", event => event.preventDefault());
  gearPanelEl.addEventListener("click", event => {
    if (blockWorldAction(event)) return;
    const button = event.target.closest("button[data-gear]");
    const materialButton = event.target.closest("button[data-material]");
    if (button) {
      equipGear(button.dataset.gear);
      return;
    }
    if (!materialButton) return;
    const name = materialButton.dataset.material;
    const action = materialButton.dataset.action;
    if (action === "sell") {
      if (!isNearAction("shop")) {
        toast("需要靠近商店才能出售素材。");
        return;
      }
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
    }
    if (action === "forge") forgeMaterial(name, materialButton.dataset.slot);
    if (action === "adoptPet") adoptPetFromMaterial(name);
  });
  backpackEl.addEventListener("click", event => {
    const categoryButton = event.target.closest("button[data-bag-category]");
    const itemButton = event.target.closest("button[data-bag-item]");
    const actionButton = event.target.closest("button[data-bag-action]");
    if (categoryButton) {
      backpackCategory = categoryButton.dataset.bagCategory;
      backpackSelected = null;
      lastBackpackHtml = "";
      renderBackpack();
      return;
    }
    if (itemButton) {
      backpackSelected = itemButton.dataset.bagItem;
      lastBackpackHtml = "";
      renderBackpack();
      return;
    }
    if (!actionButton) return;
    const action = actionButton.dataset.bagAction;
    if (action === "close") toggleBackpack(false);
    if (action === "use") useBackpackItem(actionButton.dataset.id);
    if (action === "gearToggle") toggleBackpackGear(actionButton.dataset.id);
  });
  shopPanelEl.addEventListener("click", event => {
    const tabButton = event.target.closest("button[data-shop-tab]");
    const actionButton = event.target.closest("button[data-shop-action]");
    if (tabButton) {
      shopTab = tabButton.dataset.shopTab;
      refreshShopPanel();
      return;
    }
    if (!actionButton) return;
    const action = actionButton.dataset.shopAction;
    if (action === "close") {
      closeShopPanel();
      return;
    }
    if (state.player.monsterForm) {
      toast("商人拒绝和魔物化角色交易。");
      closeShopPanel();
      return;
    }
    if (action === "buyPotion") {
      buyPotion();
      refreshShopPanel();
      return;
    }
    if (action === "buyArrow") {
      buyArrows(actionButton.dataset.amount);
      refreshShopPanel();
      return;
    }
    const name = actionButton.dataset.material;
    if (action === "sellOne") {
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
      refreshShopPanel();
      return;
    }
    if (action === "sellAll") {
      const gold = sellMaterial(name, state.player.materials[name] || 0);
      if (gold > 0) log(`卖出全部${name}，获得${gold}G。`);
      refreshShopPanel();
    }
  });
  forgePanelEl.addEventListener("click", event => {
    const tabButton = event.target.closest("button[data-forge-tab]");
    const materialButton = event.target.closest("button[data-forge-material]");
    const weaponCategoryButton = event.target.closest("button[data-forge-weapon-category]");
    const weaponButton = event.target.closest("button[data-forge-weapon]");
    const actionButton = event.target.closest("button[data-forge-action]");
    if (tabButton) {
      forgeTab = tabButton.dataset.forgeTab;
      refreshForgePanel();
      return;
    }
    if (materialButton) {
      forgeSelectedMaterial = materialButton.dataset.forgeMaterial;
      refreshForgePanel();
      return;
    }
    if (weaponCategoryButton) {
      forgeWeaponCategory = weaponCategoryButton.dataset.forgeWeaponCategory;
      forgeSelectedWeapon = null;
      refreshForgePanel();
      return;
    }
    if (weaponButton) {
      forgeSelectedWeapon = weaponButton.dataset.forgeWeapon;
      refreshForgePanel();
      return;
    }
    if (!actionButton) return;
    const action = actionButton.dataset.forgeAction;
    if (action === "close") {
      closeForgePanel();
      return;
    }
    if (action === "forgeRing") {
      forgeRing();
      refreshForgePanel();
      return;
    }
    if (action === "forgeMaterial") {
      forgeMaterial(actionButton.dataset.material, actionButton.dataset.slot);
      refreshForgePanel();
      return;
    }
    if (action === "forgeWeapon") {
      forgeWeapon(actionButton.dataset.weapon);
      refreshForgePanel();
    }
  });
  magicPanelEl.addEventListener("input", event => {
    const input = event.target.closest("[data-magic-input]");
    if (input) magicInput = input.value;
  });
  magicPanelEl.addEventListener("click", event => {
    const button = event.target.closest("button[data-magic-action]");
    if (!button) return;
    const action = button.dataset.magicAction;
    if (action === "close") {
      closeMagicPanel();
      return;
    }
    if (action === "parse") {
      const input = magicPanelEl.querySelector("[data-magic-input]");
      magicInput = input?.value || magicInput;
      learnMagicFromInput(magicInput);
      magicInput = "";
      refreshMagicPanel();
      return;
    }
    if (action === "cast") {
      beginMagicCast(button.dataset.spell);
      refreshMagicPanel();
    }
  });
  questPanelEl.addEventListener("click", event => {
    const button = event.target.closest("button[data-quest-action]");
    if (!button) return;
    const action = button.dataset.questAction;
    if (action === "close") closeQuestPanel();
    if (action === "acceptMajor") acceptMajorQuest(button.dataset.questId);
    if (action === "settleMajor") {
      settleMajorQuest(false);
      lastQuestHtml = "";
      renderQuestPanel();
    }
    if (action === "chatNpc") {
      const npc = state.entities.find(e => e.alive && e.name === questNpcName);
      if (npc) chatWithNpc(npc, `${questNpcName}和你聊了一会儿。`);
      closeQuestPanel();
    }
    if (action === "acceptSmall") acceptSmallQuest(questNpcName, button.dataset.questType);
    if (action === "settleSmall") {
      const q = activeSmallQuestFor(questNpcName);
      settleSmallQuest(q, false);
      lastQuestHtml = "";
      renderQuestPanel();
    }
  });
  mainMenuEl.addEventListener("click", event => {
    const button = event.target.closest("button[data-menu-action]");
    if (!button) return;
    const action = button.dataset.menuAction;
    const saveId = button.dataset.saveId;
    if (action === "new") menuView = "race";
    if (action === "startRace") startNewGame(button.dataset.race || "人类");
    if (action === "continue") continueLatestSave();
    if (action === "load") {
      menuView = "load";
      selectedSaveId = null;
      pendingDeleteSaveId = null;
    }
    if (action === "help") menuView = "help";
    if (action === "language") menuView = "language";
    if (action === "setLanguage") setLanguage(button.dataset.language || "zh");
    if (action === "main") {
      menuView = "main";
      selectedSaveId = null;
      pendingDeleteSaveId = null;
    }
    if (action === "selectSave") {
      selectedSaveId = saveId;
      pendingDeleteSaveId = null;
    }
    if (action === "loadSelected") startLoadedSave(saveId);
    if (action === "askDelete") pendingDeleteSaveId = saveId;
    if (action === "cancelDelete") pendingDeleteSaveId = null;
    if (action === "confirmDelete") deleteSaveSlot(saveId);
    lastMenuHtml = "";
    renderMainMenu();
  });
  pauseMenuEl.addEventListener("click", event => {
    const button = event.target.closest("button[data-pause-action]");
    if (!button) return;
    const action = button.dataset.pauseAction;
    if (action === "save") saveCurrentGame(true);
    if (action === "main") {
      saveCurrentGame(false);
      openMainMenu();
    }
  });
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  resetGameState();
  appMode = "menu";
  currentSaveId = null;
  applyLanguage();
  render();
  renderMainMenu();
  requestAnimationFrame(gameTick);
})();
