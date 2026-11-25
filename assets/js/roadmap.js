document.addEventListener("DOMContentLoaded", () => {
const grid=document.getElementById("badges-container"), search=document.getElementById("credential-search"), issuer=document.getElementById("credential-issuer"), count=document.getElementById("credential-count");
if(!grid||!search||!issuer||!count)return;
function refresh(){const cards=[...grid.querySelectorAll(".badge-card-pro")];const selected=issuer.value;const names=cards.map(c=>c.querySelector(".badge-card-pro__issuer")?.textContent.trim()||"").filter(Boolean);issuer.replaceChildren(new Option("All issuers",""),...[...new Set(names)].sort().map(n=>new Option(n,n)));issuer.value=selected;let visible=0;for(const card of cards){const name=card.querySelector(".badge-card-pro__issuer")?.textContent.trim()||"";card.hidden=!(card.textContent.toLowerCase().includes(search.value.toLowerCase())&&(!issuer.value||name===issuer.value));if(!card.hidden)visible++;}count.textContent=visible+" of "+cards.length+" listed credentials";}
search.addEventListener("input",refresh);issuer.addEventListener("change",refresh);new MutationObserver(refresh).observe(grid,{childList:true});refresh();
});
document.addEventListener("DOMContentLoaded", async () => {
 const summary=document.getElementById("github-live-summary"), languages=document.getElementById("github-live-languages");
 if(!summary||!languages)return;
 const base="https://api.github.com/users/indrajithbandara";
 const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error("GitHub API unavailable");return r.json();};
 function render(el,title,rows){const h=document.createElement("h3");h.textContent=title;el.replaceChildren(h);for(const [label,value] of rows){const p=document.createElement("p");p.textContent=label+": "+value;el.appendChild(p);}}
 try{const u=await get(base);render(summary,"GitHub profile",[["Public repositories",u.public_repos],["Followers",u.followers],["Following",u.following]]);const followers=document.getElementById('ghFollowers');if(followers&&Number.isFinite(u.followers))followers.textContent=u.followers;}catch(e){summary.textContent="GitHub statistics temporarily unavailable. Visit the profile above.";}
 try{const counts=new Map();let page=1;for(;page<=10;page++){const repos=await get(base+"/repos?per_page=100&page="+page);for(const r of repos){if(!r.fork&&r.language)counts.set(r.language,(counts.get(r.language)||0)+1);}if(repos.length<100)break;}render(languages,"Primary repository languages"+(page>10?" (first 1,000 repositories)":""),[...counts].sort((a,b)=>b[1]-a[1]).slice(0,8));if(!counts.size)languages.append("No language data available.");}catch(e){languages.textContent="Repository language statistics temporarily unavailable.";}
});
