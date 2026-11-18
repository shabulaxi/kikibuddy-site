import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createHandler } from '../scripts/preview.mjs';

let browser, base, devBase;
const servers = [];
const slugs = ['paw-nose-balm', 'ear-rinse', 'odor-spray', 'dental-spray', 'shampoo'];
const names = ['爪鼻膏', '宠物洗耳液', '除臭喷雾', '洁牙喷雾', '二合一洗护香波'];
before(async () => {
  for (const dirs of [[resolve('dist')], [resolve('src'), resolve('public')]]) {
    const server = createServer(createHandler(...dirs));
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    servers.push(server);
  }
  [base, devBase] = servers.map(s => `http://127.0.0.1:${s.address().port}`);
  browser = await chromium.launch({ headless: true, ...(process.env.KIKI_BROWSER_CHANNEL ? { channel: process.env.KIKI_BROWSER_CHANNEL } : {}) });
});
after(async () => {
  await browser?.close();
  for (const s of servers) { s.closeAllConnections(); await new Promise(done => s.close(done)); }
});

test('five product deep pages work in source and static builds with their own content and related products', async () => {
  const page = await browser.newPage({ locale: 'zh-CN', reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    for (const origin of [base, devBase]) {
      for (const [i, slug] of slugs.entries()) {
        const response = await page.goto(`${origin}/product/${slug}`);
        assert.equal(response.status(), 200, `${origin}/product/${slug}`);
        await page.locator('h1').waitFor();
        assert.equal(await page.locator('h1').textContent(), names[i]);
        assert.equal(await page.locator('.detail-points li').count(), 3);
        assert.equal(await page.locator('.purchase-control').first().isDisabled(), true);
        assert.equal(await page.locator('.review-summary').count(), 0);
        assert.equal(await page.locator('#related-products .product-card').count(), 4);
        assert.equal(await page.locator(`#related-products a[href="/product/${slug}"]`).count(), 0);
        assert.doesNotMatch(await page.locator('main').innerText(), /待确认|防跳蚤|每天 1|酶系/);
        const video = page.locator('.detail-media video');
        assert.match(await video.getAttribute('data-src'), /product-0[1-5].*\.mp4$/);
        assert.equal((await page.request.head(`${origin}${await video.getAttribute('data-src')}`)).status(), 200);
      }
      assert.equal((await page.goto(`${origin}/product/not-a-product`)).status(), 404);
      assert.equal((await page.goto(`${origin}/product/paw-nose-balm/missing.webp`)).status(), 404);
    }
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('home links open real products and bundles are between featured and collection', async () => {
  const page = await browser.newPage({ locale: 'zh-CN', reducedMotion: 'reduce' });
  try {
    await page.goto(base);
    await page.locator('#bundle-list .bundle-card').last().waitFor();
    assert.equal(await page.locator('#bundle-list .bundle-card').count(), 2);
    assert.equal(await page.locator('#bundle-list .purchase-control:disabled').count(), 2);
    assert.equal(await page.locator('#bundle-list .bundle-items li').count(), 5);
    assert.equal(await page.locator('#featured + #bundles + #collection').count(), 1);
    for (const slug of slugs) {
      assert.equal(await page.locator(`#featured-list a[href="/product/${slug}"]`).count(), 1);
      assert.equal(await page.locator(`#product-track a[href="/product/${slug}"]`).count(), 1);
    }
    assert.equal(await page.locator('.review-summary').count(), 0);
    assert.equal(await page.locator('.review-empty').count(), 1);
    assert.equal(await page.locator('a[href^="mailto:"]').filter({ hasText: /Instagram|小红书/ }).count(), 0);
    await page.locator('#featured-list a').first().click();
    await page.waitForURL('**/product/paw-nose-balm');
    await page.locator('h1').waitFor();
    await page.locator('[data-language="en"]').click();
    assert.equal(await page.locator('h1').textContent(), 'Paw & Nose Balm');
    await page.reload();
    assert.equal(await page.locator('h1').textContent(), 'Paw & Nose Balm');
  } finally { await page.close(); }
});

test('nullable and configured purchase data control price, comparison and safe new-tab links', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  try {
    await page.goto(base);
    await page.evaluate(async () => {
      const { renderPurchase, renderPrice } = await import('/store-ui.js');
      const fixture = document.createElement('section'); fixture.id = 'commerce-fixture';
      fixture.innerHTML = renderPrice({ price: null, currency: 'CNY' }, 'zh') + renderPurchase({ buyUrl: null }, 'zh');
      document.body.prepend(fixture);
    });
    assert.match(await page.locator('#commerce-fixture').innerText(), /价格待定/);
    assert.equal(await page.locator('#commerce-fixture button').isDisabled(), true);
    await page.evaluate(async () => {
      const { renderPurchase, renderPrice } = await import('/store-ui.js');
      const item = { price: 68, compareAtPrice: 88, currency: 'CNY', buyUrl: 'https://example.com/buy?item=balm&qty=1' };
      document.querySelector('#commerce-fixture').innerHTML = renderPrice(item, 'zh') + renderPurchase(item, 'zh');
    });
    const buy = page.locator('#commerce-fixture a');
    assert.equal(await buy.textContent(), '立即购买');
    assert.equal(await buy.getAttribute('target'), '_blank');
    assert.match(await buy.getAttribute('rel'), /noopener/);
    assert.equal(await buy.getAttribute('href'), 'https://example.com/buy?item=balm&qty=1');
    assert.match(await page.locator('#commerce-fixture del').textContent(), /88/);
    assert.match(await page.locator('#commerce-fixture .price-value').textContent(), /68/);
  } finally { await page.close(); }
});

test('shared reviews sort, filter, average and show half stars with at most three accessible photos', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce', locale: 'zh-CN' });
  try {
    await page.goto(base);
    await page.evaluate(async () => {
      const { renderReviews } = await import('/store-ui.js');
      const photo = '/assets/856a8980624f2309.webp';
      const fixture = document.createElement('section'); fixture.id = 'review-fixture';
      const reviews = Array.from({ length: 8 }, (_, i) => ({ productSlug: i === 7 ? 'shampoo' : 'paw-nose-balm', rating: i === 0 ? 4 : 4.5, text_zh: `测试评价 ${i}`, text_en: `Test review ${i}`, author: `Test ${i}`, petTag: '测试宠物', photos: i === 6 ? [photo, photo, photo, photo] : [], date: `2026-11-${String(10 + i).padStart(2, '0')}` }));
      fixture.innerHTML = renderReviews(reviews, 'zh', 'paw-nose-balm'); document.body.prepend(fixture);
    });
    assert.equal(await page.locator('#review-fixture .review').count(), 7);
    assert.match(await page.locator('#review-fixture .review').first().innerText(), /测试评价 6/);
    assert.doesNotMatch(await page.locator('#review-fixture').innerText(), /测试评价 7/);
    assert.match(await page.locator('#review-fixture .review-summary').innerText(), /4\.4.*7/s);
    assert.ok(await page.locator('#review-fixture svg .star-half').count() > 0);
    assert.equal(await page.locator('#review-fixture [data-review-photo]').count(), 3);
    const photo = page.locator('#review-fixture [data-review-photo]').first();
    await photo.click();
    assert.equal(await page.locator('dialog[open] img').count(), 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await photo.evaluate(e => e === document.activeElement), true);
  } finally { await page.close(); }
});

test('four policy pages retain source placeholders, switch language, and refresh on trailing-slash URLs', async () => {
  const page = await browser.newPage({ locale: 'zh-CN', reducedMotion: 'reduce' });
  try {
    for (const [slug, zh, en] of [['privacy', '[客服邮箱]', '[support email]'], ['returns', '[30]', '[30]'], ['shipping', '[¥199 / $29]', '[¥199 / $29]'], ['terms', '[公司注册地法律]', '[jurisdiction of registration]']]) {
      for (const origin of [base, devBase]) {
        assert.equal((await page.goto(`${origin}/policies/${slug}/`)).status(), 200);
        await page.locator('[data-language="zh"]').click();
        assert.ok((await page.locator('.policy-body').innerText()).includes(zh));
        await page.locator('[data-language="en"]').click();
        assert.ok((await page.locator('.policy-body').innerText()).includes(en));
        await page.reload();
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        assert.equal(await page.locator('.site-footer a[href^="/policies/"]').count(), 4);
        assert.equal(await page.locator('.site-footer a[href="mailto:hello@kikibuddy.co"]').textContent(), 'hello@kikibuddy.co');
      }
    }
  } finally { await page.close(); }
});

test('mobile detail puts video before text and keeps purchase controls at the viewport bottom', async () => {
  const page = await browser.newPage({ locale: 'zh-CN', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${base}/product/paw-nose-balm`);
    await page.locator('h1').waitFor();
    const media = await page.locator('.detail-media').boundingBox();
    const copy = await page.locator('.detail-copy').boundingBox();
    assert.ok(media.y + media.height <= copy.y + 1);
    await page.locator('#related-products').scrollIntoViewIfNeeded();
    const bar = await page.locator('.mobile-purchase').boundingBox();
    assert.ok(bar.y + bar.height >= 843 && bar.y < 844);
    assert.equal(await page.locator('html').evaluate(e => e.scrollWidth <= innerWidth), true);
    await page.locator('[data-language="en"]').click();
    assert.equal(await page.locator('.mobile-purchase button').textContent(), 'Coming soon');
  } finally { await page.close(); }
});

test('detail video uses the existing viewport controller and supports pause/resume', async () => {
  const page = await browser.newPage({ locale: 'en', viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(`${base}/product/paw-nose-balm`);
    const video = page.locator('.detail-media video');
    await page.waitForFunction(() => { const v = document.querySelector('.detail-media video'); return v && !v.paused && v.currentTime > 0; });
    await page.locator('.detail-media [data-video-button]').click();
    assert.equal(await video.evaluate(v => v.paused), true);
    await page.locator('.detail-media [data-video-button]').click();
    await page.waitForFunction(() => !document.querySelector('.detail-media video').paused);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.detail-media video').paused);
  } finally { await page.close(); }
});
