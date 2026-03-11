/* eslint-disable no-console */
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const rootDir = path.resolve(__dirname, '..');
const docRoot = path.join(rootDir, 'doc', 'career-data');
const port = Number(process.env.CAREER_EDITOR_PORT || '8090');

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function safeJoin(base: string, target: string): string {
  const normalized = path.normalize(path.join(base, target));
  if (!normalized.startsWith(base)) {
    throw new Error('Invalid path');
  }
  return normalized;
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const command = platform === 'win32'
    ? `start \"\" \"${url}\"`
    : platform === 'darwin'
      ? `open \"${url}\"`
      : `xdg-open \"${url}\"`;

  exec(command, (error) => {
    if (error) {
      console.warn('Failed to open browser automatically. Open this URL manually:', url);
    }
  });
}

const server = http.createServer((req, res) => {
  try {
    const reqPath = (req.url || '/').split('?')[0];
    const relative = reqPath === '/' ? '/editor.html' : reqPath;
    const filePath = safeJoin(docRoot, relative);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    res.setHeader('Content-Type', contentType(filePath));
    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.statusCode = 400;
    res.end('Bad Request');
  }
});

server.listen(port, () => {
  const url = `http://localhost:${port}/editor.html`;
  console.log(`Career data editor server started: ${url}`);
  console.log('Press Ctrl+C to stop.');
  openBrowser(url);
});
