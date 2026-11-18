// Embedded by apply-kikibuddy-video.py; all sources stay lazy until selected.
const kikiWebmSources = {"video/loops/hero-loop.mp4":"video/loops/hero-loop.webm","video/brand-preview.mp4":"video/brand-preview.webm"};
function kikiVideo(poster, src, mode = 'auto', label = '', id = '', rate = 1, webm = null) {
  const safe = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<div class="video-media" data-mode="${mode}"><video ${id ? `id="${id}"` : ''} muted ${mode === 'film' ? '' : 'loop'} playsinline preload="none" data-poster="${safe(poster)}" data-src="${safe(src)}" ${webm ? `data-webm="${safe(webm)}"` : ''} data-rate="${rate}" aria-label="${safe(label)}" disablepictureinpicture></video><button type="button" class="video-button" data-video-button aria-pressed="false"><span class="video-button-icon" aria-hidden="true">▶</span><span class="video-button-label">播放影像 / Play</span></button></div>`;
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
    if (!state.video.poster) state.video.poster = state.video.dataset.poster;
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
  document.getElementById('collection-viewport')?.addEventListener('scroll', schedule, { passive: true });
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


