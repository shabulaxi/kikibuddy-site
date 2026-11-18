import { products as catalog } from './data/products.js';
import { bundles } from './data/bundles.js';
import { reviews } from './data/reviews.js';
import { renderPrice, renderPurchase, renderProductCard, renderBundles, renderReviews as reviewMarkup, renderFooter, productVideo, ui, bindReviewPhotos } from './store-ui.js';

    (() => {
      'use strict';
      const asset = (path) => path;
      const copy = {
        zh: {
          nav: { collection: '系列', featured: '护理系列', story: '品牌故事', faq: '常见问题' },
          hero: { eyebrow: '日常护理，静静发生', title: '给它的日常', subtitle: 'CARE, IN ITS QUIETEST FORM.', note: '为每一个被认真对待的日常，做得更简单一点。', cta: '探索护理系列', scroll: '向下探索' },
          marquee: '温和配方 · 清晰习惯 · 安静陪伴 · QUIET CARE · CONSIDERED DAILY ·',
          featured: { eyebrow: '真实护理系列', title: '把照顾，变成<br>愿意重复的事。', intro: '五个真实产品，服务那些微小却重要的日常时刻。' },
          collection: { eyebrow: '全部系列 / THE COLLECTION', title: '照顾这件事，<br>不必复杂。', concept: '概念系列', real: '真实产品', view: '了解产品', placeholder: '价格待定' },
          scene: { eyebrow: 'CARE, IN MOTION', title: '手心的温度，<br>它知道。', copy: '护理不是一个任务。是你们之间，安静而熟悉的几分钟。' },
          story: { eyebrow: '我们的想法 / OUR POINT OF VIEW', title: '好的护理，<br>不需要被大声说出来。', copy1: 'KikiBuddy 从一个很简单的观察开始：最值得的照顾，通常发生在没人看见的时候。', copy2: '我们把配方、触感和使用方式都做得更清楚，让你把注意力留给它，而不是瓶子。' },
          materials: { eyebrow: '我们在意的三件事', title: '少一点噪音，<br>多一点确定。', intro: '每一款产品都从宠物真实的生活出发。' },
          reviews: { eyebrow: '他们的日常', title: '被认真照顾，<br>是一种感觉。' },
          faq: { eyebrow: '一问一答 / FAQ', title: '你想知道的，<br>我们慢慢说。' },
          subscribe: { eyebrow: '留在这里 / STAY CLOSE', title: '加入我们。', placeholder: '你的邮箱地址 / Your email', button: '加入 / JOIN', success: '已收到。欢迎来到 KikiBuddy。', error: '请填写有效的邮箱地址。' },
          footer: { rights: '保留所有权利。', note: '为和它一起生活的人而做。' },
          featuredButton: '了解产品', featuredPrice: '价格待定', featuredReal: 'KIKIBUDDY CARE', faqPlus: '展开答案'
        },
        en: {
          nav: { collection: 'Collection', featured: 'Care series', story: 'Our story', faq: 'FAQ' },
          hero: { eyebrow: 'EVERYDAY CARE, QUIETLY MADE', title: 'For their everyday', subtitle: 'CARE, IN ITS QUIETEST FORM.', note: 'A little more clarity for every ritual you choose to keep.', cta: 'Explore the collection', scroll: 'Scroll to explore' },
          marquee: 'QUIET CARE · CONSIDERED DAILY · SMALL RITUALS · 温和配方 · 安静陪伴 ·',
          featured: { eyebrow: 'THE CARE SERIES', title: 'Make care a habit<br>you want to keep.', intro: 'Five real products for the small, important moments of everyday life.' },
          collection: { eyebrow: '全部系列 / THE COLLECTION', title: 'Care, made<br>uncomplicated.', concept: 'Concept', real: 'KikiBuddy original', view: 'View product', placeholder: 'Price on request' },
          scene: { eyebrow: 'CARE, IN MOTION', title: 'They feel<br>your hands.', copy: 'Care is not a task. It is a few quiet, familiar minutes between you.' },
          story: { eyebrow: 'OUR POINT OF VIEW', title: 'Good care<br>does not need a headline.', copy1: 'KikiBuddy began with a simple observation: the care that matters most often happens when no one is watching.', copy2: 'We make formulas, textures and routines clear, so your attention can stay with them, not the bottle.' },
          materials: { eyebrow: 'THREE THINGS WE KEEP CLOSE', title: 'Less noise.<br>More certainty.', intro: 'Every formula starts with the real lives pets lead.' },
          reviews: { eyebrow: 'IN THEIR WORDS', title: 'To be cared for<br>is a feeling.' },
          faq: { eyebrow: 'A FEW ANSWERS', title: 'What you want<br>to know, slowly.' },
          subscribe: { eyebrow: 'STAY CLOSE', title: 'Join us.', placeholder: 'Your email address', button: 'Join / →', success: 'You are in. Welcome to KikiBuddy.', error: 'Please enter a valid email address.' },
          footer: { rights: 'All rights reserved.', note: 'Made for life with them.' },
          featuredButton: 'View product', featuredPrice: 'Price on request', featuredReal: 'KIKIBUDDY CARE', faqPlus: 'Open answer'
        }
      };
      const products = [
        ...catalog.map(p => ({ ...p, real: true, video: p.video_mp4,
          zh: { name: p.name_zh, sub: p.name_en, category: '护理', desc: p.tagline_zh, benefits: p.points.map(point => point.zh) },
          en: { name: p.name_en, sub: 'KIKIBUDDY CARE', category: 'CARE', desc: p.tagline_en, benefits: p.points.map(point => point.en) }
        })),
        { image: 'assets/8ef61a8da040fae2.webp', zh: { name: '云朵猫窝', sub: 'Cloud Cat Bed', category: '家居', desc: '一个让午后慢下来的位置。' }, en: { name: 'Cloud Cat Bed', sub: 'A softer place', category: 'HOME', desc: 'A place for the afternoon to slow down.' } },
        { image: 'assets/bc346959fbaa167d.webp', zh: { name: '陶瓷双碗', sub: 'Ceramic Double Bowl', category: '家居', desc: '把每一餐放回自己的节奏。' }, en: { name: 'Ceramic Double Bowl', sub: 'For every meal', category: 'HOME', desc: 'Bring every meal back to its own rhythm.' } },
        { image: 'assets/d3e376b9bbd8e3b6.webp', zh: { name: '逗猫棒套装', sub: 'Play Wand Set', category: '陪伴', desc: '留一点时间，只用来玩。' }, en: { name: 'Play Wand Set', sub: 'For a little play', category: 'PLAY', desc: 'Make a little time that is only for play.' } },
        { image: 'assets/bd580dd3f91267da.webp', zh: { name: '牵引绳套装', sub: 'Walk Set', category: '出行', desc: '一起走远一点。' }, en: { name: 'Walk Set', sub: 'Go a little further', category: 'OUTDOOR', desc: 'Go a little further, together.' } },
        { image: 'assets/4d44c3de53a9e7ac.webp', zh: { name: '宠物洗护套装', sub: 'Bath Ritual Set', category: '洗护', desc: '让洗澡回到一种舒服的仪式。' }, en: { name: 'Bath Ritual Set', sub: 'A calmer bath', category: 'CARE', desc: 'Bring the bath back to a comfortable ritual.' } },
        { image: 'assets/387dd348f4f3b86a.webp', zh: { name: '耐咬飞盘', sub: 'Durable Disc', category: '陪伴', desc: '在风里，跑得尽兴。' }, en: { name: 'Durable Disc', sub: 'Run with it', category: 'PLAY', desc: 'Run freely, wherever the day takes you.' } },
        { image: 'assets/98e42249eeb7a238.webp', zh: { name: '冻干零食礼包', sub: 'Freeze-Dried Treats', category: '食物', desc: '简单的奖励，刚刚好。' }, en: { name: 'Freeze-Dried Treats', sub: 'Just enough reward', category: 'FOOD', desc: 'A simple reward, just enough.' } },
        { image: 'assets/d807874ae1249b9a.webp', zh: { name: '加厚宠物毯', sub: 'Heavyweight Pet Blanket', category: '家居', desc: '把熟悉的气味带到每个角落。' }, en: { name: 'Heavyweight Pet Blanket', sub: 'A familiar corner', category: 'HOME', desc: 'Bring a familiar feeling to every corner.' } }
      ];
      const videoPaths = ["video/loops/product-01-paw-balm-loop.mp4", "video/loops/product-02-ear-rinse-loop.mp4", "video/loops/product-03-odor-spray-loop.mp4", "video/loops/product-04-dental-spray-loop.mp4", "video/loops/product-05-shampoo-loop.mp4", "video/loops/concept-cat-bed-loop.mp4", "video/loops/concept-ceramic-bowls-loop.mp4", "video/loops/concept-cat-teaser-set-loop.mp4", "video/loops/concept-dog-leash-set-loop.mp4", "video/loops/concept-pet-grooming-set-loop.mp4", "video/loops/concept-dog-frisbee-loop.mp4", "video/loops/concept-freeze-dried-treats-loop.mp4", "video/loops/concept-pet-blanket-loop.mp4"];
      products.forEach((product, i) => product.video ||= videoPaths[i]);
      const materialMedia = [{"poster": "assets/5e46ecc43a3bf441.webp", "src": "video/loops/paw-balm-closeup-loop.mp4"}, {"poster": "assets/e97331f94250efc9.webp", "src": "video/loops/shampoo-use-loop.mp4"}, {"poster": "assets/be592431c05d4087.webp", "src": "video/loops/family-lineup-loop.mp4"}];
      const materials = [
        { zh: { title: '天然成分', sub: 'PLANT-LED', copy: '从宠物需要的触感出发，选择简单、可理解的成分。' }, en: { title: 'Natural ingredients', sub: 'PLANT-LED', copy: 'We start with the touch pets need, and ingredients you can understand.' } },
        { zh: { title: '温和配方', sub: 'GENTLE FORMULAS', copy: '不追求强烈的即时感，让日常护理可以持续。' }, en: { title: 'Gentle formulas', sub: 'GENTLE FORMULAS', copy: 'No harsh instant feeling. Just care designed to be repeated.' } },
        { zh: { title: '安全可舔舐', sub: 'MADE FOR REAL LIFE', copy: '为真实的生活细节考虑，包括它会舔到的地方。' }, en: { title: 'Made for real life', sub: 'MADE FOR REAL LIFE', copy: 'Thought through for real details, including the places they may lick.' } }
      ];
      const faqs = [
        { zh: { q: '成分对宠物安全吗？', a: '我们优先选择清晰、温和的配方，并为每个产品提供完整成分信息。使用前请阅读产品标签；如宠物有特殊情况，请先咨询兽医。' }, en: { q: 'Are the formulas safe for pets?', a: 'We choose clear, gentle formulas and provide full ingredient information for every product. Read the label before use, and consult your vet for specific conditions.' } },
        { zh: { q: '猫和狗都可以使用吗？', a: '不同产品的适用范围不同，请以对应产品页面与标签说明为准。我们会把适用对象写得清楚。' }, en: { q: 'Can cats and dogs use the same products?', a: 'It depends on the product. Please follow the individual product page and label, where the intended use is clearly stated.' } },
        { zh: { q: '应该多久使用一次？', a: '日常护理可以从少量、低频开始，再根据宠物状态调整。稳定、温和的习惯比一次使用很多更重要。' }, en: { q: 'How often should I use them?', a: 'Start with a small amount and a low frequency, then adjust to your pet. A steady, gentle routine matters more than using a lot at once.' } },
        { zh: { q: '可以退换吗？', a: '未开封且保持原包装的产品支持退换。具体时间与条件会在正式上线前更新。' }, en: { q: 'Can I return or exchange an item?', a: 'Unopened products in their original packaging can be returned or exchanged. Timing and conditions will be updated before launch.' } },
        { zh: { q: '配送需要多久？', a: '配送时间会根据地区与库存而变化。正式结账链接上线后，我们会在订单确认中提供准确的配送信息。' }, en: { q: 'How long does shipping take?', a: 'Delivery varies by location and stock. Accurate shipping details will be shown in your order confirmation once checkout is live.' } }
      ];
      const media = createKikiMedia();
      const storage = { get: () => { try { return localStorage.getItem('kikibuddy-language'); } catch (_) { return null; } }, set: value => { try { localStorage.setItem('kikibuddy-language', value); } catch (_) {} } };
      let language = (['zh', 'en'].includes(storage.get()) && storage.get()) || (navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
      const t = (key) => key.split('.').reduce((obj, part) => obj && obj[part], copy[language]) || key;
      const current = (item) => item[language] || item.en;
      const setLanguage = (next) => { ['featured-list', 'product-track', 'material-grid'].forEach(id => media.release(document.getElementById(id))); language = next === 'en' ? 'en' : 'zh'; storage.set(language); document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'; document.querySelectorAll('[data-i18n]').forEach((node) => { const value = t(node.dataset.i18n); if (value.includes('<br>')) node.innerHTML = value; else node.textContent = value; }); document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => node.placeholder = t(node.dataset.i18nPlaceholder)); document.querySelectorAll('[data-language]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language))); renderFeatured(); renderProducts(); renderMaterials(); renderReviews(); renderFaqs(); document.getElementById('bundle-list').innerHTML = renderBundles(bundles, language); document.getElementById('bundles-title').textContent = ui(language).rituals; document.querySelector('.site-footer').innerHTML = renderFooter(language); media.refresh(); };
      const renderFeatured = () => { const target = document.getElementById('featured-list'); target.innerHTML = products.filter((p) => p.real).map((product) => { const data = current(product); return `<article class="feature reveal"><div class="feature-image">${productVideo(product, language, 'auto', product.lifestyle)}</div><div class="feature-copy"><p class="eyebrow">${copy[language].featuredReal} · ${data.category}</p><h3>${data.name}<small>${data.sub}</small></h3><p class="feature-description">${data.desc}</p><ul class="benefits">${data.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}</ul><div class="price-line"><span>${renderPrice(product, language)}</span><a href="/product/${product.slug}">${copy[language].featuredButton} ↗</a></div>${renderPurchase(product, language)}</div></article>`; }).join(''); observeReveals(); };
      const renderProducts = () => { const target = document.getElementById('product-track'); target.innerHTML = products.map((product) => { if (product.real) return renderProductCard(product, language); const data = current(product); return `<article class="product-card"><div class="product-card-image">${kikiVideo(asset(product.image), product.video, 'card', data.name)}<span class="product-tag">${product.real ? copy[language].collection.real : copy[language].collection.concept}</span></div><div class="product-body"><span class="kicker">${data.category}</span><h3>${data.name}<small>${data.sub}</small></h3><p>${data.desc}</p><div class="card-foot"><span>${copy[language].collection.placeholder}</span><span>${copy[language].collection.concept}</span></div></div></article>`; }).join(''); updateProgress(); };
      const renderMaterials = () => { document.getElementById('material-grid').innerHTML = materials.map((item, i) => { const data = current(item); return `<article class="material-card reveal"><span class="material-number">0${i + 1} / 03</span><div class="material-media">${kikiVideo(materialMedia[i].poster, materialMedia[i].src, 'auto', data.title)}</div><h3>${data.title}<small>${data.sub}</small></h3><p>${data.copy}</p></article>`; }).join(''); observeReveals(); };
      const renderReviews = () => { document.getElementById('review-grid').innerHTML = reviewMarkup(reviews, language); };
      const renderFaqs = () => { document.getElementById('faq-list').innerHTML = faqs.map((item) => { const data = current(item); return `<details><summary>${data.q}<span aria-label="${copy[language].faqPlus}">+</span></summary><div class="faq-answer">${data.a}</div></details>`; }).join(''); };
      const viewport = document.getElementById('collection-viewport');
      const updateProgress = () => { const max = viewport.scrollWidth - viewport.clientWidth; document.getElementById('collection-progress').style.width = `${max > 0 ? (viewport.scrollLeft / max) * 100 : 0}%`; };
      const moveCollection = (direction) => { viewport.scrollBy({ left: direction * Math.min(viewport.clientWidth * .72, 390), behavior: 'smooth' }); };
      document.getElementById('collection-prev').addEventListener('click', () => moveCollection(-1)); document.getElementById('collection-next').addEventListener('click', () => moveCollection(1)); viewport.addEventListener('scroll', updateProgress, { passive: true });
      viewport.addEventListener('wheel', (event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); viewport.scrollLeft += event.deltaY; } }, { passive: false });
      let dragging = false, dragStart = 0, dragScroll = 0, dragDistance = 0;
      viewport.addEventListener('pointerdown', (event) => { if (event.pointerType === 'touch' || event.target.closest('button, a')) return; dragDistance = 0; dragging = true; dragStart = event.clientX; dragScroll = viewport.scrollLeft; viewport.classList.add('is-dragging'); viewport.setPointerCapture(event.pointerId); });
      viewport.addEventListener('pointermove', (event) => { if (dragging) { dragDistance = Math.abs(event.clientX - dragStart); viewport.scrollLeft = dragScroll - (event.clientX - dragStart); } });
      viewport.addEventListener('click', event => { if (dragDistance > 6 && event.detail > 0) { event.preventDefault(); event.stopPropagation(); } }, true);
      const stopDragging = () => { dragging = false; viewport.classList.remove('is-dragging'); }; viewport.addEventListener('pointerup', stopDragging); viewport.addEventListener('pointercancel', stopDragging); viewport.addEventListener('keydown', (event) => { if (event.key === 'ArrowRight') moveCollection(1); if (event.key === 'ArrowLeft') moveCollection(-1); });
      const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 }) : null;
      const observeReveals = () => document.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => observer ? observer.observe(node) : node.classList.add('is-visible'));
      document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
      document.getElementById('subscribe-form').addEventListener('submit', (event) => { event.preventDefault(); const email = document.getElementById('email'); const message = document.getElementById('form-message'); if (!email.value.trim() || !email.validity.valid) { message.textContent = copy[language].subscribe.error; email.focus(); return; } message.textContent = copy[language].subscribe.success; email.value = ''; });
      const heroImage = document.querySelector('.hero-media .video-media'); let scrollTick = false; window.addEventListener('scroll', () => { if (!scrollTick) { window.requestAnimationFrame(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { scrollTick = false; return; } const amount = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1); heroImage.style.transform = `scale(${1.03 + amount * .055})`; heroImage.style.filter = `brightness(${.6 - amount * .08})`; scrollTick = false; }); scrollTick = true; } }, { passive: true });
      const showPage = () => document.getElementById('preloader').classList.add('is-hidden'); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showPage, { once: true }); else showPage();
      bindReviewPhotos(); setLanguage(language); observeReveals();
    })();
