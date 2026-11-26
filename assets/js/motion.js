/* Quiet Precision Motion System + Restored Original Terminal Typing + Kinetic Editorial Typography */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.PortfolioPreferences?.motionQuery || matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const pending = new Set();

  /* Only major display headings, signature hairlines, and key cards animate once on reveal; no ordinary paragraphs or full-section shifts. */
  const original = '[data-aos],.hero__content,.section__title,.cd-card,.cd-stat';
  const selector = original + ',.platform-view > h2,.bento-card,.project-card,.rec-card';
  const signature = '#skills,#experience,#education,#projects,#achievements,#recommendations,.platform-view';

  /* Restored Original Terminal Typing Experience (from pre-PR #15 main) */
  const terminal = document.getElementById('terminalBody');
  let typingStarted = false;
  let stopTyping = () => {};

  function typeTerminal() {
    const sequence = [['typedName', 0, 720], ['typedRole', 850, 1050]].map(([id, delay, duration]) => {
      const source = document.getElementById(id)?.querySelector('span');
      if (!source) return null;
      const visual = document.createElement('span');
      visual.className = 'terminal-typed';
      visual.setAttribute('aria-hidden', 'true');
      source.classList.add('terminal-source');
      source.after(visual);
      return { source, visual, text: source.textContent, delay, duration, last: -1 };
    }).filter(Boolean);
    if (!sequence.length || !terminal) return;
    terminal.classList.add('terminal-animate');
    let frame;
    const start = performance.now();
    stopTyping = () => {
      cancelAnimationFrame(frame);
      for (const { source, visual } of sequence) {
        source.classList.remove('terminal-source');
        visual.remove();
      }
      terminal.classList.remove('terminal-animate');
    };
    function tick(now) {
      const elapsed = now - start;
      if (reduce.matches || elapsed >= 3200 || !terminal.isConnected) {
        stopTyping();
        return;
      }
      for (const item of sequence) {
        const n = Math.floor(item.text.length * Math.max(0, Math.min(1, (elapsed - item.delay) / item.duration)));
        if (n !== item.last) {
          item.visual.textContent = item.text.slice(0, n);
          item.last = n;
        }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    setTimeout(stopTyping, 3300);
  }

  const typingObserver = terminal && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        if (typingStarted || reduce.matches || !entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.4)) return;
        typingStarted = true;
        typingObserver.disconnect();
        typeTerminal();
      }, { threshold: 0.4 })
    : null;
  if (!reduce.matches && terminal) typingObserver?.observe(terminal);

  /* Kinetic Editorial Typography: accessible letter & word flow on short hero display heading only. */
  function initKineticHeadings() {
    if (reduce.matches) return;
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && !heroTitle.dataset.ktReady) {
      heroTitle.dataset.ktReady = '1';
      const fullText = heroTitle.textContent.replace(/\s+/g, ' ').trim();
      if (fullText) heroTitle.setAttribute('aria-label', fullText);
      let charIdx = 0;
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
              } else if (wordIdx === 0 && part.length <= 14) {
                const wordWrap = document.createElement('span');
                wordWrap.className = 'kt-word-group';
                wordWrap.setAttribute('aria-hidden', 'true');
                for (const ch of part) {
                  const cs = document.createElement('span');
                  cs.className = 'kt-char';
                  cs.style.setProperty('--kt-c', String(charIdx++));
                  cs.textContent = ch;
                  wordWrap.append(cs);
                }
                wordIdx++;
                frag.append(wordWrap);
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

  /* Quiet Precision once-only reveal observer. */
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
          setTimeout(() => el.classList.remove('motion-enter'), 700);
        }
      }, { threshold: 0.12 })
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

  let scrollRaf = 0;
  function updateScrollProgress() {
    scrollRaf = 0;
    if (!spatialNav || !spatialFill) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    spatialFill.style.transform = `scaleX(${p.toFixed(3)})`;
    spatialNav.classList.toggle('is-visible', scrollY > 180);
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

  /* Reduced-motion live toggle handling. */
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      observer?.disconnect();
      typingObserver?.disconnect();
      pending.clear();
      stopTyping();
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      document.querySelectorAll('.motion-enter,.terminal-animate').forEach(el => {
        el.classList.remove('motion-enter', 'terminal-animate');
      });
    } else {
      observe();
      if (!typingStarted && terminal) typingObserver?.observe(terminal);
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
