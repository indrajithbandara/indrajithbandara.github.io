/* Local presentation preferences. Runs before styles to prevent a theme flash. */
(()=>{
  const root=document.documentElement,systemTheme=matchMedia('(prefers-color-scheme: light)'),systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const read=(key,allowed,fallback)=>{try{const v=localStorage.getItem(key);return allowed.includes(v)?v:fallback;}catch{return fallback;}};
  let theme=read('ib-theme',['dark','light','system'],'dark'),motion=read('ib-motion',['system','full','reduce'],'system');
  const effectiveTheme=()=>theme==='system'?(systemTheme.matches?'light':'dark'):theme;
  const reduced=()=>motion==='reduce'||(motion==='system'&&systemMotion.matches);
  function apply(){if(effectiveTheme()==='light')root.dataset.theme='light';else delete root.dataset.theme;root.dataset.motion=reduced()?'reduce':'full';root.dataset.themePreference=theme;root.dataset.motionPreference=motion;window.dispatchEvent(new Event('portfolio:preferences'));}
  function save(key,value){try{localStorage.setItem(key,value);}catch{}}
  window.PortfolioPreferences={get theme(){return theme;},get motion(){return motion;},get reduced(){return reduced();},get effectiveTheme(){return effectiveTheme();},setTheme(v){if(!['dark','light','system'].includes(v))return;theme=v;save('ib-theme',v);apply();},setMotion(v){if(!['system','full','reduce'].includes(v))return;motion=v;save('ib-motion',v);apply();},motionQuery:{get matches(){return reduced();},addEventListener(type,listener){if(type==='change')window.addEventListener('portfolio:preferences',listener);}}};
  systemTheme.addEventListener('change',apply);systemMotion.addEventListener('change',apply);apply();
})();
