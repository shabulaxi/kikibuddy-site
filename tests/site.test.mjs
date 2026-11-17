import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createHandler } from '../scripts/preview.mjs';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
let server, browser, base, url;
before(async () => {
  server = createServer(createHandler(root));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/`;
  url = base;
  const options = { headless: true };
  if (process.env.KIKI_BROWSER_CHANNEL) options.channel = process.env.KIKI_BROWSER_CHANNEL;
  browser = await chromium.launch(options);
});
after(async () => { await browser?.close(); server?.closeAllConnections(); await new Promise(resolve => server?.close(resolve)); });

test('deployment opens the current KikiBuddy page with the requested brand title', async () => {
  const page = await browser.newPage({ locale: 'zh-CN', viewport: { width: 1440, height: 900 } });
  try {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    assert.equal(await page.title(), 'KikiBuddy · 宠物护理');
    assert.equal(await page.locator('video').count(), 25);
    assert.equal(await page.locator('#product-track .product-card').count(), 13);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('deployment stays small, excludes the full film, and ships every referenced image and video', async () => {
  const index = await readFile(resolve(root, 'index.html'));
  assert.ok(index.length < 150_000, `HTML should use separate cacheable posters, got ${index.length} bytes`);
  await assert.rejects(stat(resolve(root, 'video/brand-full.mp4')), { code: 'ENOENT' });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await page.goto(base);
    await page.locator('#product-track .product-card').last().waitFor();
    const media = await page.locator('video').evaluateAll(vs => vs.flatMap(v => [new URL(v.dataset.poster, document.baseURI).href, new URL(v.dataset.src, document.baseURI).href]));
    const webm = await page.evaluate(() => Object.values(kikiWebmSources).map(path => new URL(path, document.baseURI).href));
    assert.ok(webm.some(path => path.endsWith('hero-loop.webm')), 'WebM hero must be available');
    for (const url of new Set([...media, ...webm])) {
      assert.ok(url.startsWith(base), 'deployment must not depend on another localhost service or source folder');
      const response = await page.request.head(url);
      assert.equal(response.status(), 200, `Missing deployed resource: ${url}`);
    }
  } finally { await page.close(); }
});

test('mobile deployment waits for tap and plays the short WebM hero', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(base);
    assert.equal(await page.locator('#hero-video').count(), 1);
    assert.equal(await page.locator('#hero-video').evaluate(v => v.currentSrc), '');
    await page.locator('#preloader').waitFor({ state: 'hidden' });
    await page.locator('.hero [data-video-button]').tap();
    await page.waitForFunction(() => { const v = document.querySelector('#hero-video'); return v && !v.paused && v.currentTime > 0; });
    assert.match(await page.locator('#hero-video').evaluate(v => v.currentSrc), /hero-loop\.webm$/);
    assert.equal(await page.locator('html').evaluate(e => e.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: 'test-results/kikibuddy-deploy-mobile.png' });
  } finally { await context.close(); }
});

test('mobile first screen becomes usable even when distant poster downloads are stalled', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const hero = html.match(/<video\b[^>]*id="hero-video"[^>]*>/)[0].match(/\b(?:data-)?poster="([^"]+)"/)[1];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.route('**/assets/**', route => {
      if (route.request().url().endsWith(hero)) return route.continue();
      // Deliberately leave unrelated images pending: they must not gate the page.
    });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.locator('#preloader').waitFor({ state: 'hidden', timeout: 3000 });
    assert.equal(await page.locator('.hero [data-video-button]').isEnabled(), true);
  } finally { await context.close(); }
});

test('mobile first screen avoids downloading the entire photo collection', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const images = new Set();
  page.on('request', request => { if (request.url().includes('/assets/')) images.add(request.url()); });
  try {
    await page.goto(base);
    await page.locator('#preloader').waitFor({ state: 'hidden' });
    assert.ok(images.size <= 2, `Only near-screen posters should load, requested ${images.size}`);
    let bytes = 0;
    for (const image of images) bytes += Number((await page.request.head(image)).headers()['content-length']);
    assert.ok(bytes < 150_000, `Mobile initial posters should fit 150 KB, got ${bytes}`);
    await page.locator('#material-grid').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#material-grid video')].every(v => v.poster));
    assert.equal(await page.locator('#material-grid .video-media').evaluateAll(es => es.every(e => getComputedStyle(e).backgroundImage !== 'none')), true);
  } finally { await context.close(); }
});

const open = async (options = {}, setup) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN', ...options });
  if (setup) await context.addInitScript(setup);
  const page = await context.newPage();
  await page.goto(url);
  await page.locator('#product-track .product-card').last().waitFor();
  await page.locator('#preloader').waitFor({ state: 'hidden' });
  return { context, page };
};
const active = page => page.locator('video').evaluateAll(videos => videos.filter(v => !v.paused).length);
const eventually = async (fn, message) => {
  const end = Date.now() + 8000;
  while (Date.now() < end) { if (await fn()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
  assert.fail(message);
};

test('local preview streams MP4 ranges for seeking, including HEAD and invalid ranges', async () => {
  const media = new URL('video/loops/product-01-paw-balm-loop.mp4', url);
  const response = await fetch(media, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(response.status, 206);
  assert.match(response.headers.get('content-type'), /video\/mp4/);
  assert.match(response.headers.get('content-range'), /^bytes 0-1023\/\d+$/);
  assert.equal((await response.arrayBuffer()).byteLength, 1024);
  const head = await fetch(media, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.ok(Number(head.headers.get('content-length')) > 1024);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const invalid = await fetch(media, { headers: { Range: 'bytes=999999999-' } });
  assert.equal(invalid.status, 416);
  const forbidden = await fetch(new URL('video/%2e%2e%2fpackage.json', url));
  assert.equal(forbidden.status, 404);
});

test('desktop plays muted hero, pauses offscreen, and limits three visible material clips to two', async () => {
  const { context, page } = await open();
  try {
    assert.equal(await page.locator('video').count(), 25);
    await eventually(() => page.locator('#hero-video').evaluate(v => !v.paused && v.currentTime > 0), 'desktop hero must play');
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.locator('#material-grid').scrollIntoViewIfNeeded();
    await eventually(async () => await active(page) === 2, 'at most two of the three materials should play');
    assert.equal(await page.locator('#hero-video').evaluate(v => v.paused), true);
    assert.equal(await page.locator('video').evaluateAll(vs => vs.every(v => v.muted && v.playsInline && v.preload === 'none')), true);
    assert.ok(await page.locator('#material-grid video').evaluateAll(vs => vs.filter(v => !v.paused).every(v => v.currentTime >= 0)));
    await page.locator('footer').scrollIntoViewIfNeeded();
    await eventually(() => page.locator('#material-grid video, #hero-video').evaluateAll(vs => vs.every(v => v.paused)), 'offscreen materials and hero must pause');
    // The subscription background can still be visible above the footer.
    assert.equal(await page.locator('video').evaluateAll(vs => vs.filter(v => !v.paused).every(v => {
      const r = v.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.right, innerWidth) - Math.max(0, r.left)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(0, r.top));
      return area / (r.width * r.height) >= .3;
    })), true);
    assert.deepEqual(errors, []);
    assert.equal(await page.locator('html').evaluate(e => e.scrollWidth <= innerWidth), true);
  } finally { await context.close(); }
});

test('carousel waits for intent, never fetches hidden cards, and restores poster after hover', async () => {
  const { context, page } = await open();
  try {
    assert.equal(await page.locator('#product-track video').count(), 13);
    await page.locator('#collection-viewport').scrollIntoViewIfNeeded();
    const first = page.locator('#product-track .product-card').first();
    await first.locator('.product-body').hover();
    await eventually(() => first.locator('video').evaluate(v => !v.paused && v.currentTime > 0), 'hover must start video');
    assert.equal(await page.locator('#product-track .product-card').last().locator('video').evaluate(v => v.currentSrc), '');
    await page.mouse.move(5, 5);
    await eventually(() => first.locator('video').evaluate(v => v.paused && v.currentTime === 0 && !v.closest('.video-media').classList.contains('is-playing')), 'hover leave must restore poster');
    await page.locator('#collection-viewport').evaluate(e => { e.scrollLeft = e.scrollWidth; });
    const last = page.locator('#product-track .product-card').last();
    await last.hover();
    await eventually(() => last.locator('video').evaluate(v => !v.paused && v.currentTime > 0), 'visible concept card must play');
    await page.evaluate(() => { window.__previousVideos = [...document.querySelectorAll('#product-track video, #featured-list video, #material-grid video')]; document.querySelector('[data-language="en"]').click(); });
    assert.equal(await page.locator('video').count(), 25);
    assert.equal(await page.evaluate(() => window.__previousVideos.every(v => v.paused && !v.isConnected)), true);
    assert.ok(await active(page) <= 2);
  } finally { await context.close(); }
});

test('mobile hero waits for tap and card taps toggle without horizontal overflow', async () => {
  const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    assert.equal(await page.locator('video').count(), 25);
    const hero = page.locator('#hero-video');
    assert.equal(await hero.evaluate(v => v.currentSrc), '');
    await page.locator('.hero [data-video-button]').tap();
    await eventually(() => hero.evaluate(v => !v.paused && v.currentTime > 0), 'mobile hero tap must play');
    await page.locator('#collection-viewport').scrollIntoViewIfNeeded();
    const card = page.locator('#product-track .product-card').first();
    await card.locator('.product-card-image').tap({ position: { x: 50, y: 50 } });
    await eventually(() => card.locator('video').evaluate(v => !v.paused), 'card tap must play');
    await card.locator('[data-video-button]').tap();
    await eventually(() => card.locator('video').evaluate(v => v.paused), 'second tap must pause');
    assert.equal(await page.locator('html').evaluate(e => e.scrollWidth <= innerWidth), true);
  } finally { await context.close(); }
});

test('reduced motion never loads or plays video even when asked', async () => {
  const { context, page } = await open({ reducedMotion: 'reduce' });
  try {
    assert.equal(await page.locator('video').count(), 25);
    await page.locator('#material-grid').scrollIntoViewIfNeeded();
    assert.equal(await active(page), 0);
    assert.equal(await page.locator('video').evaluateAll(vs => vs.every(v => !v.currentSrc && !!v.dataset.poster)), true);
    await eventually(() => page.locator('#material-grid video').evaluateAll(vs => vs.every(v => !!v.poster && getComputedStyle(v.closest('.video-media')).backgroundImage !== 'none')), 'visible reduced-motion media must show its poster');
    assert.equal(await page.locator('[data-video-button]:visible').count(), 0);
  } finally { await context.close(); }
});

test('Save-Data only loads media after explicit play', async () => {
  const { context, page } = await open({}, () => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  try {
    assert.equal(await page.locator('video').count(), 25);
    await page.locator('#material-grid').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('video').evaluateAll(vs => vs.every(v => !v.currentSrc)), true);
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await page.locator('.hero [data-video-button]').click();
    await eventually(() => page.locator('#hero-video').evaluate(v => !v.paused), 'explicit play is allowed with Save-Data');
  } finally { await context.close(); }
});

test('full-width film starts on click with native controls', async () => {
  const { context, page } = await open();
  try {
    const film = page.locator('#scene-video');
    assert.equal(await film.count(), 1);
    await page.locator('.scene-band').scrollIntoViewIfNeeded();
    assert.equal(await film.evaluate(v => v.currentSrc), '');
    await page.locator('.scene-band [data-video-button]').click();
    await eventually(() => film.evaluate(v => !v.paused && v.controls), 'clicked film must show controls');
  } finally { await context.close(); }
});

test('broken video leaves an embedded poster visible', async () => {
  const { context, page } = await open();
  try {
    assert.equal(await page.locator('video').count(), 25);
    await page.route('**/video/loops/product-02-*', route => route.abort());
    const feature = page.locator('#featured-list .feature').nth(1);
    await feature.scrollIntoViewIfNeeded();
    await eventually(() => feature.locator('.video-media').evaluate(e => e.classList.contains('has-error')), 'media error must be handled');
    assert.equal(await feature.locator('video').evaluate(v => getComputedStyle(v).opacity), '0');
    assert.notEqual(await feature.locator('.video-media').evaluate(e => getComputedStyle(e).backgroundImage), 'none');
  } finally { await context.close(); }
});
