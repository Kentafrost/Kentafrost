export type Locale = 'jp' | 'en';

export type TableColumn = {
  key: string;
  label: string;
  required?: boolean;
};

export type TableSchema = {
  id: string;
  locale: Locale;
  title: string;
  columns: TableColumn[];
};

export const jpTechnologyTableSchemas: TableSchema[] = [
  {
    id: 'technology-ready-to-contribute-jp',
    locale: 'jp',
    title: '戦力になれる分野（実務経験 1年以上）',
    columns: [
      { key: 'technology', label: '技術', required: true },
      { key: 'totalExperience', label: '累計経験', required: true },
      { key: 'ratingGuide', label: '目安評価', required: true },
      { key: 'notes', label: '備考' },
    ],
  },
  {
    id: 'technology-under-one-year-jp',
    locale: 'jp',
    title: '業務経験あり（実務経験 1年未満）',
    columns: [
      { key: 'technology', label: '技術', required: true },
      { key: 'totalExperience', label: '累計経験', required: true },
      { key: 'ratingGuide', label: '目安評価', required: true },
      { key: 'notes', label: '備考' },
    ],
  },
  {
    id: 'technology-learning-jp',
    locale: 'jp',
    title: '学習中の技術',
    columns: [
      { key: 'technology', label: '技術', required: true },
      { key: 'learningPeriod', label: '学習期間', required: true },
      { key: 'ratingGuide', label: '目安評価', required: true },
      { key: 'notes', label: '備考' },
    ],
  },
];

export const enTechnologyTableSchemas: TableSchema[] = [
  {
    id: 'technology-ready-to-contribute-en',
    locale: 'en',
    title: 'Ready-To-Contribute Areas (1+ Year Work Experience)',
    columns: [
      { key: 'technology', label: 'Technology', required: true },
      { key: 'totalExperience', label: 'Total Experience', required: true },
      { key: 'ratingGuide', label: 'Rating Guide', required: true },
      { key: 'notes', label: 'Notes' },
    ],
  },
  {
    id: 'technology-under-one-year-en',
    locale: 'en',
    title: 'Work Experience Under 1 Year',
    columns: [
      { key: 'technology', label: 'Technology', required: true },
      { key: 'totalExperience', label: 'Total Experience', required: true },
      { key: 'ratingGuide', label: 'Rating Guide', required: true },
      { key: 'notes', label: 'Notes' },
    ],
  },
  {
    id: 'technology-learning-en',
    locale: 'en',
    title: 'Learning Technologies',
    columns: [
      { key: 'technology', label: 'Technology', required: true },
      { key: 'learningPeriod', label: 'Learning Period', required: true },
      { key: 'ratingGuide', label: 'Rating Guide', required: true },
      { key: 'notes', label: 'Notes' },
    ],
  },
];

export const jpLearningPlanTableSchema: TableSchema = {
  id: 'learning-plan-jp',
  locale: 'jp',
  title: '学習計画',
  columns: [
    { key: 'priority', label: '優先度', required: true },
    { key: 'domain', label: '技術分野', required: true },
    { key: 'technologies', label: '技術・フレームワーク', required: true },
    { key: 'timeline', label: '学習予定時期', required: true },
    { key: 'purpose', label: '学習目的・用途', required: true },
  ],
};

export const enLearningPlanTableSchema: TableSchema = {
  id: 'learning-plan-en',
  locale: 'en',
  title: 'Learning Plan',
  columns: [
    { key: 'priority', label: 'Priority', required: true },
    { key: 'domain', label: 'Technology Domain', required: true },
    { key: 'technologies', label: 'Technologies & Frameworks', required: true },
    { key: 'timeline', label: 'Learning Timeline', required: true },
    { key: 'purpose', label: 'Learning Purpose & Applications', required: true },
  ],
};

export const jpLanguageSkillsTableSchema: TableSchema = {
  id: 'language-skills-jp',
  locale: 'jp',
  title: '言語スキル',
  columns: [
    { key: 'language', label: '言語', required: true },
    { key: 'level', label: 'レベル', required: true },
    { key: 'experience', label: '実務経験', required: true },
    { key: 'usage', label: '主な実績・用途', required: true },
  ],
};

export const enLanguageSkillsTableSchema: TableSchema = {
  id: 'language-skills-en',
  locale: 'en',
  title: 'Language Skills',
  columns: [
    { key: 'language', label: 'Language', required: true },
    { key: 'level', label: 'Level', required: true },
    { key: 'experience', label: 'Experience', required: true },
    { key: 'usage', label: 'Main Achievements & Usage', required: true },
  ],
};

export const allTableSchemas: TableSchema[] = [
  ...jpTechnologyTableSchemas,
  ...enTechnologyTableSchemas,
  jpLearningPlanTableSchema,
  enLearningPlanTableSchema,
  jpLanguageSkillsTableSchema,
  enLanguageSkillsTableSchema,
];

export function findTableSchema(id: string): TableSchema | undefined {
  return allTableSchemas.find((schema) => schema.id === id);
}

export function validateRowBySchema(
  schema: TableSchema,
  row: Record<string, unknown>
): { ok: boolean; missingRequiredKeys: string[] } {
  const missingRequiredKeys = schema.columns
    .filter((column) => column.required)
    .map((column) => column.key)
    .filter((key) => {
      const value = row[key];
      if (value === undefined || value === null) {
        return true;
      }
      return typeof value === 'string' && value.trim().length === 0;
    });

  return {
    ok: missingRequiredKeys.length === 0,
    missingRequiredKeys,
  };
}
