/* Portfolio shell: accessible navigation, local theme, and email handoff. */
document.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id),root=document.documentElement;
  const year=$('year');if(year)year.textContent=new Date().getFullYear();
  const nav=$('nav'),toggle=$('navToggle'),links=$('navLinks'),top=$('backToTop');
  function closeNav(){links?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}
  if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('is-open')){closeNav();toggle.focus();}});}
  function scroll(){nav?.classList.toggle('is-scrolled',scrollY>12);top?.classList.toggle('is-visible',scrollY>480);}
  let queued=false;scroll();window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{scroll();queued=false;});}},{passive:true});top?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  const theme=$('themeToggle');
  function applyTheme(light){if(light)root.setAttribute('data-theme','light');else root.removeAttribute('data-theme');theme?.setAttribute('aria-pressed',String(light));}
  let saved=null;try{saved=localStorage.getItem('ib-theme');}catch{}applyTheme(saved==='light');
  theme?.addEventListener('click',()=>{const light=root.getAttribute('data-theme')!=='light';applyTheme(light);try{localStorage.setItem('ib-theme',light?'light':'dark');}catch{}});
  const form=$('contactForm'),note=$('formNote');if(form&&note)form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;note.textContent='Your email app will open. Send the message there to complete delivery.';const subject=encodeURIComponent('Portfolio inquiry from '+form.elements.name.value),body=encodeURIComponent(form.elements.message.value+'\n\nReply email: '+form.elements.email.value);location.href='mailto:indrajithbandarasl@gmail.com?subject='+subject+'&body='+body;});
});
