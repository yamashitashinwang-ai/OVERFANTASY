import { Events } from '../../runtime/events.ts';
import {
  firstClassCandidates,
  selectFirstClass,
  selectSubclass,
  subclassCandidates
} from '../../domain/proficiency.ts';
import type { CareerSubclassId, ProficiencyId } from '../../domain/types.ts';
import { renderCareerPanel } from '../../ui/career.ts';
import { ModalPanelScene } from './ModalPanelScene.ts';

function confirmChoice(message: string): boolean {
  const confirmFn = (globalThis as typeof globalThis & { confirm?: (message?: string) => boolean }).confirm;
  return typeof confirmFn === 'function' ? confirmFn(message) : true;
}

export class CareerScene extends ModalPanelScene {
  constructor() { super('CareerScene', 'careerPanel', 'careerOpen'); }
  get cacheKey() { return 'career'; }
  render() { renderCareerPanel(); }
  refreshOn() {
    return [
      Events.LANGUAGE_CHANGED, Events.PLAYER_STATS, Events.PROFICIENCY_CHANGED,
      Events.PROFICIENCY_LEVEL_UP, Events.CAREER_CHANGED, Events.GAME_NEW,
      Events.GAME_LOADED
    ];
  }
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const actionButton = target?.closest<HTMLButtonElement>('button[data-career-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.careerAction;
    if (action === 'close') return this.close();
    if (action === 'selectFirst') {
      const id = actionButton.dataset.id as ProficiencyId | undefined;
      const label = firstClassCandidates().find(candidate => candidate.id === id)?.label || '该职业';
      if (id && confirmChoice(`确定选择第一职业：${label}？`)) selectFirstClass(id);
      this.refresh();
      return;
    }
    if (action === 'selectSubclass') {
      const id = actionButton.dataset.id as CareerSubclassId | undefined;
      const label = subclassCandidates().find(candidate => candidate.id === id)?.label || '该细分职业';
      if (id && confirmChoice(`确定选择细分职业：${label}？`)) selectSubclass(id);
      this.refresh();
    }
  }
}
