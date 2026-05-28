// PauseScene — a parallel overlay scene launched from GameScene when the
// player hits Esc during play. While this scene is active GameScene is
// paused via `scene.pause` so its update loop halts but its display layer
// stays visible behind us. Esc here resumes GameScene; this scene then stops.
//
// This is the model for every modal/overlay scene (Backpack, Quest, Shop, …):
//   GameScene  →  this.scene.launch('PauseScene'); this.scene.pause();
//   PauseScene →  this.scene.resume('GameScene');  this.scene.stop();

import Phaser from 'phaser';
import { bus, Events } from '../runtime/events.ts';
import { t } from '../domain/i18n.ts';

const PAUSE_EL_ID = 'pauseMenu';

export class PauseScene extends Phaser.Scene {
  private el!: HTMLElement;
  private lastHtml = '';
  private _langSub?: () => void;
  private _clickSub?: (event: MouseEvent) => void;

  constructor() { super({ key: 'PauseScene' }); }

  create() {
    this.el = document.getElementById(PAUSE_EL_ID) as HTMLElement;
    this.lastHtml = '';

    // Render the panel HTML on create + on language change.
    this.render();
    this._langSub = () => { this.lastHtml = ''; this.render(); };
    bus.on(Events.LANGUAGE_CHANGED, this._langSub);

    // Esc closes us and resumes the gameplay scene.
    this.input.keyboard.on('keydown-ESC', () => this.close());

    // Button clicks routed via bus events; GameScene listens and handles
    // save/return-to-menu so this scene stays free of domain logic.
    this._clickSub = (event) => {
      const btn = (event.target as Element | null)?.closest('button[data-pause-action]') as HTMLButtonElement | null;
      if (!btn) return;
      bus.emit(Events.PANEL_CLOSE, { id: 'pause', action: btn.dataset.pauseAction });
      this.close();
    };
    this.el.addEventListener('click', this._clickSub);

    // Tell GameScene we opened. Useful for telemetry / autosave hooks.
    bus.emit(Events.GAME_PAUSED);
    bus.emit(Events.PANEL_OPEN, { id: 'pause' });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  render() {
    const html = `<div class="pause-card"><h2>${t('pause.title')}</h2><p class="menu-note">${t('pause.text')}</p><div class="pause-actions"><button type="button" data-pause-action="save">${t('pause.save')}</button><button type="button" data-pause-action="main">${t('pause.main')}</button></div></div>`;
    if (html !== this.lastHtml) {
      this.el.innerHTML = html;
      this.lastHtml = html;
    }
    this.el.classList.remove('hidden');
  }

  close() {
    this.el.classList.add('hidden');
    this.scene.resume('GameScene');
    bus.emit(Events.GAME_RESUMED);
    this.scene.stop();
  }

  cleanup() {
    if (this._langSub) bus.off(Events.LANGUAGE_CHANGED, this._langSub);
    if (this._clickSub && this.el) this.el.removeEventListener('click', this._clickSub);
  }
}
