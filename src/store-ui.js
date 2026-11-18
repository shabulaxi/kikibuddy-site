import { products } from './data/products.js';
import { policies } from './data/policies.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const localized = (item, field, lang) => item[`${field}_${lang}`];
export const ui = lang => strings[lang === 'en' ? 'en' : 'zh'];
const strings = {
  zh: { pricePending: '价格待定', soon: '即将上线', buy: '立即购买', view: '了解产品', care: '护理系列', collection: '全部系列', story: '品牌故事', faq: '常见问题', usage: '使用方法', specs: '产品规格', notes: '注意事项', related: '继续，照顾它的日常。', reviews: '它们的日常，你的声音。', empty: '还没有评价。期待你和它的第一份分享。', write: '写评价', count: '条评价', photo: '查看评价照片', close: '关闭照片', label: '请按产品标签说明使用。', labelNotes: '使用前请阅读产品标签。', rituals: '成套的照顾', includes: '组合包含', rights: '保留所有权利。', footerNote: '为和它一起生活的人而做。', support: '联系我们', back: '返回护理系列', policies: '购物须知' },
  en: { pricePending: 'Price to be confirmed', soon: 'Coming soon', buy: 'Buy now', view: 'View product', care: 'Care series', collection: 'The collection', story: 'Our story', faq: 'FAQ', usage: 'How to use', specs: 'Specifications', notes: 'Care notes', related: 'A little more everyday care.', reviews: 'Their everyday. Your words.', empty: 'No reviews yet. We look forward to your first story together.', write: 'Write a review', count: 'reviews', photo: 'View review photo', close: 'Close photo', label: 'Please follow the directions on the product label.', labelNotes: 'Read the product label before use.', rituals: 'The ritual sets', includes: 'In this set', rights: 'All rights reserved.', footerNote: 'Made for life with them.', support: 'Contact us', back: 'Back to care series', policies: 'Customer care' }
};

export function getLanguage() {
  try { const stored = localStorage.getItem('kikibuddy-language'); if (stored === 'en' || stored === 'zh') return stored; } catch { /* Storage can be disabled. */ }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
export function saveLanguage(lang) {
  try { localStorage.setItem('kikibuddy-language', lang); } catch { /* Language still works for this page. */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === lang)));
}

const validPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function renderPrice(item, lang) {
  const money = value => escapeHtml(new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en', { style: 'currency', currency: item.currency || 'CNY' }).format(value));
  if (!validPrice(item.price)) return `<span class="price-value price-pending">${ui(lang).pricePending}</span>`;
  return `<span class="price-value">${money(item.price)}</span>${validPrice(item.compareAtPrice) && item.compareAtPrice > item.price ? `<del class="compare-price">${money(item.compareAtPrice)}</del>` : ''}`;
}
function safeUrl(value, relative = false) {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (relative && /^\/(?!\/)/.test(value)) return value;
  try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null; } catch { return null; }
}
export function renderPurchase(item, lang) {
  const url = safeUrl(item.buyUrl);
  return url ? `<a class="purchase-control" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${ui(lang).buy}</a>` : `<button type="button" class="purchase-control" disabled>${ui(lang).soon}</button>`;
}

export function productVideo(product, lang, mode = 'auto', poster = product.image) {
  return kikiVideo(poster, product.video_mp4, mode, localized(product, 'name', lang), '', 1, product.video_webm);
}
export function renderProductCard(product, lang) {
  return `<article class="product-card"><div class="product-card-image">${productVideo(product, lang, 'card')}<span class="product-tag">KIKIBUDDY CARE</span></div><div class="product-body"><span class="kicker">KIKIBUDDY CARE</span><h3>${escapeHtml(localized(product, 'name', lang))}<small>${escapeHtml(product.name_en)}</small></h3><p>${escapeHtml(localized(product, 'tagline', lang))}</p><div class="card-foot"><span class="card-price">${renderPrice(product, lang)}</span><a href="/product/${product.slug}">${ui(lang).view} ↗</a></div></div></article>`;
}
export function renderBundles(bundles, lang) {
  return bundles.map((bundle, index) => {
    const items = bundle.items.map(slug => products.find(p => p.slug === slug)).filter(Boolean);
    return `<article class="bundle-card"><div class="bundle-collage" style="--items:${items.length}">${items.map(p => `<a href="/product/${p.slug}" aria-label="${escapeHtml(localized(p, 'name', lang))}"><img loading="lazy" decoding="async" src="${escapeHtml(p.image)}" alt="${escapeHtml(localized(p, 'name', lang))}" width="480" height="480"></a>`).join('')}</div><div class="bundle-copy"><p class="eyebrow">RITUAL 0${index + 1}</p><h3>${escapeHtml(localized(bundle, 'name', lang))}</h3><p class="kicker">${ui(lang).includes}</p><ul class="bundle-items">${items.map(p => `<li><a href="/product/${p.slug}">${escapeHtml(localized(p, 'name', lang))}</a></li>`).join('')}</ul><div class="bundle-purchase"><span>${renderPrice(bundle, lang)}</span>${renderPurchase(bundle, lang)}</div></div></article>`;
  }).join('');
}

let starId = 0;
function stars(rating) {
  const path = 'M12 2.5 14.9 8.4 21.4 9.4 16.7 14 17.8 20.5 12 17.4 6.2 20.5 7.3 14 2.6 9.4 9.1 8.4Z';
  return `<span class="rating-stars" role="img" aria-label="${rating} / 5">${Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, rating - i)); const id = `review-star-${++starId}`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="${id}"><rect width="${24 * fill}" height="24"/></clipPath></defs><path d="${path}" fill="none" stroke="currentColor"/><path class="${fill > 0 && fill < 1 ? 'star-half' : 'star-fill'}" d="${path}" fill="currentColor" clip-path="url(#${id})"/></svg>`;
  }).join('')}</span>`;
}
export function renderReviews(reviews, lang, productSlug = null) {
  const all = reviews.filter(r => (!productSlug || r.productSlug === productSlug) && typeof r.rating === 'number' && r.rating >= 0 && r.rating <= 5 && r.author && r[`text_${lang}`]).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const visible = productSlug ? all : all.slice(0, 6);
  const average = all.length ? (all.reduce((sum, r) => sum + r.rating, 0) / all.length).toFixed(1) : null;
  return `<div class="review-toolbar">${all.length ? `<div class="review-summary"><strong>${average}</strong>${stars(Number(average))}<span>${all.length} ${ui(lang).count}</span></div>` : ''}<a class="ghost-button review-write" href="mailto:hello@kikibuddy.co?subject=${encodeURIComponent(productSlug ? `KikiBuddy review: ${productSlug}` : 'KikiBuddy review')}">${ui(lang).write} ↗</a></div>${visible.length ? `<div class="review-grid">${visible.map(r => {
    const product = products.find(p => p.slug === r.productSlug);
    const photos = (r.photos || []).map(p => safeUrl(p, true)).filter(Boolean).slice(0, 3);
    return `<article class="review">${stars(r.rating)}${!productSlug && product ? `<a class="review-product" href="/product/${product.slug}">${escapeHtml(localized(product, 'name', lang))}</a>` : ''}<blockquote>${escapeHtml(r[`text_${lang}`])}</blockquote><cite>${escapeHtml(r.author)}<span>${escapeHtml(r.petTag)}</span></cite>${r.date ? `<time datetime="${escapeHtml(r.date)}">${escapeHtml(r.date)}</time>` : ''}${photos.length ? `<div class="review-photos">${photos.map((p, i) => `<button type="button" data-review-photo="${escapeHtml(p)}" aria-label="${ui(lang).photo} ${i + 1} · ${escapeHtml(r.author)}"><img loading="lazy" src="${escapeHtml(p)}" alt="${escapeHtml(r.author)} · ${i + 1}" width="96" height="96"></button>`).join('')}</div>` : ''}</article>`;
  }).join('')}</div>` : `<p class="review-empty">${ui(lang).empty}</p>`}`;
}

const photoBindings = new WeakSet();
export function bindReviewPhotos(root = document) {
  if (photoBindings.has(root)) return;
  photoBindings.add(root);
  let dialog, opener;
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-review-photo]');
    if (!button) return;
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'review-photo-dialog';
      dialog.innerHTML = '<button type="button" class="photo-close">×</button><img alt="">';
      document.body.append(dialog);
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
      dialog.addEventListener('close', () => { dialog.querySelector('img').removeAttribute('src'); if (opener?.isConnected) opener.focus({ preventScroll: true }); });
    }
    opener = button;
    const label = button.getAttribute('aria-label');
    dialog.setAttribute('aria-label', label);
    dialog.querySelector('img').src = button.dataset.reviewPhoto;
    dialog.querySelector('img').alt = label;
    dialog.querySelector('button').setAttribute('aria-label', ui(document.documentElement.lang.startsWith('zh') ? 'zh' : 'en').close);
    dialog.showModal();
  });
}

export function renderHeader(lang) {
  const t = ui(lang);
  return `<a class="wordmark" href="/">KikiBuddy</a><nav class="site-nav"><a href="/#collection">${t.collection}</a><a href="/#story">${t.story}</a><a href="/#faq">${t.faq}</a></nav><div class="header-tools"><div class="language" aria-label="Language"><button type="button" data-language="zh" aria-pressed="${lang === 'zh'}">中文</button><i aria-hidden="true"></i><button type="button" data-language="en" aria-pressed="${lang === 'en'}">EN</button></div></div>`;
}
export function renderFooter(lang) {
  const t = ui(lang);
  return `<div class="wrap"><div class="footer-top"><a class="footer-mark serif" href="/">KikiBuddy</a><div class="footer-groups"><nav class="footer-links" aria-label="${t.care}"><a href="/#featured">${t.care}</a><a href="/#story">${t.story}</a><a href="/#faq">${t.faq}</a></nav><nav class="footer-links policy-links" aria-label="${t.policies}">${['privacy', 'returns', 'shipping', 'terms'].map(slug => { const p = policies.find(p => p.slug === slug); return `<a href="/policies/${slug}">${escapeHtml(localized(p, 'title', lang))}</a>`; }).join('')}</nav><div class="footer-contact"><span>${t.support}</span><a href="mailto:hello@kikibuddy.co">hello@kikibuddy.co</a></div></div></div><div class="footer-bottom"><span>© 2026 KikiBuddy. ${t.rights}</span><span>${t.footerNote}</span></div></div>`;
}
