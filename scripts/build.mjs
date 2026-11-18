import { cp, mkdir, readFile, writeFile, rm, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage } from './pages.mjs';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const staging = resolve(project, '.build-staging');
const output = resolve(project, 'dist');
if (dirname(staging) !== project || dirname(output) !== project) throw new Error('Build output must stay inside this project.');

const index = await readFile(resolve(project, 'src/index.html'), 'utf8');
if (!index.includes('id="hero-video"')) throw new Error('Expected the KikiBuddy website.');
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await cp(resolve(project, 'public'), staging, { recursive: true });
await cp(resolve(project, 'src'), staging, { recursive: true });
for (const page of pages) {
  const folder = resolve(staging, '.' + page.path);
  await mkdir(folder, { recursive: true });
  await writeFile(resolve(folder, 'index.html'), renderPage(page));
}
await rm(output, { recursive: true, force: true });
await rename(staging, output);
console.log('KikiBuddy build ready: dist/');
