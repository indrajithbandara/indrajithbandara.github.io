/* Progressive enhancement: no hidden content before an observer runs. */
document.addEventListener('DOMContentLoaded',()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const seen=new WeakSet(),running=new Map(),pending=new Set();
  const selector='[data-aos],.hero__content,.section__title,.project-card,.cd-card,.cd-stat,.cd-chart,.stat__num';
  function count(node){
    if(!/^\d+$/.test(node.textContent.trim()))return;
    const value=Number(node.textContent),original=document.createElement('span'),display=document.createElement('span');
    if(!Number.isSafeInteger(value)||value<2)return;
    original.className='motion-count-source';original.textContent=String(value);
    display.className='motion-count-display';display.setAttribute('aria-hidden','true');display.textContent='0';
    node.classList.add('motion-count');node.replaceChildren(original,display);
    let frame,started=performance.now();
    function finish(){cancelAnimationFrame(frame);node.replaceChildren(String(value));node.classList.remove('motion-count');running.delete(node);}
    function tick(now){if(reduce.matches||!node.isConnected){finish();return;}const fraction=Math.min(1,(now-started)/560);display.textContent=String(Math.round(value*(1-(1-fraction)**3)));if(fraction===1)finish();else frame=requestAnimationFrame(tick);}
    running.set(node,finish);frame=requestAnimationFrame(tick);
  }
  const terminal=document.getElementById('terminalBody');let typingStarted=false;
  const typingObserver=terminal&&'IntersectionObserver' in window?new IntersectionObserver(entries=>{
    if(typingStarted||reduce.matches||!entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.4))return;
    typingStarted=true;typingObserver.disconnect();terminal.classList.add('terminal-animate');setTimeout(()=>terminal.classList.remove('terminal-animate'),2200);
  },{threshold:.4}):null;
  if(!reduce.matches&&terminal)typingObserver?.observe(terminal);
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const e of entries){if(!e.isIntersecting)continue;observer.unobserve(e.target);pending.delete(e.target);if(seen.has(e.target))continue;seen.add(e.target);if(reduce.matches||document.hidden)continue;e.target.classList.add('motion-seen','motion-enter');setTimeout(()=>e.target.classList.remove('motion-enter'),650);if(e.target.matches('.stat__num'))count(e.target);else if(e.target.matches('.cd-stat')){const n=e.target.querySelector('strong');if(n)count(n);}}
  },{threshold:.12}):null;
  function observe(scope=document){if(!observer||reduce.matches)return;for(const el of pending)if(!el.isConnected){observer.unobserve(el);pending.delete(el);}for(const el of scope.querySelectorAll(selector))if(!seen.has(el)&&!pending.has(el)){pending.add(el);observer.observe(el);}}
  observe();
  document.addEventListener('portfolio:credentials-render',e=>observe(e.target));
  reduce.addEventListener('change',()=>{if(reduce.matches){observer?.disconnect();typingObserver?.disconnect();pending.clear();for(const stop of [...running.values()])stop();document.querySelectorAll('.motion-enter,.terminal-animate').forEach(el=>el.classList.remove('motion-enter','terminal-animate'));}else{observe();if(!typingStarted&&terminal)typingObserver?.observe(terminal);}});
  if('IntersectionObserver' in window){const links=[...document.querySelectorAll('.nav__link[href^="#"]')],sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);const active=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){for(const a of links){if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}},{rootMargin:'-18% 0px -65% 0px'});sections.forEach(s=>active.observe(s));}
});
