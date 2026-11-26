/* Fluid Spatial Motion Experience — progressive enhancement, GPU-composited, reduced-motion safe. */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.PortfolioPreferences?.motionQuery || matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const seen = new WeakSet();
  const running = new Map();
  const pending = new Set();

  const original = '[data-aos],.hero__content,.hero__terminal,.section__title,.project-card,.cd-card,.cd-stat,.cd-chart,.stat__num';
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

  /* Spatial hero command surface entrance (replaces legacy typewriter effect). */
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

  /* Main spatial reveal observer. */
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
          setTimeout(() => el.classList.remove('motion-enter'), 760);
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
    const card = lastPointer.target?.closest?.('.project-card,.platform-card,.rec-card,.premium-skill,.cert-card,.blog-card');
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

  /* Passive scroll progress custom property for spatial ambient coordination. */
  let scrollRaf = 0;
  function updateScrollProgress() {
    scrollRaf = 0;
    if (reduce.matches) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, scrollY / max));
    document.documentElement.style.setProperty('--scroll-p', p.toFixed(4));
  }
  window.addEventListener('scroll', () => {
    if (reduce.matches || scrollRaf) return;
    scrollRaf = requestAnimationFrame(updateScrollProgress);
  }, { passive: true });

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

  /* Active section indicator in navigation. */
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
    const sections = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const active = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          for (const a of links) {
            if (a.hash === '#' + e.target.id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          }
        }
      }
    }, { rootMargin: '-18% 0px -65% 0px' });
    sections.forEach(s => active.observe(s));
  }
});
