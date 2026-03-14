// @ts-nocheck
/* eslint-disable no-console */
import { spawnSync } from 'child_process';
import * as path from 'path';

console.warn('[DEPRECATED] scripts/generate-blog-pages.ts is deprecated. Use `npm run blog:generate` (Java backend).');

const runnerPath = path.resolve(__dirname, 'run-blog-java.js');
const result = spawnSync(process.execPath, [runnerPath, 'generate', ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to launch Java blog generator: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
