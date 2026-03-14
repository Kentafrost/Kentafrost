// @ts-nocheck
/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const path = require('path');

console.warn('[DEPRECATED] scripts/start-career-data-editor.ts is deprecated. Use `npm run career:editor` (Java backend).');

const runnerPath = path.resolve(__dirname, 'run-career-java.js');
const result = spawnSync(process.execPath, [runnerPath, 'editor'], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to launch Java career editor: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
