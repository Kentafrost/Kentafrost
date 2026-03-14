export type TechCategory =
  | 'coding'
  | 'cloud'
  | 'server'
  | 'frontend'
  | 'data'
  | 'integration'
  | 'devops'
  | 'platform'
  | 'other';

export type ExperienceCategory = 'cloud' | 'coding' | 'infrastructure' | 'server';

export type LocalizedCategory = {
  labelJp: string;
  labelEn: string;
};

export const TECH_CATEGORY_LABELS: Record<TechCategory, LocalizedCategory> = {
  coding: { labelJp: 'コーディング', labelEn: 'Coding' },
  cloud: { labelJp: 'クラウド', labelEn: 'Cloud' },
  server: { labelJp: 'サーバー', labelEn: 'Server' },
  frontend: { labelJp: 'フロントエンド', labelEn: 'Frontend' },
  data: { labelJp: 'データ分析', labelEn: 'Data & Analytics' },
  integration: { labelJp: '外部連携/API', labelEn: 'API & Integration' },
  devops: { labelJp: 'DevOps/ビルド', labelEn: 'DevOps & Build' },
  platform: { labelJp: 'プラットフォーム', labelEn: 'Platform' },
  other: { labelJp: 'その他', labelEn: 'Other' },
};

export const EXPERIENCE_CATEGORY_LABELS: Record<ExperienceCategory, LocalizedCategory> = {
  cloud: { labelJp: 'クラウド系', labelEn: 'Cloud' },
  coding: { labelJp: 'コーディング系', labelEn: 'Coding' },
  infrastructure: { labelJp: 'インフラ系', labelEn: 'Infrastructure' },
  server: { labelJp: 'サーバー系', labelEn: 'Server' },
};

export const EXPERIENCE_CATEGORY_ORDER: ExperienceCategory[] = [
  'cloud',
  'coding',
  'infrastructure',
  'server',
];

type KeywordRule = {
  category: TechCategory;
  keywords: string[];
};

type CodingLanguageRule = {
  language: string;
  keywords: string[];
  matchMode: 'exact' | 'contains';
};

const CODING_LANGUAGE_BY_KEYWORD: CodingLanguageRule[] = [
  { language: 'Python', keywords: ['python'], matchMode: 'contains' },
  { language: 'JavaScript', keywords: ['javascript'], matchMode: 'contains' },
  { language: 'TypeScript', keywords: ['typescript'], matchMode: 'contains' },
  { language: 'Java', keywords: ['java'], matchMode: 'exact' },
  { language: 'Go', keywords: ['go', 'golang'], matchMode: 'exact' },
  { language: 'Ruby', keywords: ['ruby'], matchMode: 'exact' },
  { language: 'PHP', keywords: ['php'], matchMode: 'exact' },
  { language: 'C', keywords: ['c'], matchMode: 'exact' },
  { language: 'C++', keywords: ['c++'], matchMode: 'exact' },
  { language: 'C#', keywords: ['c#'], matchMode: 'exact' },
];

const TECHNOLOGY_CATEGORY_RULES: KeywordRule[] = [
  {
    category: 'cloud',
    keywords: ['aws', 'gcp', 'azure', 'cloud'],
  },
  {
    category: 'server',
    keywords: ['spring', 'fastapi', 'django', 'flask', 'backend', 'server'],
  },
  {
    category: 'frontend',
    keywords: ['react', 'vue', 'angular', 'frontend'],
  },
  {
    category: 'data',
    keywords: ['pandas', 'numpy', 'matplotlib', 'analysis', 'data'],
  },
  {
    category: 'integration',
    keywords: ['api', 'sdk'],
  },
  {
    category: 'devops',
    keywords: ['gradle', 'maven', 'docker', 'kubernetes', 'ci', 'cd'],
  },
  {
    category: 'platform',
    keywords: ['windows', 'linux', 'macos'],
  },
];

const EXPERIENCE_NON_TECH_KEYWORDS = [
  'translation',
  'communication',
  'documentation',
  'customer support',
  'バイリンガル',
  '翻訳',
  'コミュニケーション',
  'ドキュメント',
];

const EXPERIENCE_CATEGORY_RULES: Array<{ category: ExperienceCategory; keywords: string[] }> = [
  {
    category: 'cloud',
    keywords: [
      'aws',
      'gcp',
      'azure',
      'ec2',
      'vpc',
      'iam',
      'cloudformation',
      'lambda',
      's3',
      'dynamodb',
      'sns',
      'eventbridge',
      'systems manager',
      'cloudwatch',
      'quicksight',
    ],
  },
  {
    category: 'server',
    keywords: ['spring', 'fastapi', 'django', 'flask', 'wicket', 'rest api', 'backend', 'server'],
  },
  {
    category: 'infrastructure',
    keywords: [
      'linux',
      'windows',
      'network',
      'docker',
      'kubernetes',
      'bash',
      'powershell',
      'monitoring',
      'incident',
      'ticket',
      'escalation',
      'devops',
      'ci/cd',
      'git',
      'github',
      'oss',
      'yaml',
    ],
  },
  {
    category: 'coding',
    keywords: ['vba', 'xml', 'copilot', 'gemini ai', 'typescript', 'javascript', 'python', 'java'],
  },
];

function normalizeTechName(raw: string): string {
  return raw.trim().toLowerCase();
}

export function resolveCodingLanguage(tech: string): string | null {
  const key = normalizeTechName(tech);

  for (const rule of CODING_LANGUAGE_BY_KEYWORD) {
    if (
      (rule.matchMode === 'exact' && rule.keywords.includes(key)) ||
      (rule.matchMode === 'contains' && rule.keywords.some((keyword) => key.includes(keyword)))
    ) {
      return rule.language;
    }
  }

  return null;
}

export function resolveTechnologyCategory(tech: string): TechCategory {
  if (resolveCodingLanguage(tech)) {
    return 'coding';
  }

  const key = normalizeTechName(tech);
  for (const rule of TECHNOLOGY_CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => key.includes(keyword))) {
      return rule.category;
    }
  }

  return 'other';
}

export function resolveExperienceCategory(tech: string): ExperienceCategory | null {
  const key = normalizeTechName(tech);

  if (EXPERIENCE_NON_TECH_KEYWORDS.some((keyword) => key.includes(keyword))) {
    return null;
  }

  if (resolveCodingLanguage(tech)) {
    return 'coding';
  }

  for (const rule of EXPERIENCE_CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => key.includes(keyword))) {
      return rule.category;
    }
  }

  return 'coding';
}
