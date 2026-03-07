/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

type LocalizedExperience = {
  role: string;
  scope: string;
  technologies: TechnologyDuration[];
  achievements: string[];
};

type TechnologyDuration = {
  name: string;
  years: number;
  months: number;
  learning?: boolean;
  certifications?: string[];
};

type Experience = {
  id: string;
  startYm: string;
  endYm: string | null;
  isCurrent: boolean;
  jp: LocalizedExperience;
  en: LocalizedExperience;
};

type LearningTechnology = {
  jpName: string;
  enName: string;
  years: number;
  months: number;
  certifications?: string[];
};

type FutureLearningPlanItem = {
  priorityJp: string;
  priorityEn: string;
  domainJp: string;
  domainEn: string;
  technologiesJp: string;
  technologiesEn: string;
  timelineJp: string;
  timelineEn: string;
  purposeJp: string;
  purposeEn: string;
};

type LanguageSkillItem = {
  jpName: string;
  enName: string;
  jpLevel: string;
  enLevel: string;
  jpExperience: string;
  enExperience: string;
  jpUsage: string;
  enUsage: string;
};

type YearMonth = { year: number; month: number };

const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'doc', 'career-data', 'work-experiences.json');
const learningDataPath = path.join(rootDir, 'doc', 'career-data', 'learning-technologies.json');
const futureLearningPlanPath = path.join(rootDir, 'doc', 'career-data', 'future-learning-plan.json');
const languageSkillsPath = path.join(rootDir, 'doc', 'career-data', 'language-skills.json');
const includeDir = path.join(rootDir, '_includes', 'career');
const outputTotalJp = path.join(includeDir, 'total-experience-jp.txt');
const outputTotalEn = path.join(includeDir, 'total-experience-en.txt');
const outputWorkJp = path.join(includeDir, 'work-experience-jp.html');
const outputWorkEn = path.join(includeDir, 'work-experience-en.md');
const outputTechTotalsJp = path.join(includeDir, 'technology-totals-jp.md');
const outputTechTotalsEn = path.join(includeDir, 'technology-totals-en.md');
const outputLearningPlanJp = path.join(includeDir, 'learning-plan-jp.md');
const outputLearningPlanEn = path.join(includeDir, 'learning-plan-en.md');
const outputLanguageSkillsJp = path.join(includeDir, 'language-skills-jp.md');
const outputLanguageSkillsEn = path.join(includeDir, 'language-skills-en.md');
const careerJpPath = path.join(rootDir, 'doc', 'Career_JP.md');
const careerEnPath = path.join(rootDir, 'doc', 'Career_EN.md');

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseYm(value: string): YearMonth {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid YYYY-MM format: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month in YYYY-MM: ${value}`);
  }

  return { year, month };
}

function compareYm(a: YearMonth, b: YearMonth): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return a.month - b.month;
}

function monthsInclusive(start: YearMonth, end: YearMonth): number {
  return (end.year - start.year) * 12 + (end.month - start.month) + 1;
}

function monthsToNow(start: YearMonth, now: Date): number {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const months = (currentYear - start.year) * 12 + (currentMonth - start.month);
  return Math.max(months, 0);
}

function formatDurationJp(totalMonths: number): string {
  const normalized = Math.max(0, totalMonths);
  const years = Math.floor(normalized / 12);
  const months = normalized % 12;

  if (years > 0 && months > 0) {
    return `${years}年${months}か月`;
  }
  if (years > 0) {
    // Hide 0か月 when years exist.
    return `${years}年`;
  }
  return `${months}か月`;
}

function formatDurationEn(totalMonths: number): string {
  const normalized = Math.max(0, totalMonths);
  const years = Math.floor(normalized / 12);
  const months = normalized % 12;

  const yearPart = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthPart = `${months} month${months !== 1 ? 's' : ''}`;

  if (yearPart && months > 0) {
    return `${yearPart} ${monthPart}`;
  }
  if (yearPart && months === 0) {
    // Hide 0 months when years exist.
    return yearPart;
  }
  return monthPart;
}

function toTotalMonths(item: TechnologyDuration): number {
  const normalizedYears = Math.max(0, item.years);
  const normalizedMonths = Math.max(0, item.months);
  return normalizedYears * 12 + normalizedMonths;
}

function formatTechJp(item: TechnologyDuration): string {
  return `${item.name}（${formatDurationJp(toTotalMonths(item))}）`;
}

function formatTechEn(item: TechnologyDuration): string {
  return `${item.name} (${formatDurationEn(toTotalMonths(item))})`;
}

function validateTechnology(item: TechnologyDuration, context: string): void {
  if (!item.name || typeof item.name !== 'string') {
    throw new Error(`Invalid technology name at ${context}`);
  }
  if (!Number.isFinite(item.years) || !Number.isFinite(item.months)) {
    throw new Error(`Invalid years/months at ${context}`);
  }
  if (item.certifications && !Array.isArray(item.certifications)) {
    throw new Error(`Invalid certifications at ${context}`);
  }
}

function validateLearningTechnologies(items: LearningTechnology[]): void {
  items.forEach((item, index) => {
    if (!item.jpName || typeof item.jpName !== 'string') {
      throw new Error(`Invalid jpName at learning-technologies[${index}]`);
    }
    if (!item.enName || typeof item.enName !== 'string') {
      throw new Error(`Invalid enName at learning-technologies[${index}]`);
    }
    if (!Number.isFinite(item.years) || !Number.isFinite(item.months)) {
      throw new Error(`Invalid years/months at learning-technologies[${index}]`);
    }
    if (item.certifications && !Array.isArray(item.certifications)) {
      throw new Error(`Invalid certifications at learning-technologies[${index}]`);
    }
  });
}

function validateFutureLearningPlan(items: FutureLearningPlanItem[]): void {
  if (items.length === 0) {
    throw new Error('future-learning-plan.json is empty. Add at least one plan item.');
  }

  items.forEach((item, index) => {
    const required = [
      item.priorityJp,
      item.priorityEn,
      item.domainJp,
      item.domainEn,
      item.technologiesJp,
      item.technologiesEn,
      item.timelineJp,
      item.timelineEn,
      item.purposeJp,
      item.purposeEn,
    ];
    if (required.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`Invalid future learning plan item at index ${index}`);
    }
  });
}

function validateLanguageSkills(items: LanguageSkillItem[]): void {
  if (items.length === 0) {
    throw new Error('language-skills.json is empty. Add at least one language skill item.');
  }

  items.forEach((item, index) => {
    const required = [
      item.jpName,
      item.enName,
      item.jpLevel,
      item.enLevel,
      item.jpExperience,
      item.enExperience,
      item.jpUsage,
      item.enUsage,
    ];
    if (required.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`Invalid language skill item at index ${index}`);
    }
  });
}

function toStars(totalMonths: number, isLearning: boolean): string {
  if (isLearning) {
    return '⭐';
  }
  if (totalMonths >= 36) {
    return '⭐⭐⭐⭐';
  }
  if (totalMonths >= 24) {
    return '⭐⭐⭐';
  }
  if (totalMonths >= 12) {
    return '⭐⭐';
  }
  return '⭐';
}

function monthName(month: number): string {
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return names[month - 1];
}

function formatDateForFrontMatter(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateLastModifiedAt(filePath: string, dateText: string): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const replaced = content.replace(
    /^last_modified_at:\s*\d{4}-\d{2}-\d{2}$/m,
    `last_modified_at: ${dateText}`
  );

  if (replaced !== content) {
    fs.writeFileSync(filePath, replaced, 'utf8');
  }
}

function validateExperiences(experiences: Experience[]): void {
  if (experiences.length === 0) {
    throw new Error('work-experiences.json is empty. Add at least one experience.');
  }

  const currentEntries = experiences.filter((item) => item.isCurrent);
  if (currentEntries.length !== 1) {
    throw new Error('Exactly one experience must have isCurrent=true.');
  }

  const latest = [...experiences].sort((a, b) => {
    const ay = parseYm(a.startYm);
    const by = parseYm(b.startYm);
    return compareYm(by, ay);
  })[0];

  if (!latest.isCurrent) {
    throw new Error('The latest experience by startYm must have isCurrent=true.');
  }

  if (latest.endYm !== null) {
    throw new Error('The current experience must have endYm=null.');
  }

  experiences.forEach((exp, expIndex) => {
    exp.jp.technologies.forEach((tech, techIndex) => {
      validateTechnology(tech, `experiences[${expIndex}].jp.technologies[${techIndex}]`);
    });
    exp.en.technologies.forEach((tech, techIndex) => {
      validateTechnology(tech, `experiences[${expIndex}].en.technologies[${techIndex}]`);
    });
  });
}

function aggregateTechnologyDurations(
  experiences: Experience[],
  locale: 'jp' | 'en'
): Array<{
  name: string;
  totalMonths: number;
  workMonths: number;
  learningMonths: number;
  learning: boolean;
  hasWorkExperience: boolean;
  certifications: string[];
}> {
  const totals = new Map<string, {
    name: string;
    totalMonths: number;
    workMonths: number;
    learningMonths: number;
    learning: boolean;
    hasWorkExperience: boolean;
    certifications: Set<string>;
  }>();

  experiences.forEach((exp) => {
    const list = locale === 'jp' ? exp.jp.technologies : exp.en.technologies;
    list.forEach((tech) => {
      const key = tech.name.trim().toLowerCase();
      const totalMonths = toTotalMonths(tech);
      const isLearning = Boolean(tech.learning);
      // All entries in work-experiences.json are treated as work exposure.
      const workMonths = totalMonths;
      const learningMonths = isLearning ? totalMonths : 0;
      const current = totals.get(key);
      const certs = new Set((tech.certifications || []).map((item) => item.trim()).filter(Boolean));

      if (current) {
        current.totalMonths += totalMonths;
        current.workMonths += workMonths;
        current.learningMonths += learningMonths;
        current.learning = current.learning || isLearning;
        current.hasWorkExperience = true;
        certs.forEach((c) => current.certifications.add(c));
      } else {
        totals.set(key, {
          name: tech.name,
          totalMonths,
          workMonths,
          learningMonths,
          learning: isLearning,
          hasWorkExperience: true,
          certifications: certs,
        });
      }
    });
  });

  return [...totals.values()]
    .map((item) => ({
      name: item.name,
      totalMonths: item.totalMonths,
      workMonths: item.workMonths,
      learningMonths: item.learningMonths,
      learning: item.learning,
      hasWorkExperience: item.hasWorkExperience,
      certifications: [...item.certifications].sort(),
    }))
    .sort((a, b) => {
    if (a.workMonths !== b.workMonths) {
      return b.workMonths - a.workMonths;
    }
    return a.name.localeCompare(b.name);
  });
}

function aggregateLearningTechnologies(
  learningItems: LearningTechnology[],
  locale: 'jp' | 'en'
): Array<{ name: string; totalMonths: number; certifications: string[] }> {
  const totals = new Map<string, {
    name: string;
    totalMonths: number;
    certifications: Set<string>;
  }>();

  learningItems.forEach((item) => {
    const name = locale === 'jp' ? item.jpName : item.enName;
    const key = name.trim().toLowerCase();
    const totalMonths = Math.max(0, item.years) * 12 + Math.max(0, item.months);
    const certs = new Set((item.certifications || []).map((c) => c.trim()).filter(Boolean));
    const current = totals.get(key);

    if (current) {
      current.totalMonths += totalMonths;
      certs.forEach((c) => current.certifications.add(c));
    } else {
      totals.set(key, {
        name,
        totalMonths,
        certifications: certs,
      });
    }
  });

  return [...totals.values()]
    .map((item) => ({
      name: item.name,
      totalMonths: item.totalMonths,
      certifications: [...item.certifications].sort(),
    }))
    .sort((a, b) => {
      if (a.totalMonths !== b.totalMonths) {
        return b.totalMonths - a.totalMonths;
      }
      return a.name.localeCompare(b.name);
    });
}

function renderJpTechnologyTotals(experiences: Experience[], learningItems: LearningTechnology[]): string {
  const totals = aggregateTechnologyDurations(experiences, 'jp');
  const workOverOneYear = totals.filter((item) => item.hasWorkExperience && item.workMonths >= 12);
  const workUnderOneYear = totals.filter((item) => item.hasWorkExperience && item.workMonths > 0 && item.workMonths < 12);
  const learningOnly = aggregateLearningTechnologies(learningItems, 'jp');
  const workMonthsMap = new Map(
    totals.map((item) => [item.name.trim().toLowerCase(), item.workMonths])
  );

  const workOverOneYearRows = workOverOneYear
    .map((item) => {
      const stars = toStars(item.workMonths, false);
      const certNote = item.certifications.length > 0
        ? `※${item.certifications.join('、')}取得済み`
        : '-';
      return `| ${item.name} | ${formatDurationJp(item.workMonths)} | ${stars} | ${certNote} |`;
    })
    .join('\n');

  const workUnderOneYearRows = workUnderOneYear
    .map((item) => {
      const stars = toStars(item.workMonths, false);
      const certNote = item.certifications.length > 0
        ? `※${item.certifications.join('、')}取得済み`
        : '-';
      return `| ${item.name} | ${formatDurationJp(item.workMonths)} | ${stars} | ${certNote} |`;
    })
    .join('\n');

  const learningRows = learningOnly
    .map((item) => {
      const stars = toStars(item.totalMonths, true);
      const notes: string[] = [];
      const workMonths = workMonthsMap.get(item.name.trim().toLowerCase()) || 0;
      if (workMonths > 0) {
        notes.push(`業務でも使用: ${formatDurationJp(workMonths)}`);
      }
      if (item.certifications.length > 0) {
        notes.push(`※${item.certifications.join('、')}取得済み`);
      }
      const noteText = notes.length > 0 ? notes.join(' / ') : '-';
      return `| ${item.name} | ${formatDurationJp(item.totalMonths)} | ${stars} | ${noteText} |`;
    })
    .join('\n');

  return `### 主要技術の累計経験（職歴合算）\n\n#### 戦力になれる分野（実務経験 1年以上）\n\n| 技術 | 累計経験 | 目安評価 | 備考 |\n|---|---|---|---|\n${workOverOneYearRows || '| - | - | - | - |'}\n\n#### 業務経験あり（実務経験 1年未満）\n\n| 技術 | 累計経験 | 目安評価 | 備考 |\n|---|---|---|---|\n${workUnderOneYearRows || '| - | - | - | - |'}\n\n#### 学習中の技術\n\n| 技術 | 学習期間 | 目安評価 | 備考 |\n|---|---|---|---|\n${learningRows || '| - | - | - | - |'}`;
}

function renderEnTechnologyTotals(experiences: Experience[], learningItems: LearningTechnology[]): string {
  const totals = aggregateTechnologyDurations(experiences, 'en');
  const workOverOneYear = totals.filter((item) => item.hasWorkExperience && item.workMonths >= 12);
  const workUnderOneYear = totals.filter((item) => item.hasWorkExperience && item.workMonths > 0 && item.workMonths < 12);
  const learningOnly = aggregateLearningTechnologies(learningItems, 'en');
  const workMonthsMap = new Map(
    totals.map((item) => [item.name.trim().toLowerCase(), item.workMonths])
  );

  const workOverOneYearRows = workOverOneYear
    .map((item) => {
      const stars = toStars(item.workMonths, false);
      const certNote = item.certifications.length > 0
        ? `* Certified: ${item.certifications.join(', ')}`
        : '-';
      return `| ${item.name} | ${formatDurationEn(item.workMonths)} | ${stars} | ${certNote} |`;
    })
    .join('\n');

  const workUnderOneYearRows = workUnderOneYear
    .map((item) => {
      const stars = toStars(item.workMonths, false);
      const certNote = item.certifications.length > 0
        ? `* Certified: ${item.certifications.join(', ')}`
        : '-';
      return `| ${item.name} | ${formatDurationEn(item.workMonths)} | ${stars} | ${certNote} |`;
    })
    .join('\n');

  const learningRows = learningOnly
    .map((item) => {
      const stars = toStars(item.totalMonths, true);
      const notes: string[] = [];
      const workMonths = workMonthsMap.get(item.name.trim().toLowerCase()) || 0;
      if (workMonths > 0) {
        notes.push(`Also used in work: ${formatDurationEn(workMonths)}`);
      }
      if (item.certifications.length > 0) {
        notes.push(`* Certified: ${item.certifications.join(', ')}`);
      }
      const noteText = notes.length > 0 ? notes.join(' / ') : '-';
      return `| ${item.name} | ${formatDurationEn(item.totalMonths)} | ${stars} | ${noteText} |`;
    })
    .join('\n');

  return `### Combined Technology Experience (Across Work History)\n\n#### Ready-To-Contribute Areas (1+ Year Work Experience)\n\n| Technology | Total Experience | Rating Guide | Notes |\n|---|---|---|---|\n${workOverOneYearRows || '| - | - | - | - |'}\n\n#### Work Experience Under 1 Year\n\n| Technology | Total Experience | Rating Guide | Notes |\n|---|---|---|---|\n${workUnderOneYearRows || '| - | - | - | - |'}\n\n#### Learning Technologies\n\n| Technology | Learning Period | Rating Guide | Notes |\n|---|---|---|---|\n${learningRows || '| - | - | - | - |'}`;
}

function renderJpLearningPlan(items: FutureLearningPlanItem[]): string {
  const rows = items
    .map((item) => `| ${item.priorityJp} | ${item.domainJp} | ${item.technologiesJp} | ${item.timelineJp} | ${item.purposeJp} |`)
    .join('\n');

  return `| 優先度 | 技術分野 | 技術・フレームワーク | 学習予定時期 | 学習目的・用途 |
|---|---|---|---|---|
${rows}`;
}

function renderEnLearningPlan(items: FutureLearningPlanItem[]): string {
  const rows = items
    .map((item) => `| ${item.priorityEn} | ${item.domainEn} | ${item.technologiesEn} | ${item.timelineEn} | ${item.purposeEn} |`)
    .join('\n');

  return `| Priority | Technology Domain | Technologies & Frameworks | Learning Timeline | Learning Purpose & Applications |
|---|---|---|---|---|
${rows}`;
}

function renderJpLanguageSkills(items: LanguageSkillItem[]): string {
  const rows = items
    .map((item) => `| ${item.jpName} | ${item.jpLevel} | ${item.jpExperience} | ${item.jpUsage} |`)
    .join('\n');

  return `| 言語 | レベル | 実務経験 | 主な実績・用途 |
|---|---|---|---|
${rows}`;
}

function renderEnLanguageSkills(items: LanguageSkillItem[]): string {
  const rows = items
    .map((item) => `| ${item.enName} | ${item.enLevel} | ${item.enExperience} | ${item.enUsage} |`)
    .join('\n');

  return `| Language | Level | Experience | Main Achievements & Usage |
|---|---|---|---|
${rows}`;
}

function renderJpWorkTable(experiences: Experience[], now: Date): string {
  const rows = experiences.map((exp) => {
    const start = parseYm(exp.startYm);
    const end = exp.isCurrent ? null : parseYm(String(exp.endYm));

    const durationMonths = exp.isCurrent ? monthsToNow(start, now) : monthsInclusive(start, end as YearMonth);
    const durationLabel = formatDurationJp(durationMonths);
    const periodLabel = exp.isCurrent
      ? `${start.year}.${String(start.month).padStart(2, '0')}〜現在`
      : `${start.year}.${String(start.month).padStart(2, '0')}〜${(end as YearMonth).year}.${String((end as YearMonth).month).padStart(2, '0')}`;

    const tech = exp.jp.technologies.map((item) => formatTechJp(item)).join(' / ');
    const achievements = exp.jp.achievements.map((item) => `・${item}`).join('<br/>\n        ');

    return `    <tr>
      <td style="border:1px solid #ddd; padding:8px;">${periodLabel}<br/>（${durationLabel}${exp.isCurrent ? '・継続中' : ''}）</td>
      <td style="border:1px solid #ddd; padding:8px;">${exp.jp.role}</td>
      <td style="border:1px solid #ddd; padding:8px;">${exp.jp.scope}</td>
      <td style="border:1px solid #ddd; padding:8px;">${tech}</td>
      <td style="border:1px solid #ddd; padding:8px;">${achievements}</td>
    </tr>`;
  }).join('\n');

  return `<table style="width:100%; border-collapse:collapse;">
  <thead>
    <tr>
      <th align="left" style="width:12%; border:1px solid #ddd; padding:8px;">期間</th>
      <th align="left" style="width:20%; border:1px solid #ddd; padding:8px;">職種</th>
      <th align="left" style="width:22%; border:1px solid #ddd; padding:8px;">業務範囲</th>
      <th align="left" style="width:20%; border:1px solid #ddd; padding:8px;">主要技術</th>
      <th align="left" style="width:26%; border:1px solid #ddd; padding:8px;">主な実績</th>
    </tr>
  </thead>
  <tbody>
${rows}
  </tbody>
</table>`;
}

function renderEnWorkSection(experiences: Experience[], now: Date): string {
  return experiences.map((exp) => {
    const start = parseYm(exp.startYm);
    const end = exp.isCurrent ? null : parseYm(String(exp.endYm));

    const durationMonths = exp.isCurrent ? monthsToNow(start, now) : monthsInclusive(start, end as YearMonth);
    const durationLabel = formatDurationEn(durationMonths);
    const periodLabel = exp.isCurrent
      ? `${monthName(start.month)} ${start.year} – Present`
      : `${monthName(start.month)} ${start.year} – ${monthName((end as YearMonth).month)} ${(end as YearMonth).year}`;

    const tech = exp.en.technologies.map((item) => formatTechEn(item)).join('<br/>');
    const achievements = exp.en.achievements.join('<br/>   ');

    return `### ${exp.en.role} (${periodLabel})

| **Duration** | ${durationLabel}${exp.isCurrent ? ', Ongoing' : ''} |
|------|------|
| **Scope** | ${exp.en.scope} |
| **Key Technologies** | ${tech} |
| **Main Achievements** | ${achievements} |

<br/>`;
  }).join('\n\n');
}

function buildTotals(experiences: Experience[], now: Date): { jp: string; en: string } {
  const sortedByStart = [...experiences].sort((a, b) => {
    const ay = parseYm(a.startYm);
    const by = parseYm(b.startYm);
    return compareYm(ay, by);
  });

  const first = parseYm(sortedByStart[0].startYm);
  const totalMonths = monthsToNow(first, now);

  const jp = `${formatDurationJp(totalMonths)}（${first.year}年${first.month}月〜現在）`;
  const en = `${formatDurationEn(totalMonths)} (${monthName(first.month)} ${first.year} – Present)`;
  return { jp, en };
}

function main(): void {
  ensureDir(includeDir);

  const raw = fs.readFileSync(dataPath, 'utf8');
  const experiences = JSON.parse(raw) as Experience[];
  validateExperiences(experiences);

  const learningRaw = fs.readFileSync(learningDataPath, 'utf8');
  const learningItems = JSON.parse(learningRaw) as LearningTechnology[];
  validateLearningTechnologies(learningItems);

  const futurePlanRaw = fs.readFileSync(futureLearningPlanPath, 'utf8');
  const futurePlanItems = JSON.parse(futurePlanRaw) as FutureLearningPlanItem[];
  validateFutureLearningPlan(futurePlanItems);

  const languageSkillsRaw = fs.readFileSync(languageSkillsPath, 'utf8');
  const languageSkills = JSON.parse(languageSkillsRaw) as LanguageSkillItem[];
  validateLanguageSkills(languageSkills);

  const now = new Date();
  const frontMatterDate = formatDateForFrontMatter(now);
  const totals = buildTotals(experiences, now);

  updateLastModifiedAt(careerJpPath, frontMatterDate);
  updateLastModifiedAt(careerEnPath, frontMatterDate);

  const jpTable = renderJpWorkTable(experiences, now);
  const enSection = renderEnWorkSection(experiences, now);
  const jpTechTotals = renderJpTechnologyTotals(experiences, learningItems);
  const enTechTotals = renderEnTechnologyTotals(experiences, learningItems);
  const jpLearningPlan = renderJpLearningPlan(futurePlanItems);
  const enLearningPlan = renderEnLearningPlan(futurePlanItems);
  const jpLanguageSkills = renderJpLanguageSkills(languageSkills);
  const enLanguageSkills = renderEnLanguageSkills(languageSkills);

  fs.writeFileSync(outputTotalJp, `${totals.jp}\n`, 'utf8');
  fs.writeFileSync(outputTotalEn, `${totals.en}\n`, 'utf8');
  fs.writeFileSync(outputWorkJp, `${jpTable}\n`, 'utf8');
  fs.writeFileSync(outputWorkEn, `${enSection}\n`, 'utf8');
  fs.writeFileSync(outputTechTotalsJp, `${jpTechTotals}\n`, 'utf8');
  fs.writeFileSync(outputTechTotalsEn, `${enTechTotals}\n`, 'utf8');
  fs.writeFileSync(outputLearningPlanJp, `${jpLearningPlan}\n`, 'utf8');
  fs.writeFileSync(outputLearningPlanEn, `${enLearningPlan}\n`, 'utf8');
  fs.writeFileSync(outputLanguageSkillsJp, `${jpLanguageSkills}\n`, 'utf8');
  fs.writeFileSync(outputLanguageSkillsEn, `${enLanguageSkills}\n`, 'utf8');

  console.log('Career sections generated successfully.');
  console.log(`- Total JP: ${totals.jp}`);
  console.log(`- Total EN: ${totals.en}`);
  console.log(`- Updated: ${path.relative(rootDir, outputWorkJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputWorkEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechTotalsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechTotalsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLearningPlanJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLearningPlanEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageSkillsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageSkillsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, careerJpPath)} (last_modified_at=${frontMatterDate})`);
  console.log(`- Updated: ${path.relative(rootDir, careerEnPath)} (last_modified_at=${frontMatterDate})`);
}

main();
