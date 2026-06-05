import { escapeHtml } from '../../domain/math.ts';
import {
  classTendencyLabel,
  careerState,
  firstClassCandidates,
  firstClassLabel,
  proficiencyCatalog,
  subclassCandidates,
  subclassLabel
} from '../../domain/proficiency.ts';
import { htmlCache } from '../cache.ts';
import { get } from '../dom.ts';
import { panelHeader } from '../panels-helpers.ts';

function statusLabel(selected: boolean, eligible: boolean, locked: boolean): string {
  if (selected) return '已确认';
  if (eligible) return '可选择';
  if (locked) return '路线已确认';
  return '条件未满足';
}

function statusClass(selected: boolean, eligible: boolean): string {
  if (selected) return 'selected';
  if (eligible) return 'eligible';
  return 'unmet';
}

function currentStatusHtml(): string {
  return `<section class="career-section">
    <h3>当前职业</h3>
    <div class="career-summary">
      <div><b>职业倾向</b><span>${escapeHtml(classTendencyLabel())}</span></div>
      <div><b>第一职业</b><span>${escapeHtml(firstClassLabel())}</span></div>
      <div><b>细分职业</b><span>${escapeHtml(subclassLabel())}</span></div>
    </div>
  </section>`;
}

function firstClassHtml(): string {
  const career = careerState();
  if (career.firstClassConfirmed && career.firstClass) {
    const label = proficiencyCatalog[career.firstClass].classLabel;
    return `<section class="career-section">
      <h3>第一职业选择</h3>
      <article class="career-card selected">
        <div class="career-card-head">
          <strong>${escapeHtml(label)}</strong>
          <span>已确认</span>
        </div>
        <p>第一职业已确认，本版暂不允许随意改选第一职业。</p>
      </article>
    </section>`;
  }
  const eligibleCandidates = firstClassCandidates().filter(candidate => candidate.eligible);
  if (!eligibleCandidates.length) {
    return `<section class="career-section">
      <h3>第一职业选择</h3>
      <p class="career-empty">任意熟练度达到 5 级后可以选择职业。</p>
    </section>`;
  }
  const cards = eligibleCandidates.map(candidate => {
    const status = statusLabel(candidate.selected, candidate.eligible, false);
    const disabled = candidate.eligible ? '' : ' disabled';
    return `<article class="career-card ${statusClass(candidate.selected, candidate.eligible)}">
      <div class="career-card-head">
        <strong>${escapeHtml(candidate.label)}</strong>
        <span>${escapeHtml(status)}</span>
      </div>
      <p>${escapeHtml(candidate.proficiencyLabel)} 当前 Lv${candidate.level}，需要 ${escapeHtml(candidate.conditionText)}。</p>
      <button type="button" data-career-action="selectFirst" data-id="${escapeHtml(candidate.id)}"${disabled}>确认第一职业</button>
    </article>`;
  }).join('');
  return `<section class="career-section">
    <h3>第一职业选择</h3>
    <div class="career-list">${cards}</div>
  </section>`;
}

function subclassHtml(): string {
  const career = careerState();
  if (!career.firstClassConfirmed || !career.firstClass) {
    return `<section class="career-section">
      <h3>第二职业 / 细分职业选择</h3>
      <p class="career-empty">选择第一职业后开放细分职业。</p>
    </section>`;
  }
  const cards = subclassCandidates().map(candidate => {
    const baseLabel = proficiencyCatalog[candidate.proficiencies[0]].label;
    const otherLabel = proficiencyCatalog[candidate.proficiencies[1]].label;
    const routeOther = candidate.proficiencies[0] === career.firstClass
      ? candidate.proficiencies[1]
      : candidate.proficiencies[0];
    const status = statusLabel(candidate.selected, candidate.eligible, career.subclassConfirmed);
    const disabled = candidate.eligible ? '' : ' disabled';
    return `<article class="career-card ${statusClass(candidate.selected, candidate.eligible)}">
      <div class="career-card-head">
        <strong>${escapeHtml(candidate.label)}</strong>
        <span>${escapeHtml(status)}</span>
      </div>
      <p>${escapeHtml(baseLabel)} + ${escapeHtml(otherLabel)}</p>
      <p>${escapeHtml(candidate.conditionText)}</p>
      <p>当前等级：${escapeHtml(proficiencyCatalog[career.firstClass].label)} Lv${candidate.baseLevel} / ${escapeHtml(proficiencyCatalog[routeOther].label)} Lv${candidate.otherLevel}</p>
      <p>${escapeHtml(candidate.effectText)}</p>
      <button type="button" data-career-action="selectSubclass" data-id="${escapeHtml(candidate.id)}"${disabled}>确认细分职业</button>
    </article>`;
  }).join('');
  const lockedNote = career.subclassConfirmed
    ? `<p class="career-note">当前细分职业已确认，本版暂不允许随意改选第一职业或细分职业。</p>`
    : '';
  return `<section class="career-section">
    <h3>第二职业 / 细分职业选择</h3>
    ${lockedNote}
    <div class="career-list">${cards}</div>
  </section>`;
}

export function renderCareerPanel() {
  const html = [
    panelHeader('职业选择', 'career'),
    `<div class="career-scroll">`,
    currentStatusHtml(),
    firstClassHtml(),
    subclassHtml(),
    `<div class="career-actions"><button type="button" data-career-action="close">暂不选择</button></div>`,
    `</div>`
  ].join('');

  if (html !== htmlCache.career) {
    get.careerPanelEl.innerHTML = html;
    htmlCache.career = html;
  }
}
