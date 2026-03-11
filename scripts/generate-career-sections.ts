/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
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
import {
  validateCareerSummary,
  validateCertifications,
  validateExperiences,
  validateFutureLearningPlan,
  validateFutureWorkRoadmap,
  validateLanguageSkills,
  validateLearningTechnologies,
  validatePersonalProjects,
} from './career/validators';
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
import {
  careerEnPath,
  careerJpPath,
  careerSummaryPath,
  certificationsPath,
  dataPath,
  futureLearningPlanPath,
  futureWorkRoadmapPath,
  includeDir,
  languageSkillsPath,
  learningDataPath,
  outputCareerSummaryEn,
  outputCareerSummaryJp,
  outputCertificationsEn,
  outputCertificationsJp,
  outputFutureWorkRoadmapEn,
  outputFutureWorkRoadmapJp,
  outputLanguageBarsEn,
  outputLanguageBarsJp,
  outputLanguageSkillsEn,
  outputLanguageSkillsJp,
  outputLearningPlanEn,
  outputLearningPlanJp,
  outputPersonalProjectsEn,
  outputPersonalProjectsJp,
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
  personalProjectsPath,
  rootDir,
} from './career/paths';

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
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

  const futureWorkRoadmapRaw = fs.readFileSync(futureWorkRoadmapPath, 'utf8');
  const futureWorkRoadmapItems = JSON.parse(futureWorkRoadmapRaw) as FutureWorkRoadmapItem[];
  validateFutureWorkRoadmap(futureWorkRoadmapItems);

  const languageSkillsRaw = fs.readFileSync(languageSkillsPath, 'utf8');
  const languageSkills = JSON.parse(languageSkillsRaw) as LanguageSkillItem[];
  validateLanguageSkills(languageSkills);

  const certificationsRaw = fs.readFileSync(certificationsPath, 'utf8');
  const certifications = JSON.parse(certificationsRaw) as CertificationGroup[];
  validateCertifications(certifications);

  const personalProjectsRaw = fs.readFileSync(personalProjectsPath, 'utf8');
  const personalProjects = JSON.parse(personalProjectsRaw) as PersonalProjectItem[];
  validatePersonalProjects(personalProjects);

  const careerSummaryRaw = fs.readFileSync(careerSummaryPath, 'utf8');
  const careerSummary = JSON.parse(careerSummaryRaw) as CareerSummaryItem[];
  validateCareerSummary(careerSummary);

  const now = new Date();
  const frontMatterDate = formatDateForFrontMatter(now);
  const totals = buildTotals(experiences, now);

  updateLastModifiedAt(careerJpPath, frontMatterDate);
  updateLastModifiedAt(careerEnPath, frontMatterDate);
  updateFooterLastUpdated(careerJpPath, 'jp', now);
  updateFooterLastUpdated(careerEnPath, 'en', now);

  const jpTable = renderJpWorkTable(experiences, now);
  const enSection = renderEnWorkSection(experiences, now);
  const jpTechTotals = renderJpTechnologyTotals(experiences, learningItems);
  const enTechTotals = renderEnTechnologyTotals(experiences, learningItems);
  const jpTechBars = renderTechnologyBars(experiences, 'jp');
  const enTechBars = renderTechnologyBars(experiences, 'en');
  const jpTechSummary = renderTechnologySummary(experiences, learningItems, 'jp');
  const enTechSummary = renderTechnologySummary(experiences, learningItems, 'en');
  const jpLearningPlan = renderJpLearningPlan(futurePlanItems);
  const enLearningPlan = renderEnLearningPlan(futurePlanItems);
  const jpFutureWorkRoadmap = renderJpFutureWorkRoadmap(futureWorkRoadmapItems);
  const enFutureWorkRoadmap = renderEnFutureWorkRoadmap(futureWorkRoadmapItems);
  const jpLanguageSkills = renderJpLanguageSkills(languageSkills);
  const enLanguageSkills = renderEnLanguageSkills(languageSkills);
  const jpLanguageBars = renderLanguageBars(languageSkills, 'jp');
  const enLanguageBars = renderLanguageBars(languageSkills, 'en');
  const jpCertifications = renderJpCertifications(certifications);
  const enCertifications = renderEnCertifications(certifications);
  const jpPersonalProjects = renderJpPersonalProjects(personalProjects);
  const enPersonalProjects = renderEnPersonalProjects(personalProjects);
  const jpCareerSummary = renderJpCareerSummary(careerSummary);
  const enCareerSummary = renderEnCareerSummary(careerSummary);

  fs.writeFileSync(outputTotalJp, `${totals.jp}\n`, 'utf8');
  fs.writeFileSync(outputTotalEn, `${totals.en}\n`, 'utf8');
  fs.writeFileSync(outputWorkJp, `${jpTable}\n`, 'utf8');
  fs.writeFileSync(outputWorkEn, `${enSection}\n`, 'utf8');
  fs.writeFileSync(outputTechTotalsJp, `${jpTechTotals}\n`, 'utf8');
  fs.writeFileSync(outputTechTotalsEn, `${enTechTotals}\n`, 'utf8');
  fs.writeFileSync(outputTechBarsJp, `${jpTechBars}\n`, 'utf8');
  fs.writeFileSync(outputTechBarsEn, `${enTechBars}\n`, 'utf8');
  fs.writeFileSync(outputTechSummaryJp, `${jpTechSummary}\n`, 'utf8');
  fs.writeFileSync(outputTechSummaryEn, `${enTechSummary}\n`, 'utf8');
  fs.writeFileSync(outputLearningPlanJp, `${jpLearningPlan}\n`, 'utf8');
  fs.writeFileSync(outputLearningPlanEn, `${enLearningPlan}\n`, 'utf8');
  fs.writeFileSync(outputFutureWorkRoadmapJp, `${jpFutureWorkRoadmap}\n`, 'utf8');
  fs.writeFileSync(outputFutureWorkRoadmapEn, `${enFutureWorkRoadmap}\n`, 'utf8');
  fs.writeFileSync(outputLanguageSkillsJp, `${jpLanguageSkills}\n`, 'utf8');
  fs.writeFileSync(outputLanguageSkillsEn, `${enLanguageSkills}\n`, 'utf8');
  fs.writeFileSync(outputLanguageBarsJp, `${jpLanguageBars}\n`, 'utf8');
  fs.writeFileSync(outputLanguageBarsEn, `${enLanguageBars}\n`, 'utf8');
  fs.writeFileSync(outputCertificationsJp, `${jpCertifications}\n`, 'utf8');
  fs.writeFileSync(outputCertificationsEn, `${enCertifications}\n`, 'utf8');
  fs.writeFileSync(outputPersonalProjectsJp, `${jpPersonalProjects}\n`, 'utf8');
  fs.writeFileSync(outputPersonalProjectsEn, `${enPersonalProjects}\n`, 'utf8');
  fs.writeFileSync(outputCareerSummaryJp, `${jpCareerSummary}\n`, 'utf8');
  fs.writeFileSync(outputCareerSummaryEn, `${enCareerSummary}\n`, 'utf8');

  console.log('Career sections generated successfully.');
  console.log(`- Source: ${path.relative(rootDir, dataPath)}`);
  console.log(`- Source: ${path.relative(rootDir, learningDataPath)}`);
  console.log(`- Source: ${path.relative(rootDir, futureLearningPlanPath)}`);
  console.log(`- Source: ${path.relative(rootDir, futureWorkRoadmapPath)}`);
  console.log(`- Source: ${path.relative(rootDir, languageSkillsPath)}`);
  console.log(`- Source: ${path.relative(rootDir, certificationsPath)}`);
  console.log(`- Source: ${path.relative(rootDir, personalProjectsPath)}`);
  console.log(`- Source: ${path.relative(rootDir, careerSummaryPath)}`);
  console.log(`- Total JP: ${totals.jp}`);
  console.log(`- Total EN: ${totals.en}`);
  console.log(`- Updated: ${path.relative(rootDir, outputWorkJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputWorkEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechTotalsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechTotalsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechBarsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechBarsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechSummaryJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputTechSummaryEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLearningPlanJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLearningPlanEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputFutureWorkRoadmapJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputFutureWorkRoadmapEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageSkillsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageSkillsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageBarsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputLanguageBarsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputCertificationsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputCertificationsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputPersonalProjectsJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputPersonalProjectsEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputCareerSummaryJp)}`);
  console.log(`- Updated: ${path.relative(rootDir, outputCareerSummaryEn)}`);
  console.log(`- Updated: ${path.relative(rootDir, careerJpPath)} (last_modified_at=${frontMatterDate})`);
  console.log(`- Updated: ${path.relative(rootDir, careerEnPath)} (last_modified_at=${frontMatterDate})`);
}

main();
