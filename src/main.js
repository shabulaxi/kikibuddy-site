// Embedded by apply-kikibuddy-video.py; all sources stay lazy until selected.
const kikiWebmSources = {"video/loops/hero-loop.mp4":"video/loops/hero-loop.webm","video/brand-preview.mp4":"video/brand-preview.webm"};
function kikiVideo(poster, src, mode = 'auto', label = '', id = '', rate = 1) {
  const safe = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<div class="video-media" data-mode="${mode}"><video ${id ? `id="${id}"` : ''} muted ${mode === 'film' ? '' : 'loop'} playsinline preload="none" data-poster="${safe(poster)}" data-src="${safe(src)}" data-rate="${rate}" aria-label="${safe(label)}" disablepictureinpicture></video><button type="button" class="video-button" data-video-button aria-pressed="false"><span class="video-button-icon" aria-hidden="true">▶</span><span class="video-button-label">播放影像 / Play</span></button></div>`;
}

function createKikiMedia() {
  const states = new Map();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  let selected = new Set();
  let frame = 0;
  const saver = () => !!connection?.saveData;
  const reduced = () => motion.matches;
  const labels = state => {
    const zh = document.documentElement.lang.startsWith('zh');
    const playing = selected.has(state) && (!state.video.paused || state.pending);
    state.button.setAttribute('aria-pressed', String(playing));
    state.button.querySelector('.video-button-icon').textContent = playing ? 'Ⅱ' : '▶';
    const seconds = state.video.dataset.duration || '75';
    const text = state.mode === 'film' ? (zh ? `播放品牌短片 · ${seconds} 秒` : `Play the film · ${seconds} sec`) : playing ? (zh ? '暂停影像' : 'Pause video') : (zh ? '播放影像' : 'Play video');
    state.button.querySelector('.video-button-label').textContent = text;
    state.button.setAttribute('aria-label', `${text}${state.video.getAttribute('aria-label') ? ' · ' + state.video.getAttribute('aria-label') : ''}`);
  };
  const pause = (state, reset = false) => {
    state.video.pause();
    state.wrapper.classList.remove('is-playing');
    if (reset) {
      try { state.video.currentTime = 0; } catch (_) { /* Metadata may not exist yet. */ }
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; reconcile(); }); };
  const wants = state => {
    if (!state.video.isConnected || document.hidden || reduced() || state.failed || state.ratio < .3 || state.manualPaused || state.blocked) return false;
    if (state.intent) return true;
    if (saver()) return false;
    if (state.mode === 'card') return state.hover;
    return state.mode === 'auto' || (state.mode === 'hero' && !mobile.matches);
  };
  const distance = state => {
    const box = state.wrapper.getBoundingClientRect();
    return Math.hypot(box.left + box.width / 2 - innerWidth / 2, box.top + box.height / 2 - innerHeight / 2);
  };
  const loadPoster = state => {
    if (state.video.poster) return;
    state.video.poster = state.video.dataset.poster;
    state.wrapper.style.backgroundImage = `url("${state.video.poster}")`;
  };
  const load = state => {
    loadPoster(state);
    if (state.video.querySelector('source')) return;
    // Set data-webm only when a real WebM asset is supplied; never probe a missing URL.
    for (const [src, type] of [[state.video.dataset.webm || kikiWebmSources[state.video.dataset.src], 'video/webm'], [state.video.dataset.src, 'video/mp4']]) {
      if (!src) continue;
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      state.video.append(source);
    }
    state.video.load();
  };
  const fail = state => {
    state.failed = true;
    state.wrapper.classList.add('has-error');
    state.wrapper.classList.remove('is-ready');
    state.button.hidden = true;
    pause(state);
    schedule();
  };
  function reconcile() {
    const candidates = [...states.values()].filter(wants).sort((a, b) => distance(a) - distance(b));
    selected = new Set(candidates.slice(0, 2));
    // Pause every loser before starting a winner, including pending play promises.
    for (const state of states.values()) if (!selected.has(state)) pause(state);
    for (const state of selected) {
      if (state.pending || !state.video.paused) continue;
      load(state);
      state.pending = true;
      const promise = state.video.play();
      if (promise) promise.catch(error => {
        if (error.name === 'NotAllowedError') {
          state.blocked = true;
          state.wrapper.classList.add('needs-play');
        } else if (error.name !== 'AbortError') fail(state);
      }).finally(() => { state.pending = false; labels(state); schedule(); });
    }
    for (const state of states.values()) labels(state);
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.get(entry.target.querySelector('video'));
      if (!state) continue;
      state.ratio = entry.intersectionRatio;
      if (state.ratio < .3) {
        if (state.mode === 'card') { state.intent = false; state.hover = false; state.manualPaused = false; }
        pause(state, state.mode === 'card');
      }
    }
    reconcile();
  }, { threshold: [0, .3, 1] }) : null;

  // Poster attributes themselves fetch images, even on hidden videos. Set them
  // only near the viewport, before a video can begin playback.
  const posterObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const state = states.get(entry.target.querySelector('video'));
      if (state) loadPoster(state);
      posterObserver.unobserve(entry.target);
    }
  }, { rootMargin: '300px 0px', threshold: 0 }) : null;

  const register = video => {
    if (states.has(video)) return;
    const wrapper = video.closest('.video-media');
    const button = wrapper.querySelector('[data-video-button]');
    const state = { video, wrapper, button, mode: wrapper.dataset.mode, ratio: 0, intent: false, hover: false, manualPaused: false, failed: false, blocked: false, pending: false };
    states.set(video, state);
    if (state.mode === 'hero') {
      button.classList.add('hero-video-button');
      wrapper.closest('.hero').append(button);
    }
    if (state.mode === 'hero' || !posterObserver) loadPoster(state);
    else posterObserver.observe(wrapper);
    video.muted = true;
    video.defaultMuted = true;
    video.playbackRate = Number(video.dataset.rate || 1);
    button.addEventListener('click', () => {
      if (reduced() || state.failed) return;
      const stop = !video.paused || state.pending || state.intent;
      state.intent = !stop;
      state.manualPaused = stop;
      state.blocked = false;
      wrapper.classList.remove('needs-play');
      if (state.mode === 'film' && !stop) {
        video.controls = true;
        wrapper.closest('.scene-band').classList.add('is-film-started');
      }
      if (stop) pause(state, state.mode === 'card');
      reconcile();
    });
    const interaction = state.mode === 'card' ? wrapper.closest('.product-card') : wrapper;
    let touchStart = null;
    interaction.addEventListener('pointerdown', event => { touchStart = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null; });
    interaction.addEventListener('pointerup', event => {
      if (!touchStart || event.target.closest('button')) return;
      const moved = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
      touchStart = null;
      if (state.mode === 'card' && moved < 10) button.click();
    });
    interaction.addEventListener('pointercancel', () => { touchStart = null; });
    interaction.addEventListener('pointerenter', event => {
      if (state.mode !== 'card' || !hover.matches || event.pointerType === 'touch' || saver()) return;
      state.hover = true;
      state.manualPaused = false;
      reconcile();
    });
    interaction.addEventListener('pointerleave', event => {
      if (state.mode !== 'card' || event.pointerType === 'touch') return;
      state.hover = false;
      state.intent = false;
      state.manualPaused = false;
      pause(state, true);
      reconcile();
    });
    video.addEventListener('playing', () => {
      if (!selected.has(state) || !wants(state)) { pause(state); return; }
      wrapper.classList.add('is-playing', 'is-ready');
      labels(state);
    });
    video.addEventListener('play', () => {
      if (state.mode === 'film') { state.intent = true; state.manualPaused = false; }
      // Native film controls participate in the same two-player budget.
      reconcile();
    });
    video.addEventListener('pause', () => {
      wrapper.classList.remove('is-playing');
      if (state.mode === 'film' && selected.has(state)) { state.intent = false; state.manualPaused = true; }
      labels(state);
    });
    video.addEventListener('ended', () => { state.intent = false; state.manualPaused = true; labels(state); });
    video.addEventListener('waiting', () => wrapper.classList.remove('is-playing'));
    video.addEventListener('error', () => fail(state));
    // An unsupported/missing <source> may fail without a video-level error.
    video.addEventListener('error', event => {
      if (event.target.tagName === 'SOURCE' && event.target.type === 'video/mp4') fail(state);
    }, true);
    observer?.observe(wrapper);
    labels(state);
  };
  const preferences = () => {
    document.documentElement.classList.toggle('is-data-saver', saver());
    document.documentElement.classList.toggle('is-reduced-motion', reduced());
    if (reduced()) {
      for (const state of states.values()) {
        pause(state);
        state.intent = false;
        state.video.controls = false;
        state.wrapper.classList.remove('is-ready');
        state.video.querySelectorAll('source').forEach(source => source.remove());
        if (state.video.currentSrc) state.video.load();
      }
      document.querySelector('.scene-band')?.classList.remove('is-film-started');
    }
    reconcile();
  };
  motion.addEventListener('change', preferences);
  mobile.addEventListener('change', preferences);
  connection?.addEventListener?.('change', preferences);
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.getElementById('collection-viewport').addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pagehide', () => { for (const state of states.values()) pause(state); });
  preferences();
  return {
    refresh() { document.querySelectorAll('.video-media video').forEach(register); preferences(); },
    release(root) {
      for (const [video, state] of states) {
        if (!root.contains(video)) continue;
        selected.delete(state);
        observer?.unobserve(state.wrapper);
        posterObserver?.unobserve(state.wrapper);
        pause(state);
        video.querySelectorAll('source').forEach(source => source.remove());
        if (video.currentSrc) video.load();
        states.delete(video);
      }
    }
  };
}


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
        { real: true, image: 'assets/856a8980624f2309.webp', lifestyle: 'assets/b3fa1ccaa74d4f8e.webp', zh: { name: '爪鼻膏', sub: 'Paw & Nose Balm', category: '护理', desc: '给干燥的爪垫与鼻头，一点温柔的保护。', benefits: ['植物油脂，触感轻盈', '日常可用，易于吸收', '适合需要更多呵护的季节'] }, en: { name: 'Paw & Nose Balm', sub: 'Paw + Nose Care', category: 'CARE', desc: 'A quiet layer of comfort for dry paws and noses.', benefits: ['Plant-based oils, light on touch', 'Made for everyday use', 'A little extra care for changing seasons'] } },
        { real: true, image: 'assets/2efc331f33473519.webp', lifestyle: 'assets/cff05b51e77e8d67.webp', zh: { name: '宠物洗耳液', sub: 'Pet Ear Rinse', category: '洗护', desc: '清洁耳部日常残留，让靠近变得更安心。', benefits: ['温和清洁，不刺激', '帮助维持耳部清爽', '配合稳定的护理习惯'] }, en: { name: 'Pet Ear Rinse', sub: 'Quiet Ear Care', category: 'CARE', desc: 'A gentle rinse for cleaner, calmer everyday ear care.', benefits: ['Cleans without the sting', 'Helps keep ears feeling fresh', 'Designed for a steady routine'] } },
        { real: true, image: 'assets/cb96eb0cbd37fae1.webp', lifestyle: 'assets/22d1c4a7826a943c.webp', zh: { name: '除臭喷雾', sub: 'Odor Remover Spray', category: '清洁', desc: '把生活里的小意外，留在生活里。', benefits: ['酶系配方，针对日常异味', '多种空间使用场景', '轻盈气味，不喧宾夺主'] }, en: { name: 'Odor Remover Spray', sub: 'Enzyme Care', category: 'HOME', desc: 'For the little accidents that belong to everyday life.', benefits: ['Enzyme-based odor care', 'For everyday spaces at home', 'A quiet scent that stays in the background'] } },
        { real: true, image: 'assets/b85b51e4384765d2.webp', lifestyle: 'assets/50cddb8ed12e8e85.webp', zh: { name: '洁牙喷雾', sub: 'Dental Spray', category: '洗护', desc: '从每天的一喷开始，保持口腔清新。', benefits: ['轻松加入日常护理', '减少刷牙之外的负担', '适合建立稳定习惯'] }, en: { name: 'Dental Spray', sub: 'Daily Oral Care', category: 'CARE', desc: 'A simple daily spray for a fresher mouth.', benefits: ['Easy to add to the routine', 'A lighter step beyond brushing', 'Made for consistency'] } },
        { real: true, image: 'assets/2ec345c9bed021e0.webp', lifestyle: 'assets/225ae34505fb914e.webp', zh: { name: '二合一洗护香波', sub: '2-in-1 Shampoo', category: '洗护', desc: '清洁与柔顺，在一次安静的沐浴里完成。', benefits: ['清洁与护理合二为一', '泡沫细腻，冲洗轻松', '让洗澡回到舒服的节奏'] }, en: { name: '2-in-1 Shampoo', sub: 'Clean + Condition', category: 'CARE', desc: 'Cleanse and condition in one calm bath ritual.', benefits: ['Two steps, made into one', 'Fine foam, easy to rinse', 'Brings the bath back to an easy rhythm'] } },
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
      products.forEach((product, i) => product.video = videoPaths[i]);
      const materialMedia = [{"poster": "assets/5e46ecc43a3bf441.webp", "src": "video/loops/paw-balm-closeup-loop.mp4"}, {"poster": "assets/e97331f94250efc9.webp", "src": "video/loops/shampoo-use-loop.mp4"}, {"poster": "assets/be592431c05d4087.webp", "src": "video/loops/family-lineup-loop.mp4"}];
      const materials = [
        { zh: { title: '天然成分', sub: 'PLANT-LED', copy: '从宠物需要的触感出发，选择简单、可理解的成分。' }, en: { title: 'Natural ingredients', sub: 'PLANT-LED', copy: 'We start with the touch pets need, and ingredients you can understand.' } },
        { zh: { title: '温和配方', sub: 'GENTLE FORMULAS', copy: '不追求强烈的即时感，让日常护理可以持续。' }, en: { title: 'Gentle formulas', sub: 'GENTLE FORMULAS', copy: 'No harsh instant feeling. Just care designed to be repeated.' } },
        { zh: { title: '安全可舔舐', sub: 'MADE FOR REAL LIFE', copy: '为真实的生活细节考虑，包括它会舔到的地方。' }, en: { title: 'Made for real life', sub: 'MADE FOR REAL LIFE', copy: 'Thought through for real details, including the places they may lick.' } }
      ];
      const reviews = [
        { zh: { quote: '它终于愿意让我慢慢擦爪子了。现在这几分钟，变成了我们每天的固定时间。', by: '上海 · Momo' }, en: { quote: 'She finally lets me take my time with her paws. Those few minutes became ours.', by: 'Shanghai · Momo' } },
        { zh: { quote: '包装很安静，使用也很直白。没有多余的东西，只有真正用得上的护理。', by: '杭州 · Nori' }, en: { quote: 'The packaging is quiet, and the routine is clear. Nothing extra, just care we use.', by: 'Hangzhou · Nori' } },
        { zh: { quote: '洗澡之后的毛发摸起来很舒服，最重要的是它没有抗拒这个过程。', by: '北京 · Yuki' }, en: { quote: 'His coat feels lovely after a bath, and most importantly, he does not resist it anymore.', by: 'Beijing · Yuki' } }
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
      let language = storage.get() || (navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
      const t = (key) => key.split('.').reduce((obj, part) => obj && obj[part], copy[language]) || key;
      const current = (item) => item[language] || item.en;
      const setLanguage = (next) => { ['featured-list', 'product-track', 'material-grid'].forEach(id => media.release(document.getElementById(id))); language = next === 'en' ? 'en' : 'zh'; storage.set(language); document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'; document.querySelectorAll('[data-i18n]').forEach((node) => { const value = t(node.dataset.i18n); if (value.includes('<br>')) node.innerHTML = value; else node.textContent = value; }); document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => node.placeholder = t(node.dataset.i18nPlaceholder)); document.querySelectorAll('[data-language]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language))); renderFeatured(); renderProducts(); renderMaterials(); renderReviews(); renderFaqs(); media.refresh(); };
      const renderFeatured = () => { const target = document.getElementById('featured-list'); target.innerHTML = products.filter((p) => p.real).map((product) => { const data = current(product); return `<article class="feature reveal"><div class="feature-image">${kikiVideo(asset(product.lifestyle), product.video, 'auto', data.name)}</div><div class="feature-copy"><p class="eyebrow">${copy[language].featuredReal} · ${data.category}</p><h3>${data.name}<small>${data.sub}</small></h3><p class="feature-description">${data.desc}</p><ul class="benefits">${data.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}</ul><div class="price-line"><strong>${copy[language].featuredPrice}</strong><span>${copy[language].featuredButton} ↗</span></div></div></article>`; }).join(''); observeReveals(); };
      const renderProducts = () => { const target = document.getElementById('product-track'); target.innerHTML = products.map((product) => { const data = current(product); return `<article class="product-card"><div class="product-card-image">${kikiVideo(asset(product.image), product.video, 'card', data.name)}<span class="product-tag">${product.real ? copy[language].collection.real : copy[language].collection.concept}</span></div><div class="product-body"><span class="kicker">${data.category}</span><h3>${data.name}<small>${data.sub}</small></h3><p>${data.desc}</p><div class="card-foot"><span>${copy[language].collection.placeholder}</span><span>${copy[language].collection.view} ↗</span></div></div></article>`; }).join(''); updateProgress(); };
      const renderMaterials = () => { document.getElementById('material-grid').innerHTML = materials.map((item, i) => { const data = current(item); return `<article class="material-card reveal"><span class="material-number">0${i + 1} / 03</span><div class="material-media">${kikiVideo(materialMedia[i].poster, materialMedia[i].src, 'auto', data.title)}</div><h3>${data.title}<small>${data.sub}</small></h3><p>${data.copy}</p></article>`; }).join(''); observeReveals(); };
      const renderReviews = () => { document.getElementById('review-grid').innerHTML = reviews.map((item) => { const data = current(item); return `<article class="review reveal"><blockquote>${data.quote}</blockquote><cite>${data.by}</cite></article>`; }).join(''); observeReveals(); };
      const renderFaqs = () => { document.getElementById('faq-list').innerHTML = faqs.map((item) => { const data = current(item); return `<details><summary>${data.q}<span aria-label="${copy[language].faqPlus}">+</span></summary><div class="faq-answer">${data.a}</div></details>`; }).join(''); };
      const viewport = document.getElementById('collection-viewport');
      const updateProgress = () => { const max = viewport.scrollWidth - viewport.clientWidth; document.getElementById('collection-progress').style.width = `${max > 0 ? (viewport.scrollLeft / max) * 100 : 0}%`; };
      const moveCollection = (direction) => { viewport.scrollBy({ left: direction * Math.min(viewport.clientWidth * .72, 390), behavior: 'smooth' }); };
      document.getElementById('collection-prev').addEventListener('click', () => moveCollection(-1)); document.getElementById('collection-next').addEventListener('click', () => moveCollection(1)); viewport.addEventListener('scroll', updateProgress, { passive: true });
      viewport.addEventListener('wheel', (event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); viewport.scrollLeft += event.deltaY; } }, { passive: false });
      let dragging = false, dragStart = 0, dragScroll = 0, dragDistance = 0;
      viewport.addEventListener('pointerdown', (event) => { if (event.pointerType === 'touch' || event.target.closest('button')) return; dragDistance = 0; dragging = true; dragStart = event.clientX; dragScroll = viewport.scrollLeft; viewport.classList.add('is-dragging'); viewport.setPointerCapture(event.pointerId); });
      viewport.addEventListener('pointermove', (event) => { if (dragging) { dragDistance = Math.abs(event.clientX - dragStart); viewport.scrollLeft = dragScroll - (event.clientX - dragStart); } });
      const stopDragging = () => { dragging = false; viewport.classList.remove('is-dragging'); }; viewport.addEventListener('pointerup', stopDragging); viewport.addEventListener('pointercancel', stopDragging); viewport.addEventListener('keydown', (event) => { if (event.key === 'ArrowRight') moveCollection(1); if (event.key === 'ArrowLeft') moveCollection(-1); });
      const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 }) : null;
      const observeReveals = () => document.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => observer ? observer.observe(node) : node.classList.add('is-visible'));
      document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
      document.getElementById('subscribe-form').addEventListener('submit', (event) => { event.preventDefault(); const email = document.getElementById('email'); const message = document.getElementById('form-message'); if (!email.value.trim() || !email.validity.valid) { message.textContent = copy[language].subscribe.error; email.focus(); return; } message.textContent = copy[language].subscribe.success; email.value = ''; });
      const heroImage = document.querySelector('.hero-media .video-media'); let scrollTick = false; window.addEventListener('scroll', () => { if (!scrollTick) { window.requestAnimationFrame(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { scrollTick = false; return; } const amount = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1); heroImage.style.transform = `scale(${1.03 + amount * .055})`; heroImage.style.filter = `brightness(${.6 - amount * .08})`; scrollTick = false; }); scrollTick = true; } }, { passive: true });
      const showPage = () => document.getElementById('preloader').classList.add('is-hidden'); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showPage, { once: true }); else showPage();
      setLanguage(language); observeReveals();
    })();
