import { cp, mkdir, readFile, writeFile, rm, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const staging = resolve(project, '.build-staging');
const output = resolve(project, 'dist');
if (dirname(staging) !== project || dirname(output) !== project) throw new Error('Build output must stay inside this project.');

const index = await readFile(resolve(project, 'src/index.html'), 'utf8');
if (!index.includes('id="hero-video"')) throw new Error('Expected the KikiBuddy website.');
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await cp(resolve(project, 'public'), staging, { recursive: true });
for (const name of ['index.html', 'styles.css', 'main.js']) {
  await writeFile(resolve(staging, name), await readFile(resolve(project, 'src', name)));
}
await rm(output, { recursive: true, force: true });
await rename(staging, output);
console.log('KikiBuddy build ready: dist/');
