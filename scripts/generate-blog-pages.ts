/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

type Metadata = Record<string, string>;

type ParsedSource = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  body: string;
};

type WriteStatus = 'created' | 'updated' | 'unchanged';

type WriteResult = {
  outputPath: string;
  status: WriteStatus;
};

type PostIndex = {
  title: string;
  date: string;
  dateLabel: string;
  slug: string;
  url: string;
};

type GenerationStats = {
  timestamp: string;
  created: Array<{ file: string; title: string }>;
  updated: Array<{ file: string; title: string }>;
  unchanged: Array<{ file: string; title: string }>;
  deleted: string[];
  summary: {
    created: number;
    updated: number;
    unchanged: number;
    deleted: number;
  };
};

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'doc', 'blog');
const outputDir = path.join(rootDir, 'blog', 'articles');
const outputIndexPath = path.join(rootDir, 'blog', 'blog-index.json');
const statsFilePath = path.join(rootDir, 'blog', 'generation-stats.json');

// Parse command-line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const dryRun = args.includes('--dry-run');

function toSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[\\/]/g, '-')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '');

  return slug || 'post';
}

function toTitleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function escapeYaml(value: string): string {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function parseFrontMatter(raw: string): { metadata: Metadata; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { metadata: {}, body: raw };
  }

  const metadataLines = match[1].split('\n');
  const metadata: Metadata = {};

  metadataLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const kv = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) {
      return;
    }

    const key = kv[1].toLowerCase();
    const value = kv[2].replace(/^['\"]|['\"]$/g, '').trim();
    metadata[key] = value;
  });

  return {
    metadata,
    body: raw.slice(match[0].length),
  };
}

function parseMarkdownFile(filePath: string, fileName: string): ParsedSource {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const parsed = parseFrontMatter(raw);

  const body = parsed.body.trim();
  const firstHeading = body.match(/^#\s+(.+)$/m);
  const title = parsed.metadata.title || (firstHeading ? firstHeading[1].trim() : '');
  const date = parsed.metadata.date || '';
  const summary = parsed.metadata.summary || parsed.metadata.subtitle || '';

  const fileBase = fileName.replace(/\.md$/i, '');
  const slug = toSlug(fileBase);

  const finalTitle = title || toTitleFromSlug(slug);

  let finalDate = date;
  if (!finalDate) {
    const stat = fs.statSync(filePath);
    const d = new Date(stat.mtimeMs);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    finalDate = `${yyyy}-${mm}-${dd}`;
  }

  return {
    slug,
    title: finalTitle,
    summary,
    date: finalDate,
    body,
  };
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeMarkdown(post: ParsedSource): WriteResult {
  const frontMatterLines = [
    '---',
    'layout: default',
    `title: "${escapeYaml(post.title)}"`,
    `date: ${post.date} 00:00:00 +0900`,
    `permalink: /blog/articles/${post.slug}/`,
  ];

  if (post.summary) {
    frontMatterLines.push(`subtitle: "${escapeYaml(post.summary)}"`);
  }

  frontMatterLines.push('---', '');

  const backLink = '<nav class="blog-back-link"><a href="{{ \'/blog/\' | relative_url }}">← ブログ一覧に戻る</a></nav>';
  const content = `${frontMatterLines.join('\n')}${backLink}\n\n${post.body}\n`;

  const outputPath = path.join(outputDir, `${post.slug}.md`);
  let status: WriteStatus = 'created';

  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    if (existing === content) {
      status = 'unchanged';
    } else {
      status = 'updated';
      fs.writeFileSync(outputPath, content, 'utf8');
    }
  } else {
    fs.writeFileSync(outputPath, content, 'utf8');
  }

  return { outputPath, status };
}

function listGeneratedFiles(): string[] {
  ensureDir(outputDir);
  return fs
    .readdirSync(outputDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(outputDir, name));
}

function removeStaleGeneratedFiles(keepPaths: string[]): void {
  const keepSet = new Set(keepPaths);
  const existing = listGeneratedFiles();

  existing.forEach((filePath) => {
    if (!keepSet.has(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

function main(): void {
  ensureDir(sourceDir);
  ensureDir(outputDir);

  const sourceFiles = fs
    .readdirSync(sourceDir)
    .filter((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith('.md') && !name.startsWith('_') && lower !== 'readme.md';
    })
    .sort();

  const writtenPaths: string[] = [];
  const stats: GenerationStats = {
    timestamp: new Date().toISOString(),
    created: [],
    updated: [],
    unchanged: [],
    deleted: [],
    summary: { created: 0, updated: 0, unchanged: 0, deleted: 0 },
  };

  const posts: PostIndex[] = sourceFiles.map((fileName) => {
    const filePath = path.join(sourceDir, fileName);
    const parsed = parseMarkdownFile(filePath, fileName);
    const writeResult = writeMarkdown(parsed);
    writtenPaths.push(writeResult.outputPath);

    const statusEntry = {
      file: fileName,
      title: parsed.title,
    };

    if (writeResult.status === 'created') {
      stats.created.push(statusEntry);
      stats.summary.created += 1;
      if (verbose) {
        console.log(`✅ Created: ${fileName} - "${parsed.title}"`);
      }
    } else if (writeResult.status === 'updated') {
      stats.updated.push(statusEntry);
      stats.summary.updated += 1;
      if (verbose) {
        console.log(`⬆️  Updated: ${fileName} - "${parsed.title}"`);
      }
    } else {
      stats.unchanged.push(statusEntry);
      stats.summary.unchanged += 1;
      if (verbose) {
        console.log(`  Unchanged: ${fileName} - "${parsed.title}"`);
      }
    }

    return {
      title: parsed.title,
      date: parsed.date,
      dateLabel: parsed.date,
      slug: parsed.slug,
      url: `/blog/articles/${parsed.slug}/`,
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  // Track deleted files
  const existingFiles = listGeneratedFiles();
  existingFiles.forEach((filePath) => {
    if (!writtenPaths.includes(filePath)) {
      const fileName = path.basename(filePath);
      stats.deleted.push(fileName);
      stats.summary.deleted += 1;
      if (verbose) {
        console.log(`🗑️  Deleted: ${fileName}`);
      }
      if (!dryRun) {
        fs.unlinkSync(filePath);
      }
    }
  });

  if (!dryRun) {
    removeStaleGeneratedFiles(writtenPaths);
    fs.writeFileSync(outputIndexPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
    fs.writeFileSync(statsFilePath, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
  }

  // Summary output
  console.log('');
  console.log('📊 Blog Generation Summary:');
  console.log(`  ✅ Created:   ${stats.summary.created}`);
  console.log(`  ⬆️  Updated:   ${stats.summary.updated}`);
  console.log(`     Unchanged: ${stats.summary.unchanged}`);
  if (stats.summary.deleted > 0) {
    console.log(`  🗑️  Deleted:   ${stats.summary.deleted}`);
  }
  console.log(`  📄 Total:     ${posts.length} posts in blog/articles/`);

  if (dryRun) {
    console.log('');
    console.log('⚠️  DRY RUN: No files were modified.');
  }
}

main();
