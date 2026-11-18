import { products } from './data/products.js';
import { reviews } from './data/reviews.js';
import { policies } from './data/policies.js';
import { escapeHtml as e, localized, ui, getLanguage, saveLanguage, renderPrice, renderPurchase, renderProductCard, renderReviews, renderHeader, renderFooter, productVideo, bindReviewPhotos } from './store-ui.js';

const main = document.getElementById('main');
const media = createKikiMedia();
const [, type, slug] = location.pathname.replace(/\/$/, '').split('/');
const product = type === 'product' && products.find(p => p.slug === slug);
const policy = type === 'policies' && policies.find(p => p.slug === slug);

function productPage(product, lang) {
  const t = ui(lang);
  const specRows = product.specs.map(s => `<tr><th scope="row">${e(localized(s, 'label', lang))}</th><td>${e(s[lang])}</td></tr>`).join('');
  return `<div class="wrap detail-intro"><a class="back-link" href="/#featured">← ${t.back}</a><div class="detail-hero"><div class="detail-media">${productVideo(product, lang, 'auto')}</div><div class="detail-copy"><p class="eyebrow">KIKIBUDDY CARE / 0${products.indexOf(product) + 1}</p><h1>${e(localized(product, 'name', lang))}</h1><p class="detail-subtitle">${e(product.name_en)}</p><p class="detail-tagline">${e(localized(product, 'tagline', lang))}</p><div class="detail-purchase"><div class="detail-price">${renderPrice(product, lang)}</div>${renderPurchase(product, lang)}</div><dl class="spec-preview">${product.specs.slice(0, 3).map(s => `<div><dt>${e(localized(s, 'label', lang))}</dt><dd>${e(s[lang])}</dd></div>`).join('')}</dl></div></div></div>
    <section class="detail-highlights wrap" aria-label="${lang === 'zh' ? '产品卖点' : 'Product highlights'}"><ul class="detail-points">${product.points.map((p, i) => `<li><span class="point-symbol" aria-hidden="true">${['◇', '○', '✧'][i]}</span><span>${e(p[lang])}</span></li>`).join('')}</ul></section>
    <div class="wrap detail-information"><section class="detail-section"><div><p class="eyebrow">01 / THE RITUAL</p><h2>${t.usage}</h2></div><ol class="usage-steps">${(product.usage.length ? product.usage.map(p => p[lang]) : [t.label]).map(step => `<li>${e(step)}</li>`).join('')}</ol></section><section class="detail-section"><div><p class="eyebrow">02 / THE DETAILS</p><h2>${t.specs}</h2></div><table class="spec-table"><caption class="sr-only">${t.specs}</caption><tbody>${specRows}</tbody></table></section><section class="detail-section"><div><p class="eyebrow">03 / WITH CARE</p><h2>${t.notes}</h2></div><ul class="care-notes">${(product.notes.length ? product.notes.map(p => p[lang]) : [t.labelNotes]).map(p => `<li>${e(p)}</li>`).join('')}</ul></section></div>
    <section class="section detail-reviews"><div class="wrap"><div class="section-head"><div><p class="eyebrow">IN THEIR WORDS</p><h2>${t.reviews}</h2></div></div>${renderReviews(reviews, lang, product.slug)}</div></section><section class="section related-section"><div class="wrap"><div class="section-head"><div><p class="eyebrow">CONTINUE THE RITUAL</p><h2>${t.related}</h2></div></div><div id="related-products" class="related-products">${products.filter(p => p.slug !== product.slug).map(p => renderProductCard(p, lang)).join('')}</div></div></section><div class="mobile-purchase"><div><span class="mobile-product-name">${e(localized(product, 'name', lang))}</span>${renderPrice(product, lang)}</div>${renderPurchase(product, lang)}</div>`;
}

function render(lang) {
  media.release(main);
  document.querySelector('.site-header').innerHTML = renderHeader(lang);
  document.querySelector('.site-footer').innerHTML = renderFooter(lang);
  if (product) {
    document.body.classList.add('product-page');
    document.title = `${localized(product, 'name', lang)} · KikiBuddy`;
    main.innerHTML = productPage(product, lang);
  } else if (policy) {
    document.title = `${localized(policy, 'title', lang)} · KikiBuddy`;
    main.innerHTML = `<article class="wrap policy-page"><a class="back-link" href="/">← KikiBuddy</a><p class="eyebrow">KIKIBUDDY / CUSTOMER CARE</p><h1>${e(localized(policy, 'title', lang))}</h1><p class="policy-subtitle">${e(policy.title_en)}</p><ul class="policy-body">${policy[lang].map(p => `<li>${e(p)}</li>`).join('')}</ul></article>`;
  }
  saveLanguage(lang);
  document.querySelectorAll('[data-language]').forEach(b => b.addEventListener('click', () => render(b.dataset.language)));
  media.refresh();
}
bindReviewPhotos();
render(getLanguage());
