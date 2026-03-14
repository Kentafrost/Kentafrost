/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const path = require('path');

const mode = process.argv[2];
if (!mode || !['update', 'editor'].includes(mode)) {
  console.error('Usage: node scripts/run-career-java.js <update|editor>');
  process.exit(1);
}

const kentafrostRoot = path.resolve(__dirname, '..');
const javaPracticeRoot = path.resolve(kentafrostRoot, '..', 'java-practice');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';
const gradleTask = mode === 'update' ? 'runCareerGenerator' : 'runCareerEditor';

console.log(`[career] Running Java task: ${gradleTask}`);

const result = spawnSync(
  gradleCommand,
  [gradleTask, '--args', kentafrostRoot],
  {
    cwd: javaPracticeRoot,
    stdio: 'inherit',
    shell: isWindows,
  }
);

if (result.error) {
  console.error(`Failed to run Java task: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
