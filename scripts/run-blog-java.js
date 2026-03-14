/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const path = require('path');

const mode = process.argv[2] || 'generate';
if (!['generate', 'verbose', 'check'].includes(mode)) {
  console.error('Usage: node scripts/run-blog-java.js <generate|verbose|check>');
  process.exit(1);
}

const kentafrostRoot = path.resolve(__dirname, '..');
const javaPracticeRoot = path.resolve(kentafrostRoot, '..', 'java-practice');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';

const env = {
  ...process.env,
  BLOG_VERBOSE: mode === 'verbose' ? '1' : '',
  BLOG_DRY_RUN: mode === 'check' ? '1' : '',
};

console.log('[blog] Running Java task: runBlogGenerator');

const result = spawnSync(
  gradleCommand,
  ['runBlogGenerator', `--args=${kentafrostRoot}`],
  {
    cwd: javaPracticeRoot,
    stdio: 'inherit',
    shell: isWindows,
    env,
  }
);

if (result.error) {
  console.error(`Failed to run Java blog generator: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
