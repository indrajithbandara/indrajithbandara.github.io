/* Static approved content remains readable without JS. Only client-side filtering. */
document.addEventListener('DOMContentLoaded',()=>{
  const archive=document.getElementById('rec-archive');if(!archive)return;
  const cards=[...archive.querySelectorAll('.rec-card')],search=document.getElementById('rec-search'),sort=document.getElementById('rec-sort'),status=document.getElementById('rec-results'),empty=document.getElementById('rec-no-results');
  const normalize=value=>value.normalize('NFKC').toLocaleLowerCase();const hay=new Map(cards.map(card=>[card,normalize(card.textContent)]));
  search.disabled=false;sort.disabled=false;
  let order='newest';function render(){const terms=normalize(search.value).trim().split(/\s+/).filter(Boolean),dir=sort.value==='oldest'?1:-1;let count=0;for(const card of cards){card.hidden=!terms.every(t=>hay.get(card).includes(t));if(!card.hidden)count++;}if(order!==sort.value){const fragment=document.createDocumentFragment();for(const card of [...cards].sort((a,b)=>dir*a.dataset.date.localeCompare(b.dataset.date)))fragment.append(card);archive.append(fragment);order=sort.value;}empty.hidden=!cards.length||count>0;status.textContent=`${count} of ${cards.length} published recommendations`;}
  search.addEventListener('input',render);sort.addEventListener('change',render);render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js').catch(()=>{});
});
