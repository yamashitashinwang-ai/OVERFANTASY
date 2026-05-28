// Internationalisation domain service. Holds the static text catalog and the
// active language selection. Pure logic — no DOM access. Mutations broadcast
// Events.LANGUAGE_CHANGED on the bus so UI layers can re-render.

import { bus, Events } from '../runtime/events.ts';
import { state } from '../runtime/state.ts';

const languageStorageKey = 'overfantasy.language.v1';

export const languageOptions = [
  { id: "zh", htmlLang: "zh-CN", label: "中文" },
  { id: "ja", htmlLang: "ja", label: "日本語" },
  { id: "en", htmlLang: "en", label: "English" }
] as const;

export type LanguageId = typeof languageOptions[number]['id'];
type UiTextCatalog = Record<string, string>;

export const uiText: Record<LanguageId, UiTextCatalog> = {
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


export function isValidLanguage(value: unknown): value is LanguageId {
  return languageOptions.some(option => option.id === value);
}

export function readLanguageSetting(): LanguageId {
  try {
    const stored = window.localStorage?.getItem(languageStorageKey);
    return isValidLanguage(stored) ? stored : 'zh';
  } catch {
    return 'zh';
  }
}

function writeLanguageSetting(language: LanguageId) {
  try {
    if (window.localStorage) window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // localStorage can be unavailable in some browser privacy modes.
  }
}

export function currentLanguage(): LanguageId {
  return isValidLanguage(state.settings?.language) ? state.settings.language : 'zh';
}

export function t(key: string): string {
  const lang = currentLanguage();
  return uiText[lang]?.[key] ?? uiText.zh[key] ?? key;
}

export function raceLabel(race: string): string {
  return t(`race.${race}`);
}

/**
 * Switch active language. Persists to localStorage and emits LANGUAGE_CHANGED
 * so UI layers can re-render. Does NOT touch the DOM directly.
 */
export function setLanguage(language: string) {
  if (!isValidLanguage(language)) return;
  if (!state.settings || typeof state.settings !== 'object') state.settings = { language };
  state.settings.language = language;
  writeLanguageSetting(language);
  bus.emit(Events.LANGUAGE_CHANGED, { language });
}
