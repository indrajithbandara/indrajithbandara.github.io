/* Compact public dashboard projection, reproducible from the authoritative directory. */
export function summarize(data){
  const records=data.records,counts=key=>{const out=new Map();for(const r of records)for(const value of [].concat(r[key]??[]))out.set(value,(out.get(value)||0)+1);return [...out].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])));};
  const years=new Map();for(const r of records){const year=r.issueDate.slice(0,4);years.set(year,(years.get(year)||0)+1);}
  return {total:records.length,publicCredentialCount:data.publicCredentialCount,issuerCount:counts('issuer').length,domainCount:counts('domains').length,transcriptDate:data.transcriptDate,lastSuccessfulSync:data.lastSuccessfulSync,statuses:counts('status'),years:[...years].sort((a,b)=>b[0].localeCompare(a[0])),issuers:counts('issuer').slice(0,7),recent:records.slice().sort((a,b)=>b.issueDate.localeCompare(a.issueDate)).slice(0,5).map(({id,title,issuer,issueDate,status})=>({id,title,issuer,issueDate,status}))};
}
