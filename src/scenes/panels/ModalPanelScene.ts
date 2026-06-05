import Phaser from 'phaser';
import { bus, Events } from '../../runtime/events.ts';
import { uiState } from '../../runtime/ui-state.ts';
import { releaseWorldPointerInput, restoreGameInputFocus } from '../../runtime/input.ts';
import { htmlCache } from '../../ui/cache.ts';

// Shared base class for DOM-backed modal panel scenes. The Phaser scene owns
// lifecycle and input isolation; panel subclasses own rendering and actions.
export class ModalPanelScene extends Phaser.Scene {
  protected panelId: string;
  protected openFlagName: string;
  protected el!: HTMLElement;
  protected _click?: (event: MouseEvent) => void;
  protected _pointer?: (event: PointerEvent) => void;
  protected _handoff?: (event: Event) => void;
  protected _documentHandoff?: (event: Event) => void;
  protected _scenePointer?: () => void;
  protected _input?: (event: Event) => void;
  protected _keydown?: (event: KeyboardEvent) => void;
  protected _busSubs: Array<[string, () => void]> = [];

  constructor(key: string, panelId: string, openFlagName: string) {
    super({ key });
    this.panelId = panelId;
    this.openFlagName = openFlagName;
  }

  get cacheKey(): string { return ''; }

  render(): void {}

  onClick(_event: MouseEvent): void {}

  onInput?(_event: Event): void;

  onKeydown?(_event: KeyboardEvent): void;

  closeShortcutKeys(): string[] { return ['ESC']; }

  protected clearPointerState() {
    releaseWorldPointerInput(this);
  }

  protected absorbPanelPointer(event: Event) {
    this.clearPointerState();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  protected absorbOutsidePointer(event: Event) {
    this.clearPointerState();
    const target = event.target;
    const insidePanel = target instanceof Node && this.el.contains(target);
    if (insidePanel || !['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click'].includes(event.type)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  create() {
    this.el = document.getElementById(this.panelId) as HTMLElement;
    if (this.openFlagName) uiState[this.openFlagName] = true;
    this.el.classList.remove('hidden');
    htmlCache[this.cacheKey || ''] = '';
    this.refresh();

    this.clearPointerState();
    this._documentHandoff = (event) => this.absorbOutsidePointer(event);
    for (const eventName of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'focusin']) {
      document.addEventListener(eventName, this._documentHandoff, true);
    }
    this._pointer = (event) => this.absorbPanelPointer(event);
    this._handoff = () => this.clearPointerState();
    this.el.addEventListener('pointerenter', this._handoff);
    this.el.addEventListener('pointermove', this._handoff);
    this.el.addEventListener('focusin', this._handoff);
    this.el.addEventListener('pointerdown', this._pointer);
    this.el.addEventListener('pointerup', this._pointer);
    this.el.addEventListener('pointercancel', this._pointer);
    this._scenePointer = () => this.clearPointerState();
    this.input.on('pointerdown', this._scenePointer);
    this.input.on('pointerup', this._scenePointer);
    this._click = (event) => {
      this.absorbPanelPointer(event);
      this.onClick(event);
    };
    this.el.addEventListener('click', this._click);
    if (this.onInput) {
      this._input = (event) => this.onInput(event);
      this.el.addEventListener('input', this._input);
    }
    if (this.onKeydown) {
      this._keydown = (event) => this.onKeydown(event);
      this.el.addEventListener('keydown', this._keydown);
    }

    for (const key of this.closeShortcutKeys()) {
      this.input.keyboard.on(`keydown-${key}`, () => this.close());
    }

    this._busSubs = [];
    for (const ev of this.refreshOn()) {
      const fn = () => this.refresh();
      bus.on(ev, fn);
      this._busSubs.push([ev, fn]);
    }
    bus.emit(Events.PANEL_OPEN, { id: this.scene.key });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  refreshOn(): string[] { return [Events.LANGUAGE_CHANGED, Events.INVENTORY_CHANGED, Events.GEAR_EQUIPPED]; }

  refresh() {
    htmlCache[this.cacheKey || ''] = '';
    this.render();
  }

  close() {
    this.clearPointerState();
    this.el.classList.add('hidden');
    if (this.openFlagName) uiState[this.openFlagName] = false;
    bus.emit(Events.PANEL_CLOSE, { id: this.scene.key });
    this.scene.resume('GameScene');
    restoreGameInputFocus(this);
    this.scene.stop();
  }

  cleanup() {
    if (this._click) this.el.removeEventListener('click', this._click);
    if (this._pointer) {
      this.el.removeEventListener('pointerdown', this._pointer);
      this.el.removeEventListener('pointerup', this._pointer);
      this.el.removeEventListener('pointercancel', this._pointer);
    }
    if (this._handoff) {
      this.el.removeEventListener('pointerenter', this._handoff);
      this.el.removeEventListener('pointermove', this._handoff);
      this.el.removeEventListener('focusin', this._handoff);
    }
    if (this._documentHandoff) {
      for (const eventName of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'focusin']) {
        document.removeEventListener(eventName, this._documentHandoff, true);
      }
    }
    if (this._scenePointer) {
      this.input.off('pointerdown', this._scenePointer);
      this.input.off('pointerup', this._scenePointer);
    }
    if (this._input) this.el.removeEventListener('input', this._input);
    if (this._keydown) this.el.removeEventListener('keydown', this._keydown);
    for (const [ev, fn] of this._busSubs) bus.off(ev, fn);
    this._busSubs = [];
  }
}
