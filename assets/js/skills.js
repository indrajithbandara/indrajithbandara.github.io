/* Public evidence, not proficiency ratings. Shared homepage and platform view. */
(()=>{
  const definitions=[
    ['Computer Networking','Computer Networking',/\b(networking|network technician|packet tracer|routing|switching)\b/i,'network','Network foundations, routing and switching.'],
    ['Cisco Technologies',null,/\b(cisco|ccna|ccnp|devnet|packet tracer)\b/i,'network','Cisco networking and DevNet learning.'],
    ['Cybersecurity','Cybersecurity',null,'shield','Security foundations, network and API security.'],
    ['Ethical Hacking',null,/\b(ethical hack(?:ing|er)?|penetration testing|pentest(?:ing)?)\b/i,'shield','Security education and authorized testing concepts.'],
    ['Artificial Intelligence','Artificial Intelligence',null,'spark','AI foundations and applied learning.'],
    ['Generative AI','Generative AI',null,'spark','Generative models and responsible AI learning.'],
    ['AI Agents',null,/\b(agentic|ai agents?|autonomous agents?)\b/i,'spark','Agent-oriented AI learning and professional interest.'],
    ['Cloud Computing','Cloud Computing',null,'cloud','Cloud platforms and infrastructure.'],
    ['Software Development','Software Development',null,'code','Programming and development learning, including Python, JavaScript, C and C++.'],
    ['Linux',null,/\blinux\b/i,'code','Linux systems and command-line learning.'],
    ['DevOps','DevOps',null,'cloud','Automation and deployment concepts.'],
    ['Open Source Technologies','Linux and Open Source',/\bopen.source\b/i,'code','Open-source tools and public development.'],
    ['IT Support','IT Support',null,'network','Technical support and troubleshooting.'],
    ['Digital Transformation',null,/\bdigital transformation\b/i,'cloud','Digital transformation and technology enablement.']
  ];
  const paths={network:'M4 5h16v9H4z M8 19h8 M12 14v5 M8 9h8',shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',spark:'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',cloud:'M6 18a4 4 0 1 1 0-8 6 6 0 0 1 11-2 5 5 0 0 1 1 10z',code:'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 4l-4 16'};
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
  function icon(type){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','skill-icon');p.setAttribute('d',paths[type]);svg.append(p);return svg;}
  function link(text,url){const a=el('a',text);a.href=url;return a;}
  const matches=(r,domain,pattern)=>(domain&&r.domains.includes(domain))||(pattern&&pattern.test([r.title,r.issuer,...r.skills].join(' ')));
  async function mount(target){const D=window.PortfolioData;if(!D)return;const cards=el('div',null,'premium-skills-grid');const notice=el('p','Credential counts are overlapping matches from the public transcript, not proficiency scores. Accent lines are decorative.','skills-evidence-note');const fragments=[];for(const [name,domain,pattern,type,desc] of definitions){const d=el('details',null,'premium-skill'),s=el('summary'),heading=el('span',null,'skill-heading'),count=el('span','Evidence loading…','skill-count'),line=el('span',null,'skill-accent-line'),body=el('div',null,'skill-evidence');d.dataset.category=type;heading.append(icon(type),el('span',name));line.setAttribute('aria-hidden','true');s.append(heading,count,line);body.append(el('p',desc),el('p','Loading related records…'));d.append(s,body);cards.append(d);fragments.push({d,count,body,domain,pattern,name,desc});}target.replaceChildren(notice,cards);
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('skill-in-view');observer.unobserve(entry.target);}},{threshold:.15});for(const {d} of fragments)observer.observe(d);}else for(const {d} of fragments)d.classList.add('skill-in-view');
    try{const dataset=await D.credentials();for(const f of fragments){const records=dataset.records.filter(r=>matches(r,f.domain,f.pattern));f.count.textContent=records.length+' related records';let done=false;function draw(){if(done||!f.d.open)return;done=true;f.body.replaceChildren(el('p',f.desc));if(!records.length)f.body.append(el('p','Professional interest; no directly matched transcript record.'));else{const ul=el('ul');for(const r of records.slice(0,5)){const li=el('li');li.append(link(r.title,D.idLink(r.id)));const url=D.safeExternal(r.verificationUrl,['www.credly.com']);if(url){const v=link('Verify',url);v.rel='noopener noreferrer';li.append(document.createTextNode(' · '),v);}ul.append(li);}f.body.append(ul);if(records.length>5){const q=f.domain?'?cd-topic='+encodeURIComponent(f.domain):'?cd-search='+encodeURIComponent(f.name);f.body.append(link('Browse credential directory','index.html'+q+'#badges'));}}if(['Software Development','Open Source Technologies','DevOps','Cybersecurity'].includes(f.name))f.body.append(link('Explore related project case studies','platform.html#projects'));}f.d.addEventListener('toggle',draw);draw();}}catch{for(const f of fragments){f.count.textContent='Evidence unavailable';f.body.replaceChildren(el('p',f.desc),link('Public credential profile','https://www.credly.com/users/indrajithbandara'));}}
  }
  window.PortfolioSkills={mount};document.addEventListener('DOMContentLoaded',()=>{const target=document.querySelector('#premium-skills');if(!target)return;if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();mount(target);}},{rootMargin:'240px'});io.observe(target);}else mount(target);});
})();
