/* Fluid Spatial Motion + Kinetic Editorial Typography + Spatial Scroll Navigator + Zen Reading Mode */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.PortfolioPreferences?.motionQuery || matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const seen = new WeakSet();
  const running = new Map();
  const pending = new Set();

  const original = '[data-aos],.hero__content,.hero__terminal,.section__title,.project-card,.cd-card,.cd-stat,.cd-chart,.stat__num,.bento-card';
  const selector = original + ',.section > .container > .eyebrow,.section__lede,.section > .container > p,.platform-view > h2,.platform-view > .platform-note,.platform-card,.platform-row,.article-card,.blog-card,.ghstats__grid > *,.rec-card,.cert-card,.teaching-card,.achieve-card,.timeline__item';
  const signature = '#skills,#experience,#education,#projects,#achievements,#recommendations,.platform-view';

  function count(node) {
    if (!/^\d+$/.test(node.textContent.trim())) return;
    const value = Number(node.textContent);
    if (!Number.isSafeInteger(value) || value < 2) return;
    const source = document.createElement('span');
    const display = document.createElement('span');
    source.className = 'motion-count-source';
    source.textContent = String(value);
    display.className = 'motion-count-display';
    display.setAttribute('aria-hidden', 'true');
    display.textContent = '0';
    node.classList.add('motion-count');
    node.replaceChildren(source, display);
    let frame;
    const started = performance.now();
    function finish() {
      cancelAnimationFrame(frame);
      node.replaceChildren(String(value));
      node.classList.remove('motion-count');
      running.delete(node);
    }
    function tick(now) {
      if (reduce.matches || !node.isConnected) {
        finish();
        return;
      }
      const fraction = Math.min(1, (now - started) / 620);
      const eased = 1 - (1 - fraction) ** 4;
      display.textContent = String(Math.round(value * eased));
      if (fraction === 1) finish();
      else frame = requestAnimationFrame(tick);
    }
    running.set(node, finish);
    frame = requestAnimationFrame(tick);
  }

  /* Kinetic Editorial Typography: accessible word-flow splitting for short display headings. */
  function initKineticHeadings() {
    if (reduce.matches) return;
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && !heroTitle.dataset.ktReady) {
      heroTitle.dataset.ktReady = '1';
      const fullText = heroTitle.textContent.replace(/\s+/g, ' ').trim();
      if (fullText) heroTitle.setAttribute('aria-label', fullText);
      let wordIdx = 0;
      const walk = node => {
        for (const child of [...node.childNodes]) {
          if (child.nodeType === 3) {
            const parts = child.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            for (const part of parts) {
              if (!part) continue;
              if (/^\s+$/.test(part)) {
                frag.append(document.createTextNode(part));
              } else {
                const span = document.createElement('span');
                span.className = 'kt-word';
                span.setAttribute('aria-hidden', 'true');
                span.style.setProperty('--kt-i', String(wordIdx++));
                span.textContent = part;
                frag.append(span);
              }
            }
            child.replaceWith(frag);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') {
            walk(child);
          }
        }
      };
      walk(heroTitle);
      heroTitle.classList.add('kt-hero-ready');
    }
  }
  initKineticHeadings();

  /* Spatial hero command surface entrance (no repetitive typewriter). */
  const terminal = document.getElementById('terminalBody');
  let heroEntered = false;
  const heroObserver = terminal && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        if (heroEntered || reduce.matches || !entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.25)) return;
        heroEntered = true;
        heroObserver.disconnect();
        terminal.classList.add('spatial-terminal-enter');
        setTimeout(() => terminal.classList.remove('spatial-terminal-enter'), 700);
      }, { threshold: 0.25 })
    : null;
  if (!reduce.matches && terminal) heroObserver?.observe(terminal);

  /* Main spatial & kinetic reveal observer. */
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          observer.unobserve(e.target);
          pending.delete(e.target);
          if (seen.has(e.target)) continue;
          seen.add(e.target);
          if (reduce.matches || document.hidden) continue;
          const el = e.target;
          el.classList.add('motion-seen');
          if (el.matches(signature)) {
            el.classList.add('cinematic-signature-seen');
            continue;
          }
          if (scrollY < 16 && el.matches(original)) continue;
          if (el.closest('.premium-skill')) continue;
          el.classList.add('motion-enter');
          setTimeout(() => el.classList.remove('motion-enter'), 780);
          if (el.matches('.stat__num')) count(el);
          else if (el.matches('.cd-stat')) {
            const n = el.querySelector('strong');
            if (n) count(n);
          }
        }
      }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' })
    : null;

  function observe(scope = document) {
    if (!observer || reduce.matches) return;
    for (const el of pending) {
      if (!el.isConnected) {
        observer.unobserve(el);
        pending.delete(el);
      }
    }
    const targets = [
      ...(scope.matches?.(selector + ',' + signature) ? [scope] : []),
      ...scope.querySelectorAll(selector + ',' + signature)
    ];
    for (const el of targets) {
      if (!seen.has(el) && !pending.has(el)) {
        pending.add(el);
        observer.observe(el);
      }
    }
  }
  observe();
  document.addEventListener('portfolio:credentials-render', e => observe(e.target));

  if ('MutationObserver' in window) {
    const dynamic = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) observe(node);
        }
      }
    });
    for (const root of document.querySelectorAll('#platform-view,#blog,#github-stats')) {
      dynamic.observe(root, { childList: true, subtree: true });
    }
  }

  /* Desktop-only pointer-tracked spatial surface spotlight. */
  let activeCard = null;
  let pointerRaf = 0;
  let lastPointer = null;
  function applySpotlight() {
    pointerRaf = 0;
    if (!lastPointer || reduce.matches || !finePointer.matches) return;
    const card = lastPointer.target?.closest?.('.project-card,.platform-card,.rec-card,.premium-skill,.cert-card,.blog-card,.bento-card');
    if (activeCard && activeCard !== card) {
      activeCard.style.removeProperty('--mx');
      activeCard.style.removeProperty('--my');
    }
    activeCard = card || null;
    if (!activeCard) return;
    const rect = activeCard.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((lastPointer.clientX - rect.left) / rect.width) * 100;
    const y = ((lastPointer.clientY - rect.top) / rect.height) * 100;
    activeCard.style.setProperty('--mx', x.toFixed(1) + '%');
    activeCard.style.setProperty('--my', y.toFixed(1) + '%');
  }
  if (finePointer.matches) {
    document.addEventListener('pointermove', e => {
      if (reduce.matches) return;
      lastPointer = e;
      if (!pointerRaf) pointerRaf = requestAnimationFrame(applySpotlight);
    }, { passive: true });
  }

  /* Spatial Scroll Navigator (integrated with native scrolling & reading progress). */
  const trackedSections = [...document.querySelectorAll('main section[id], .hero[id]')];
  let spatialNav = null;
  let spatialLabel = null;
  let spatialFill = null;
  if (trackedSections.length >= 4 && !document.querySelector('.platform-shell')) {
    spatialNav = document.createElement('nav');
    spatialNav.className = 'spatial-scroll-nav';
    spatialNav.setAttribute('aria-label', 'Section navigator');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'spatial-scroll-nav__toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const dot = document.createElement('span');
    dot.className = 'spatial-scroll-nav__dot';
    dot.setAttribute('aria-hidden', 'true');
    spatialLabel = document.createElement('span');
    spatialLabel.className = 'spatial-scroll-nav__label';
    spatialLabel.textContent = 'Overview';
    const track = document.createElement('span');
    track.className = 'spatial-scroll-nav__track';
    track.setAttribute('aria-hidden', 'true');
    spatialFill = document.createElement('span');
    spatialFill.className = 'spatial-scroll-nav__fill';
    track.append(spatialFill);
    toggle.append(dot, spatialLabel, track);

    const list = document.createElement('ul');
    list.className = 'spatial-scroll-nav__list';
    const quickIds = ['home', 'overview', 'skills', 'badges', 'projects', 'recommendations', 'contact'];
    for (const id of quickIds) {
      const sec = document.getElementById(id);
      if (!sec) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + id;
      const h = sec.querySelector('h1,h2');
      a.textContent = id === 'home' ? 'Top' : (h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 26) : id);
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        list.classList.remove('is-open');
      });
      li.append(a);
      list.append(li);
    }
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('is-open', !open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && list.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        list.classList.remove('is-open');
        toggle.focus();
      }
    });
    spatialNav.append(list, toggle);
    document.body.append(spatialNav);
  }

  /* Passive scroll progress custom property + Spatial Scroll Navigator update. */
  let scrollRaf = 0;
  function updateScrollProgress() {
    scrollRaf = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    if (!reduce.matches) {
      document.documentElement.style.setProperty('--scroll-p', p.toFixed(4));
    }
    if (spatialNav && spatialFill) {
      spatialFill.style.transform = `scaleX(${p.toFixed(3)})`;
      spatialNav.classList.toggle('is-visible', scrollY > 180);
    }
  }
  window.addEventListener('scroll', () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollProgress);
  }, { passive: true });
  updateScrollProgress();

  /* Zen Reading Mode (for recommendations, articles, case studies & long descriptions). */
  const zenSupported = Boolean(document.querySelector('.recommendations-page, .platform-shell, #blog, #recommendations'));
  if (zenSupported) {
    const ZEN_KEY = 'portfolio_zen_reading';
    const SCALE_KEY = 'portfolio_zen_scale';
    let scale = Number(localStorage.getItem(SCALE_KEY) || '1');
    if (![1, 1.1, 1.2].includes(scale)) scale = 1;

    const bar = document.createElement('div');
    bar.className = 'zen-toolbar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Zen Reading Mode controls');

    const dec = document.createElement('button');
    dec.type = 'button';
    dec.className = 'zen-btn';
    dec.textContent = 'A-';
    dec.setAttribute('aria-label', 'Decrease reading font size');

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.className = 'zen-btn';
    inc.textContent = 'A+';
    inc.setAttribute('aria-label', 'Increase reading font size');

    const exit = document.createElement('button');
    exit.type = 'button';
    exit.className = 'zen-btn zen-btn--exit';
    exit.textContent = 'Exit Zen';
    exit.setAttribute('aria-label', 'Exit Zen Reading Mode');

    bar.append(dec, inc, exit);
    document.body.append(bar);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'zen-toggle';
    trigger.textContent = 'Zen Read';
    trigger.setAttribute('aria-pressed', 'false');

    const mountTarget = document.querySelector('.rec-controls') || document.querySelector('.platform-header-actions') || document.querySelector('#recommendations .section__head');
    if (mountTarget) mountTarget.append(trigger);

    function setZen(active, focusExit = false) {
      document.documentElement.dataset.zen = active ? 'true' : 'false';
      document.documentElement.style.setProperty('--zen-scale', String(scale));
      trigger.setAttribute('aria-pressed', String(active));
      trigger.textContent = active ? 'Zen Active' : 'Zen Read';
      try { localStorage.setItem(ZEN_KEY, active ? '1' : '0'); } catch {}
      if (active && focusExit) exit.focus();
    }

    function stepScale(delta) {
      const steps = [1, 1.1, 1.2];
      const idx = Math.max(0, Math.min(steps.length - 1, steps.indexOf(scale) + delta));
      scale = steps[idx];
      document.documentElement.style.setProperty('--zen-scale', String(scale));
      try { localStorage.setItem(SCALE_KEY, String(scale)); } catch {}
    }

    trigger.addEventListener('click', () => setZen(document.documentElement.dataset.zen !== 'true', true));
    exit.addEventListener('click', () => { setZen(false); trigger.focus(); });
    dec.addEventListener('click', () => stepScale(-1));
    inc.addEventListener('click', () => stepScale(1));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.documentElement.dataset.zen === 'true') {
        setZen(false);
        trigger.focus();
      }
    });
    try {
      if (localStorage.getItem(ZEN_KEY) === '1') setZen(true);
    } catch {}
  }

  /* Fluid recommendation filter/sort transition without layout shift. */
  const recArchive = document.getElementById('rec-archive');
  const recSearch = document.getElementById('rec-search');
  const recSort = document.getElementById('rec-sort');
  function pulseRecommendations() {
    if (!recArchive || reduce.matches) return;
    recArchive.classList.remove('rec-archive--reflow');
    void recArchive.offsetWidth;
    recArchive.classList.add('rec-archive--reflow');
    setTimeout(() => recArchive.classList.remove('rec-archive--reflow'), 360);
  }
  recSearch?.addEventListener('input', pulseRecommendations);
  recSort?.addEventListener('change', pulseRecommendations);

  /* Reduced-motion live toggle handling. */
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      observer?.disconnect();
      heroObserver?.disconnect();
      pending.clear();
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      for (const stop of [...running.values()]) stop();
      document.querySelectorAll('.motion-enter,.spatial-terminal-enter,.rec-archive--reflow').forEach(el => {
        el.classList.remove('motion-enter', 'spatial-terminal-enter', 'rec-archive--reflow');
      });
      if (activeCard) {
        activeCard.style.removeProperty('--mx');
        activeCard.style.removeProperty('--my');
        activeCard = null;
      }
    } else {
      observe();
    }
  });

  /* Active section indicator in navigation & Spatial Scroll Navigator. */
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
    const sections = trackedSections.length ? trackedSections : links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const active = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          for (const a of links) {
            if (a.hash === '#' + e.target.id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          }
          if (spatialLabel) {
            const h = e.target.querySelector('h1,h2');
            spatialLabel.textContent = e.target.id === 'home' ? 'Hero' : (h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) : e.target.id);
          }
        }
      }
    }, { rootMargin: '-18% 0px -65% 0px' });
    sections.forEach(s => active.observe(s));
  }
});
