import * as fs from 'fs';
import {
  dataPath,
  futureLearningPlanPath,
  futureWorkRoadmapPath,
  includeDir,
  languageSkillsPath,
  learningDataPath,
  certificationsPath,
  personalProjectsPath,
  careerSummaryPath,
  outputFutureWorkRoadmapEn,
  outputFutureWorkRoadmapJp,
  outputLanguageBarsEn,
  outputLanguageBarsJp,
  outputLanguageSkillsEn,
  outputLanguageSkillsJp,
  outputLearningPlanEn,
  outputLearningPlanJp,
  outputTechBarsEn,
  outputTechBarsJp,
  outputTechSummaryEn,
  outputTechSummaryJp,
  outputTechTotalsEn,
  outputTechTotalsJp,
  outputTotalEn,
  outputTotalJp,
  outputWorkEn,
  outputWorkJp,
  rootDir,
} from './career/paths';
import {
  buildTotals,
  formatDateForFrontMatter,
  renderEnCareerSummary,
  renderEnCertifications,
  renderEnFutureWorkRoadmap,
  renderEnLanguageSkills,
  renderEnLearningPlan,
  renderEnPersonalProjects,
  renderEnTechnologyTotals,
  renderEnWorkSection,
  renderJpCareerSummary,
  renderJpCertifications,
  renderJpFutureWorkRoadmap,
  renderJpLanguageSkills,
  renderJpLearningPlan,
  renderJpPersonalProjects,
  renderJpTechnologyTotals,
  renderJpWorkTable,
  updateFooterLastUpdated,
  updateLastModifiedAt,
} from './career/tables';
import {
  renderLanguageBars,
  renderTechnologyBars,
  renderTechnologySummary,
} from './career/charts';
import type {
  CareerSummaryItem,
  CertificationGroup,
  Experience,
  FutureLearningPlanItem,
  FutureWorkRoadmapItem,
  LanguageSkillItem,
  LearningTechnology,
  PersonalProjectItem,
} from './career/types';
import * as path from 'path';

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function stripHtmlTags(input: string): string {
  return input.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();
}

function renderBarChart(
  ariaLabel: string,
  caption: string,
  rows: Array<{ label: string; valueLabel: string; numericValue: number }>
): string {
  if (rows.length === 0) {
    return `<div class="career-chart"><p class="career-chart-caption">${caption}</p></div>`;
  }

  const max = Math.max(...rows.map((row) => row.numericValue), 1);
  const rowHtml = rows
    .map((row) => {
      const width = Math.max(12, Math.round((row.numericValue / max) * 100));
      return [
        '  <div class="career-chart-row">',
        '    <div class="career-chart-meta">',
        `      <span class="career-chart-name">${row.label}</span>`,
        `      <span class="career-chart-value">${row.valueLabel}</span>`,
        '    </div>',
        '    <div class="career-chart-track">',
        `      <div class="career-chart-fill" style="width:${width}%"></div>`,
        '    </div>',
        '  </div>',
      ].join('\n');
    })
    .join('\n');

  return `<div class="career-chart" role="img" aria-label="${ariaLabel}">\n${rowHtml}\n  <p class="career-chart-caption">${caption}</p>\n</div>`;
}

function renderCertificationVisual(
  groups: CertificationGroup[],
  locale: 'jp' | 'en'
): string {
  const byCategory = groups.map((group) => ({
    label: locale === 'jp' ? stripHtmlTags(group.categoryJp) : stripHtmlTags(group.categoryEn),
    count: group.items.length,
  }));

  const categoryChart = renderBarChart(
    locale === 'jp' ? '資格カテゴリ件数サマリー' : 'Certification count by category',
    locale === 'jp'
      ? `資格カテゴリ別の件数（合計${byCategory.reduce((a, b) => a + b.count, 0)}件）`
      : `Certification count by category (total: ${byCategory.reduce((a, b) => a + b.count, 0)})`,
    byCategory.map((item) => ({
      label: item.label,
      valueLabel: locale === 'jp' ? `${item.count}件` : `${item.count}`,
      numericValue: item.count,
    }))
  );

  const yearCounts = new Map<string, number>();
  groups.forEach((group) => {
    group.items.forEach((item) => {
      const raw = locale === 'jp' ? item.obtainedJp : item.obtainedEn;
      const m = raw.match(/(\d{4})/);
      if (!m) {
        return;
      }
      const y = m[1];
      yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
    });
  });

  const yearRows = [...yearCounts.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, count]) => ({
      label: year,
      valueLabel: locale === 'jp' ? `${count}件` : `${count}`,
      numericValue: count,
    }));

  const yearChart = renderBarChart(
    locale === 'jp' ? '資格の取得年推移' : 'Certification timeline by year',
    locale === 'jp' ? '取得年ごとの件数' : 'Certifications by obtained year',
    yearRows
  );

  return `${categoryChart}\n\n${yearChart}`;
}

function renderProjectVisual(
  projects: PersonalProjectItem[],
  locale: 'jp' | 'en'
): string {
  const progressCounts = new Map<string, number>();
  projects.forEach((project) => {
    const key = (locale === 'jp' ? project.progressJp : project.progressEn).trim();
    progressCounts.set(key, (progressCounts.get(key) || 0) + 1);
  });

  const progressRows = [...progressCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      valueLabel: locale === 'jp' ? `${count}件` : `${count}`,
      numericValue: count,
    }));

  const progressChart = renderBarChart(
    locale === 'jp' ? '個人開発の進捗サマリー' : 'Project progress summary',
    locale === 'jp'
      ? `進捗ステータス別の件数（合計${projects.length}件）`
      : `Project count by progress status (total: ${projects.length})`,
    progressRows
  );

  const techCounts = new Map<string, number>();
  projects.forEach((project) => {
    const techList = locale === 'jp' ? project.technologiesJp : project.technologiesEn;
    techList.forEach((tech) => {
      const key = tech.trim();
      if (!key) {
        return;
      }
      techCounts.set(key, (techCounts.get(key) || 0) + 1);
    });
  });

  const techRows = [...techCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([label, count]) => ({
      label,
      valueLabel: locale === 'jp' ? `${count}件` : `${count}`,
      numericValue: count,
    }));

  const techChart = renderBarChart(
    locale === 'jp' ? '採用技術の頻度' : 'Technology usage frequency',
    locale === 'jp' ? '個人開発での採用技術（上位8件）' : 'Top 8 technologies used in personal projects',
    techRows
  );

  return `${progressChart}\n\n${techChart}`;
}

function main(): void {
  const now = new Date();
  const dateText = formatDateForFrontMatter(now);

  if (!fs.existsSync(includeDir)) {
    fs.mkdirSync(includeDir, { recursive: true });
  }

  const experiences = readJson<Experience[]>(dataPath);
  const learningItems = readJson<LearningTechnology[]>(learningDataPath);
  const futureLearningPlan = readJson<FutureLearningPlanItem[]>(futureLearningPlanPath);
  const futureWorkRoadmap = readJson<FutureWorkRoadmapItem[]>(futureWorkRoadmapPath);
  const languageSkills = readJson<LanguageSkillItem[]>(languageSkillsPath);
  const certifications = readJson<CertificationGroup[]>(certificationsPath);
  const personalProjects = readJson<PersonalProjectItem[]>(personalProjectsPath);
  const careerSummary = readJson<CareerSummaryItem[]>(careerSummaryPath);

  const totals = buildTotals(experiences, now);
  writeFile(outputTotalJp, totals.jp);
  writeFile(outputTotalEn, totals.en);

  writeFile(outputWorkJp, renderJpWorkTable(experiences, now));
  writeFile(outputWorkEn, renderEnWorkSection(experiences, now));

  writeFile(outputTechTotalsJp, renderJpTechnologyTotals(experiences, learningItems));
  writeFile(outputTechTotalsEn, renderEnTechnologyTotals(experiences, learningItems));

  writeFile(outputTechBarsJp, renderTechnologyBars(experiences, 'jp'));
  writeFile(outputTechBarsEn, renderTechnologyBars(experiences, 'en'));

  writeFile(outputTechSummaryJp, renderTechnologySummary(experiences, learningItems, 'jp'));
  writeFile(outputTechSummaryEn, renderTechnologySummary(experiences, learningItems, 'en'));

  writeFile(outputLearningPlanJp, renderJpLearningPlan(futureLearningPlan));
  writeFile(outputLearningPlanEn, renderEnLearningPlan(futureLearningPlan));

  writeFile(outputFutureWorkRoadmapJp, renderJpFutureWorkRoadmap(futureWorkRoadmap));
  writeFile(outputFutureWorkRoadmapEn, renderEnFutureWorkRoadmap(futureWorkRoadmap));

  writeFile(outputLanguageSkillsJp, renderJpLanguageSkills(languageSkills));
  writeFile(outputLanguageSkillsEn, renderEnLanguageSkills(languageSkills));

  writeFile(outputLanguageBarsJp, renderLanguageBars(languageSkills, 'jp'));
  writeFile(outputLanguageBarsEn, renderLanguageBars(languageSkills, 'en'));

  const certsJpPath = path.join(includeDir, 'certifications-jp.html');
  const certsEnPath = path.join(includeDir, 'certifications-en.html');
  writeFile(certsJpPath, renderJpCertifications(certifications));
  writeFile(certsEnPath, renderEnCertifications(certifications));

  const projectsJpPath = path.join(includeDir, 'personal-projects-jp.html');
  const projectsEnPath = path.join(includeDir, 'personal-projects-en.html');
  writeFile(projectsJpPath, renderJpPersonalProjects(personalProjects));
  writeFile(projectsEnPath, renderEnPersonalProjects(personalProjects));

  const summaryJpPath = path.join(includeDir, 'career-summary-jp.html');
  const summaryEnPath = path.join(includeDir, 'career-summary-en.html');
  writeFile(summaryJpPath, renderJpCareerSummary(careerSummary));
  writeFile(summaryEnPath, renderEnCareerSummary(careerSummary));

  const certificationsVisualJpPath = path.join(includeDir, 'certifications-visual-jp.html');
  const certificationsVisualEnPath = path.join(includeDir, 'certifications-visual-en.html');
  writeFile(certificationsVisualJpPath, renderCertificationVisual(certifications, 'jp'));
  writeFile(certificationsVisualEnPath, renderCertificationVisual(certifications, 'en'));

  const projectsVisualJpPath = path.join(includeDir, 'projects-visual-jp.html');
  const projectsVisualEnPath = path.join(includeDir, 'projects-visual-en.html');
  writeFile(projectsVisualJpPath, renderProjectVisual(personalProjects, 'jp'));
  writeFile(projectsVisualEnPath, renderProjectVisual(personalProjects, 'en'));

  const careerJpDoc = path.join(rootDir, 'doc', 'Career_JP.md');
  const careerEnDoc = path.join(rootDir, 'doc', 'Career_EN.md');
  if (fs.existsSync(careerJpDoc)) {
    updateLastModifiedAt(careerJpDoc, dateText);
    updateFooterLastUpdated(careerJpDoc, 'jp', now);
  }
  if (fs.existsSync(careerEnDoc)) {
    updateLastModifiedAt(careerEnDoc, dateText);
    updateFooterLastUpdated(careerEnDoc, 'en', now);
  }

  console.log('[career:update] Career sections generated successfully.');
}

main();
