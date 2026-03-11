import type { Experience, LanguageSkillItem, LearningTechnology } from './types';
import {
  aggregateLearningTechnologies,
  aggregateTechnologyDurations,
  formatDurationEn,
  formatDurationJp,
} from './tables';

export function renderTechnologyBars(experiences: Experience[], locale: 'jp' | 'en', limit = 10): string {
  const totals = aggregateTechnologyDurations(experiences, locale)
    .filter((item) => item.workMonths > 0)
    .slice(0, limit);

  if (totals.length === 0) {
    return locale === 'jp'
      ? '<p>可視化できる実務データがありません。</p>'
      : '<p>No work-experience data is available for visualization.</p>';
  }

  const maxMonths = Math.max(...totals.map((item) => item.workMonths), 1);
  const rows = totals
    .map((item) => {
      const width = Math.max(6, Math.round((item.workMonths / maxMonths) * 100));
      const duration = locale === 'jp'
        ? formatDurationJp(item.workMonths)
        : formatDurationEn(item.workMonths);

      return `  <div class="career-chart-row">\n    <div class="career-chart-meta">\n      <span class="career-chart-name">${item.name}</span>\n      <span class="career-chart-value">${duration}</span>\n    </div>\n    <div class="career-chart-track">\n      <div class="career-chart-fill" style="width:${width}%"></div>\n    </div>\n  </div>`;
    })
    .join('\n');

  const caption = locale === 'jp'
    ? `実務経験の長い順に上位${totals.length}件を表示`
    : `Top ${totals.length} technologies by work-experience duration`;

  return `<div class="career-chart" role="img" aria-label="${caption}">\n${rows}\n  <p class="career-chart-caption">${caption}</p>\n</div>`;
}

export function renderTechnologySummary(experiences: Experience[], learningItems: LearningTechnology[], locale: 'jp' | 'en'): string {
  const totals = aggregateTechnologyDurations(experiences, locale);
  const overOneYear = totals.filter((item) => item.workMonths >= 12).length;
  const underOneYear = totals.filter((item) => item.workMonths > 0 && item.workMonths < 12).length;
  const learning = aggregateLearningTechnologies(learningItems, locale).length;

  const rows = locale === 'jp'
    ? [
      { label: '実務1年以上', value: overOneYear },
      { label: '実務1年未満', value: underOneYear },
      { label: '学習中', value: learning },
    ]
    : [
      { label: '1+ Year Work Experience', value: overOneYear },
      { label: 'Under 1 Year Work Experience', value: underOneYear },
      { label: 'Learning', value: learning },
    ];

  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const rowHtml = rows
    .map((row) => {
      const width = Math.max(8, Math.round((row.value / maxValue) * 100));
      return `  <div class="career-chart-row">\n    <div class="career-chart-meta">\n      <span class="career-chart-name">${row.label}</span>\n      <span class="career-chart-value">${row.value}</span>\n    </div>\n    <div class="career-chart-track">\n      <div class="career-chart-fill" style="width:${width}%"></div>\n    </div>\n  </div>`;
    })
    .join('\n');

  const caption = locale === 'jp'
    ? '技術カテゴリごとの件数'
    : 'Count by technology category';

  return `<div class="career-chart" role="img" aria-label="${caption}">\n${rowHtml}\n  <p class="career-chart-caption">${caption}</p>\n</div>`;
}

function levelToScore(levelText: string): number {
  const stars = (levelText.match(/⭐/g) || []).length;
  if (stars > 0) {
    return Math.min(4, stars);
  }

  const lowered = levelText.toLowerCase();
  if (lowered.includes('native') || lowered.includes('母国語')) {
    return 4;
  }
  if (lowered.includes('business') || lowered.includes('ビジネス')) {
    return 3;
  }
  return 1;
}

export function renderLanguageBars(items: LanguageSkillItem[], locale: 'jp' | 'en'): string {
  if (items.length === 0) {
    return locale === 'jp'
      ? '<p>可視化できる言語データがありません。</p>'
      : '<p>No language data is available for visualization.</p>';
  }

  const rows = items
    .map((item) => {
      const name = locale === 'jp' ? item.jpName : item.enName;
      const level = locale === 'jp' ? item.jpLevel : item.enLevel;
      const experience = locale === 'jp' ? item.jpExperience : item.enExperience;
      const score = levelToScore(level);
      const width = Math.round((score / 4) * 100);

      return `  <div class="career-chart-row">\n    <div class="career-chart-meta">\n      <span class="career-chart-name">${name}</span>\n      <span class="career-chart-value">${level} / ${experience}</span>\n    </div>\n    <div class="career-chart-track">\n      <div class="career-chart-fill" style="width:${width}%"></div>\n    </div>\n  </div>`;
    })
    .join('\n');

  const caption = locale === 'jp'
    ? '言語レベルの目安（4段階）'
    : 'Language level guide (4-step scale)';

  return `<div class="career-chart" role="img" aria-label="${caption}">\n${rows}\n  <p class="career-chart-caption">${caption}</p>\n</div>`;
}
