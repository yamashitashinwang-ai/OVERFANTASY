// Modal panel scenes — Backpack, Quest, Shop, Forge, Magic. Each is a
// parallel-overlay Phaser scene launched from GameScene; while one is active
// GameScene is paused so the world loop halts.
//
// The HTML panel divs are kept (existing CSS/markup is preserved); each scene
// owns the lifecycle: render on create + bus events, click handler, Esc closes.
//
// Pattern mirrors scenes/Pause.js — open via `this.scene.launch('XScene')`
// from GameScene, scene resumes GameScene + stops itself on close.

import Phaser from 'phaser';
import { bus, Events } from '../runtime/events.js';
import { uiState } from '../runtime/ui-state.js';
import { state } from '../runtime/state.js';
import { htmlCache } from '../ui/cache.js';
import { get } from '../ui/dom.js';

import { renderBackpack, useBackpackItem, toggleBackpackGear } from '../ui/backpack.js';
import { renderQuestPanel } from '../ui/quest.js';
import { renderShopPanel, refreshShopPanel } from '../ui/shop.js';
import { renderForgePanel, refreshForgePanel } from '../ui/forge.js';
import { renderMagicPanel, refreshMagicPanel } from '../ui/magic.js';

import { equipGear, adoptPetFromMaterial } from '../domain/inventory.js';
import { sellMaterial, buyPotion, buyArrows, forgeRing, forgeMaterial, forgeWeapon } from '../domain/economy.js';
import { learnMagicFromInput, beginMagicCast } from '../domain/magic.js';
import {
  acceptMajorQuest, settleMajorQuest, acceptSmallQuest, settleSmallQuest,
  activeSmallQuestFor
} from '../domain/quest.js';
import { chatWithNpc, isNearAction } from '../domain/npc.js';
import { log, toast } from '../runtime/services.js';

// Shared base class — handles open/close lifecycle, Esc, GameScene resume,
// bus subscription tracking. Subclasses provide panelId, render, click events.
class ModalPanelScene extends Phaser.Scene {
  constructor(key, panelId, openFlagName) {
    super({ key });
    this.panelId = panelId;
    this.openFlagName = openFlagName;
  }

  create() {
    this.el = document.getElementById(this.panelId);
    if (this.openFlagName) uiState[this.openFlagName] = true;
    this.el.classList.remove('hidden');
    htmlCache[this.cacheKey || ''] = '';
    this.refresh();

    this._click = (event) => this.onClick(event);
    this.el.addEventListener('click', this._click);
    if (this.onInput) {
      this._input = (event) => this.onInput(event);
      this.el.addEventListener('input', this._input);
    }
    if (this.onKeydown) {
      this._keydown = (event) => this.onKeydown(event);
      this.el.addEventListener('keydown', this._keydown);
    }

    this.input.keyboard.on('keydown-ESC', () => this.close());

    this._busSubs = [];
    for (const ev of this.refreshOn()) {
      const fn = () => this.refresh();
      bus.on(ev, fn);
      this._busSubs.push([ev, fn]);
    }
    bus.emit(Events.PANEL_OPEN, { id: this.scene.key });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  refreshOn() { return [Events.LANGUAGE_CHANGED, Events.INVENTORY_CHANGED, Events.GEAR_EQUIPPED]; }

  refresh() {
    htmlCache[this.cacheKey || ''] = '';
    this.render();
  }

  close() {
    this.el.classList.add('hidden');
    if (this.openFlagName) uiState[this.openFlagName] = false;
    bus.emit(Events.PANEL_CLOSE, { id: this.scene.key });
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  cleanup() {
    if (this._click) this.el.removeEventListener('click', this._click);
    if (this._input) this.el.removeEventListener('input', this._input);
    if (this._keydown) this.el.removeEventListener('keydown', this._keydown);
    for (const [ev, fn] of this._busSubs) bus.off(ev, fn);
    this._busSubs = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
export class BackpackScene extends ModalPanelScene {
  constructor() { super('BackpackScene', 'backpackPanel', 'backpackOpen'); }
  get cacheKey() { return 'backpack'; }
  render() { renderBackpack(); }
  onClick(event) {
    const categoryButton = event.target.closest('button[data-bag-category]');
    const itemButton = event.target.closest('button[data-bag-item]');
    const actionButton = event.target.closest('button[data-bag-action]');
    if (categoryButton) {
      uiState.backpackCategory = categoryButton.dataset.bagCategory;
      uiState.backpackSelected = null;
      this.refresh();
      return;
    }
    if (itemButton) {
      uiState.backpackSelected = itemButton.dataset.bagItem;
      this.refresh();
      return;
    }
    if (!actionButton) return;
    const action = actionButton.dataset.bagAction;
    if (action === 'close') return this.close();
    if (action === 'use') useBackpackItem(actionButton.dataset.id);
    if (action === 'gearToggle') toggleBackpackGear(actionButton.dataset.id);
    this.refresh();
  }
}

// ─────────────────────────────────────────────────────────────────────────
export class QuestScene extends ModalPanelScene {
  constructor() { super('QuestScene', 'questPanel', 'questOpen'); }
  get cacheKey() { return 'quest'; }
  render() { renderQuestPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.QUEST_ACCEPTED, Events.QUEST_PROGRESS,
      Events.QUEST_SETTLED, Events.INVENTORY_CHANGED
    ];
  }
  onClick(event) {
    const button = event.target.closest('button[data-quest-action]');
    if (!button) return;
    const action = button.dataset.questAction;
    if (action === 'close') return this.close();
    if (action === 'acceptMajor') acceptMajorQuest(button.dataset.questId);
    if (action === 'settleMajor') settleMajorQuest(false);
    if (action === 'chatNpc') {
      const npc = state.entities.find(e => e.alive && e.name === uiState.questNpcName);
      if (npc) chatWithNpc(npc, `${uiState.questNpcName}和你聊了一会儿。`);
      return this.close();
    }
    if (action === 'acceptSmall') acceptSmallQuest(uiState.questNpcName, button.dataset.questType);
    if (action === 'settleSmall') {
      const q = activeSmallQuestFor(uiState.questNpcName);
      settleSmallQuest(q, false);
    }
    this.refresh();
  }
}

// ─────────────────────────────────────────────────────────────────────────
export class ShopScene extends ModalPanelScene {
  constructor() { super('ShopScene', 'shopPanel', 'shopOpen'); }
  get cacheKey() { return 'shop'; }
  render() { renderShopPanel(); }
  onClick(event) {
    const tabButton = event.target.closest('button[data-shop-tab]');
    const actionButton = event.target.closest('button[data-shop-action]');
    if (tabButton) { uiState.shopTab = tabButton.dataset.shopTab; refreshShopPanel(); return; }
    if (!actionButton) return;
    const action = actionButton.dataset.shopAction;
    if (action === 'close') return this.close();
    if (state.player.monsterForm) { toast('商人拒绝和魔物化角色交易。'); return this.close(); }
    if (action === 'buyPotion') { buyPotion(); refreshShopPanel(); return; }
    if (action === 'buyArrow') { buyArrows(actionButton.dataset.amount); refreshShopPanel(); return; }
    const name = actionButton.dataset.material;
    if (action === 'sellOne') {
      const gold = sellMaterial(name, 1);
      if (gold > 0) log(`卖出${name}，获得${gold}G。`);
      refreshShopPanel();
    }
    if (action === 'sellAll') {
      const gold = sellMaterial(name, state.player.materials[name] || 0);
      if (gold > 0) log(`卖出全部${name}，获得${gold}G。`);
      refreshShopPanel();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
export class ForgeScene extends ModalPanelScene {
  constructor() { super('ForgeScene', 'forgePanel', 'forgeOpen'); }
  get cacheKey() { return 'forge'; }
  render() { renderForgePanel(); }
  onClick(event) {
    const tabButton = event.target.closest('button[data-forge-tab]');
    const materialButton = event.target.closest('button[data-forge-material]');
    const weaponCategoryButton = event.target.closest('button[data-forge-weapon-category]');
    const weaponButton = event.target.closest('button[data-forge-weapon]');
    const actionButton = event.target.closest('button[data-forge-action]');
    if (tabButton) { uiState.forgeTab = tabButton.dataset.forgeTab; refreshForgePanel(); return; }
    if (materialButton) { uiState.forgeSelectedMaterial = materialButton.dataset.forgeMaterial; refreshForgePanel(); return; }
    if (weaponCategoryButton) {
      uiState.forgeWeaponCategory = weaponCategoryButton.dataset.forgeWeaponCategory;
      uiState.forgeSelectedWeapon = null;
      refreshForgePanel();
      return;
    }
    if (weaponButton) { uiState.forgeSelectedWeapon = weaponButton.dataset.forgeWeapon; refreshForgePanel(); return; }
    if (!actionButton) return;
    const action = actionButton.dataset.forgeAction;
    if (action === 'close') return this.close();
    if (action === 'forgeRing') forgeRing();
    if (action === 'forgeMaterial') forgeMaterial(actionButton.dataset.material, actionButton.dataset.slot);
    if (action === 'forgeWeapon') forgeWeapon(actionButton.dataset.weapon);
    refreshForgePanel();
  }
}

// ─────────────────────────────────────────────────────────────────────────
export class MagicScene extends ModalPanelScene {
  constructor() { super('MagicScene', 'magicPanel', 'magicOpen'); }
  get cacheKey() { return 'magic'; }
  render() { renderMagicPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.MAGIC_LEARNED, Events.MAGIC_CLUE,
      Events.MAGIC_CAST_BEGIN, Events.MAGIC_CAST_RESOLVE
    ];
  }
  onInput(event) {
    const input = event.target.closest('[data-magic-input]');
    if (input) uiState.magicInput = input.value;
  }
  onKeydown(event) {
    if (!event.target?.matches?.('[data-magic-input]')) return;
    const k = event.key.toLowerCase();
    if (k === 'escape') { event.preventDefault(); this.close(); }
    else if (k === 'enter') {
      event.preventDefault();
      uiState.magicInput = event.target.value;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
    }
  }
  onClick(event) {
    const button = event.target.closest('button[data-magic-action]');
    if (!button) return;
    const action = button.dataset.magicAction;
    if (action === 'close') return this.close();
    if (action === 'parse') {
      const input = this.el.querySelector('[data-magic-input]');
      uiState.magicInput = input?.value || uiState.magicInput;
      learnMagicFromInput(uiState.magicInput);
      uiState.magicInput = '';
      refreshMagicPanel();
      return;
    }
    if (action === 'cast') { beginMagicCast(button.dataset.spell); refreshMagicPanel(); }
  }
}
