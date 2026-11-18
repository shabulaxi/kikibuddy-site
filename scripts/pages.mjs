import { products } from '../src/data/products.js';
import { policies } from '../src/data/policies.js';
import { escapeHtml } from '../src/store-ui.js';

export const pages = [
  ...products.map(p => ({ path: `/product/${p.slug}`, title: p.name_zh, description: p.tagline_zh })),
  ...policies.map(p => ({ path: `/policies/${p.slug}`, title: p.title_zh, description: p.title_en }))
];

export function renderPage(page) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(page.title)} · KikiBuddy</title><meta name="description" content="${escapeHtml(page.description)}"><meta property="og:title" content="${escapeHtml(page.title)} · KikiBuddy"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:type" content="website"><meta name="robots" content="index,follow"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230a0a0a'/%3E%3Cpath d='M18 39c0-10 6-18 14-18s14 8 14 18c0 7-5 12-14 12S18 46 18 39Z' fill='%23c8a96a'/%3E%3C/svg%3E"><link rel="stylesheet" href="/styles.css"></head><body class="inner-page"><a class="skip" href="#main">跳转到主要内容 / Skip to content</a><header class="site-header" aria-label="主导航 / Main navigation"></header><main id="main"></main><footer class="site-footer"></footer><noscript><p>请启用 JavaScript 以浏览产品与政策。Please enable JavaScript to view products and policies.</p><a href="/">KikiBuddy</a></noscript><script src="/media.js" defer></script><script type="module" src="/pages.js"></script></body></html>`;
}
