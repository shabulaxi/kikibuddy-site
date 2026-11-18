import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const previewPath = new URL('../scripts/preview.mjs', import.meta.url);
const temp = await mkdtemp(join(tmpdir(), 'kikibuddy-http-'));
after(() => rm(temp, { recursive: true, force: true }));

test('preview serves the page and byte ranges without exposing files above the website root', async () => {
  let createHandler;
  try { ({ createHandler } = await import(previewPath)); }
  catch (error) { assert.fail(`The preview handler must be available: ${error.code}`); }
  const root = join(temp, 'public');
  await mkdir(join(root, 'video'), { recursive: true });
  await writeFile(join(root, 'index.html'), '<title>KikiBuddy</title>');
  await writeFile(join(root, 'video/clip.mp4'), Buffer.from('0123456789'));
  await writeFile(join(temp, 'private.txt'), 'not a website asset');
  const server = createServer(createHandler(root));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal(await (await fetch(base)).text(), '<title>KikiBuddy</title>');
    const range = await fetch(`${base}/video/clip.mp4`, { headers: { Range: 'bytes=2-5' } });
    assert.equal(range.status, 206);
    assert.equal(range.headers.get('content-type'), 'video/mp4');
    assert.equal(range.headers.get('content-range'), 'bytes 2-5/10');
    assert.equal(await range.text(), '2345');
    const head = await fetch(`${base}/video/clip.mp4`, { method: 'HEAD' });
    assert.equal(head.headers.get('content-length'), '10');
    assert.equal(await head.text(), '');
    assert.equal((await fetch(`${base}/video/clip.mp4`, { headers: { Range: 'bytes=30-' } })).status, 416);
    assert.equal((await fetch(`${base}/%2e%2e%2fprivate.txt`)).status, 404);
    assert.equal((await fetch(`${base}/.env`)).status, 404);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('build produces a standalone static site from tracked sources, excluding local tooling', async () => {
  const result = spawnSync(process.execPath, [resolve(project, 'scripts/build.mjs')], { cwd: project, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const html = await readFile(resolve(project, 'dist/index.html'), 'utf8');
  assert.match(html, /<title>KikiBuddy 奇奇伙伴 \| 高端宠物护理<\/title>/);
  for (const path of ['styles.css', 'main.js', 'robots.txt', '_headers', 'video/loops/hero-loop.webm']) {
    assert.ok((await readFile(resolve(project, 'dist', path))).length > 0, path);
  }
  for (const path of ['package.json', 'README.md', '.env', 'video/brand-full.mp4']) {
    await assert.rejects(readFile(resolve(project, 'dist', path)), { code: 'ENOENT' });
  }
});
