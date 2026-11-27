import { readFileSync, writeFileSync } from 'node:fs';

const sw = readFileSync('sw.js', 'utf8');
const swMatch = sw.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
const manifest = {
  schemaVersion: '1.0.0',
  repository: 'indrajithbandara/indrajithbandara.github.io',
  branch: process.env.GITHUB_REF_NAME || 'main',
  commit: process.env.GITHUB_SHA || 'unknown',
  builtAtUtc: new Date().toISOString(),
  serviceWorkerVersion: swMatch ? swMatch[1] : 'unknown',
  primaryUrl: 'https://indrajithbandara.is-a.dev/'
};

writeFileSync('version.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Generated version.json:', JSON.stringify(manifest));
