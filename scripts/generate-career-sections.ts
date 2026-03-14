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
