import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standaloneRoot = path.join(root, '.next', 'standalone');
const standaloneNextDir = path.join(standaloneRoot, '.next');
const staticSrc = path.join(root, '.next', 'static');
const staticDest = path.join(standaloneNextDir, 'static');
const publicSrc = path.join(root, 'public');
const publicDest = path.join(standaloneRoot, 'public');

if (!existsSync(standaloneRoot)) {
  console.warn('[prepare-standalone] .next/standalone not found, skipping.');
  process.exit(0);
}

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true, force: true });
  console.log('[prepare-standalone] Copied .next/static into standalone bundle.');
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true, force: true });
  console.log('[prepare-standalone] Copied public directory into standalone bundle.');
}
