import type {
  CareerSummaryItem,
  CertificationGroup,
  Experience,
  FutureLearningPlanItem,
  FutureWorkRoadmapItem,
  LanguageSkillItem,
  LearningTechnology,
  PersonalProjectItem,
  TechnologyDuration,
  YearMonth,
} from './types';

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

export function validateLearningTechnologies(items: LearningTechnology[]): void {
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

export function validateFutureLearningPlan(items: FutureLearningPlanItem[]): void {
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

export function validateLanguageSkills(items: LanguageSkillItem[]): void {
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

export function validateFutureWorkRoadmap(items: FutureWorkRoadmapItem[]): void {
  if (items.length === 0) {
    throw new Error('future-work-roadmap.json is empty. Add at least one roadmap item.');
  }

  items.forEach((item, index) => {
    const requiredStrings = [
      item.periodJp,
      item.periodEn,
      item.objectiveJp,
      item.objectiveEn,
      item.metricsJp,
      item.metricsEn,
    ];

    if (requiredStrings.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`Invalid future work roadmap item at index ${index}`);
    }

    if (!Array.isArray(item.initiativesJp) || item.initiativesJp.length === 0) {
      throw new Error(`initiativesJp must be a non-empty array at future work roadmap index ${index}`);
    }
    if (!Array.isArray(item.initiativesEn) || item.initiativesEn.length === 0) {
      throw new Error(`initiativesEn must be a non-empty array at future work roadmap index ${index}`);
    }

    if (item.initiativesJp.some((entry) => !entry || typeof entry !== 'string')) {
      throw new Error(`initiativesJp has invalid value at future work roadmap index ${index}`);
    }
    if (item.initiativesEn.some((entry) => !entry || typeof entry !== 'string')) {
      throw new Error(`initiativesEn has invalid value at future work roadmap index ${index}`);
    }
  });
}

export function validateCertifications(groups: CertificationGroup[]): void {
  if (groups.length === 0) {
    throw new Error('certifications.json is empty. Add at least one certification group.');
  }

  groups.forEach((group, groupIndex) => {
    if (!group.categoryJp || typeof group.categoryJp !== 'string') {
      throw new Error(`Invalid categoryJp at certifications[${groupIndex}]`);
    }
    if (!group.categoryEn || typeof group.categoryEn !== 'string') {
      throw new Error(`Invalid categoryEn at certifications[${groupIndex}]`);
    }
    if (!Array.isArray(group.items) || group.items.length === 0) {
      throw new Error(`certifications[${groupIndex}].items must be a non-empty array`);
    }

    group.items.forEach((item, itemIndex) => {
      const required = [item.name, item.obtainedJp, item.obtainedEn, item.usageJp, item.usageEn];
      if (required.some((value) => !value || typeof value !== 'string')) {
        throw new Error(`Invalid certification item at certifications[${groupIndex}].items[${itemIndex}]`);
      }
    });
  });
}

export function validatePersonalProjects(items: PersonalProjectItem[]): void {
  if (items.length === 0) {
    throw new Error('personal-projects.json is empty. Add at least one personal project item.');
  }

  items.forEach((item, index) => {
    const required = [
      item.nameJp,
      item.nameEn,
      item.periodJp,
      item.periodEn,
      item.progressJp,
      item.progressEn,
    ];

    if (required.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`Invalid personal project item at index ${index}`);
    }

    if (!Array.isArray(item.technologiesJp) || item.technologiesJp.length === 0) {
      throw new Error(`technologiesJp must be a non-empty array at personal project index ${index}`);
    }
    if (!Array.isArray(item.technologiesEn) || item.technologiesEn.length === 0) {
      throw new Error(`technologiesEn must be a non-empty array at personal project index ${index}`);
    }
    if (!Array.isArray(item.achievementsJp) || item.achievementsJp.length === 0) {
      throw new Error(`achievementsJp must be a non-empty array at personal project index ${index}`);
    }
    if (!Array.isArray(item.achievementsEn) || item.achievementsEn.length === 0) {
      throw new Error(`achievementsEn must be a non-empty array at personal project index ${index}`);
    }

    if (item.technologiesJp.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`technologiesJp has invalid value at personal project index ${index}`);
    }
    if (item.technologiesEn.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`technologiesEn has invalid value at personal project index ${index}`);
    }
    if (item.achievementsJp.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`achievementsJp has invalid value at personal project index ${index}`);
    }
    if (item.achievementsEn.some((value) => !value || typeof value !== 'string')) {
      throw new Error(`achievementsEn has invalid value at personal project index ${index}`);
    }

    if (item.linkUrl && typeof item.linkUrl !== 'string') {
      throw new Error(`linkUrl must be string at personal project index ${index}`);
    }
    if (item.linkLabelJp && typeof item.linkLabelJp !== 'string') {
      throw new Error(`linkLabelJp must be string at personal project index ${index}`);
    }
    if (item.linkLabelEn && typeof item.linkLabelEn !== 'string') {
      throw new Error(`linkLabelEn must be string at personal project index ${index}`);
    }
  });
}

export function validateCareerSummary(items: CareerSummaryItem[]): void {
  if (items.length === 0) {
    throw new Error('career-summary.json is empty. Add at least one career summary item.');
  }

  items.forEach((item, index) => {
    if (!item.keyJp || typeof item.keyJp !== 'string') {
      throw new Error(`Invalid keyJp at career-summary[${index}]`);
    }
    if (!item.keyEn || typeof item.keyEn !== 'string') {
      throw new Error(`Invalid keyEn at career-summary[${index}]`);
    }
    if (typeof item.valueJp !== 'string') {
      throw new Error(`Invalid valueJp at career-summary[${index}]`);
    }
    if (typeof item.valueEn !== 'string') {
      throw new Error(`Invalid valueEn at career-summary[${index}]`);
    }

    if (item.listJp && (!Array.isArray(item.listJp) || item.listJp.some((v) => !v || typeof v !== 'string'))) {
      throw new Error(`Invalid listJp at career-summary[${index}]`);
    }
    if (item.listEn && (!Array.isArray(item.listEn) || item.listEn.some((v) => !v || typeof v !== 'string'))) {
      throw new Error(`Invalid listEn at career-summary[${index}]`);
    }

    const hasJpValue = item.valueJp.trim().length > 0;
    const hasEnValue = item.valueEn.trim().length > 0;
    const hasJpList = Boolean(item.listJp && item.listJp.length > 0);
    const hasEnList = Boolean(item.listEn && item.listEn.length > 0);

    if (!hasJpValue && !hasJpList) {
      throw new Error(`career-summary[${index}] must have valueJp or listJp`);
    }
    if (!hasEnValue && !hasEnList) {
      throw new Error(`career-summary[${index}] must have valueEn or listEn`);
    }
  });
}

export function validateExperiences(experiences: Experience[]): void {
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
