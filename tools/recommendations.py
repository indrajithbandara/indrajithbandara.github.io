"""Private CSV import and fail-closed static publication; Python standard library only."""
import argparse, csv, hashlib, html, json, re
from datetime import datetime
from pathlib import Path

FIELDS = ['First Name', 'Last Name', 'Company', 'Job Title', 'Text', 'Creation Date', 'Status']
PROFILE = 'https://www.linkedin.com/in/indrajithbandara/'

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()

def read_source(path):
    with path.open(encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle, strict=True)
        if reader.fieldnames != FIELDS:
            raise ValueError('Unexpected LinkedIn CSV schema')
        records, ids = [], set()
        for row in reader:
            if None in row or any(v is None for v in row.values()):
                raise ValueError('Malformed CSV row')
            if not row['First Name'].strip() or not row['Text'].strip():
                raise ValueError('Missing name or recommendation text')
            date = datetime.strptime(row['Creation Date'], '%m/%d/%y, %I:%M %p')
            if row['Status'] not in ('VISIBLE', 'HIDDEN'):
                raise ValueError('Unknown source status')
            identifier = digest([row['First Name'], row['Last Name'], row['Creation Date']])[:24]
            if identifier in ids:
                raise ValueError('Duplicate or ambiguous recommendation identity')
            ids.add(identifier)
            records.append({'id':identifier,'firstName':row['First Name'],'lastName':row['Last Name'],'company':row['Company'],'jobTitle':row['Job Title'],'text':row['Text'],'date':date.date().isoformat(),'sourceStatus':row['Status'],'fingerprint':digest(row),'profileUrl':None})
        return records

def review(records, previous):
    result = []
    for r in records:
        old = previous.get(r['id'], {})
        unchanged = old.get('fingerprint') == r['fingerprint']
        approved = unchanged and old.get('publicationApproval') == 'approved' and isinstance(old.get('basis'),str) and bool(old['basis'].strip()) and r['sourceStatus']=='VISIBLE'
        result.append({**r,'publicationApproval':'approved' if approved else 'pending','basis':old['basis'] if approved else '', 'featured':bool(approved and old.get('featured') is True)})
    return result

def esc(value):
    return html.escape(str(value), quote=True)

def card(r, featured=False):
    name = (r['firstName']+' '+r['lastName']).strip()
    initials = ''.join(v[0] for v in (r['firstName'].strip(),r['lastName'].strip()) if v)[:2].upper()
    meta = ' · '.join(v for v in (r['jobTitle'],r['company']) if v.strip())
    text = r['text']; long = len(text)>240
    excerpt = text[:240]+'…' if long else text
    quote = f'<blockquote class="rec-quote">{esc(text)}</blockquote>'
    if long:
        quote = f'<details class="rec-details"><summary>Read full recommendation</summary>{quote}</details>'
        quote = f'<blockquote class="rec-excerpt">{esc(excerpt)} <span class="rec-label">(excerpt)</span></blockquote>'+quote
    return f'<article class="rec-card" data-date="{esc(r["date"])}" data-rec-id="{esc(r["id"])}"><header class="rec-person"><span class="rec-avatar" aria-hidden="true">{esc(initials)}</span><div><h3>{esc(name)}</h3>{f"<p>{esc(meta)}</p>" if meta else ""}</div></header>{quote}<footer class="rec-meta"><time datetime="{esc(r["date"])}">{esc(r["date"])}</time><span>LinkedIn export · recorded at time of recommendation</span></footer></article>'

def blocks(records):
    approved = sorted((r for r in records if r['publicationApproval']=='approved'),key=lambda r:r['date'],reverse=True)
    featured = [r for r in approved if r['featured']][:6]
    def content(items):
        return ''.join(card(r) for r in items) or '<p class="rec-empty">No recommendations have been approved for republication yet. The original LinkedIn profile remains available.</p>'
    featured_html=content(featured) if featured or not approved else '<p class="rec-empty">No featured recommendations have been selected. Explore the approved archive.</p>'
    return {'summary':f'<strong>{len(approved)}</strong> published · {len(records)} source records', 'archive':content(approved),'featured':featured_html,'approved_count':len(approved),'featured_count':len(featured)}

def replace_region(path, key, value):
    source=path.read_text(encoding='utf-8')
    start,end=f'<!-- REC:{key}:START -->',f'<!-- REC:{key}:END -->'
    if source.count(start)!=1 or source.count(end)!=1:
        raise ValueError('Invalid generated region')
    a,b=source.index(start)+len(start),source.index(end)
    if b<a: raise ValueError('Invalid generated region order')
    path.write_text(source[:a]+value+source[b:],encoding='utf-8')

def main():
    p=argparse.ArgumentParser();p.add_argument('csv',type=Path);p.add_argument('--private-dir',type=Path,required=True);p.add_argument('--ledger',type=Path);p.add_argument('--publish',action='store_true');p.add_argument('--repo',type=Path,default=Path.cwd());a=p.parse_args()
    repo=a.repo.resolve(); private=a.private_dir.resolve()
    if private==repo or repo in private.parents or repo in a.csv.resolve().parents or (a.ledger and repo in a.ledger.resolve().parents):
        raise ValueError('Private source, review and ledger must remain outside repository')
    records=read_source(a.csv); previous={}
    if a.ledger:
        previous={r['id']:r for r in json.loads(a.ledger.read_text(encoding='utf-8'))['records']}
    reviewed=review(records,previous); private.mkdir(parents=True,exist_ok=True)
    ledger={'records':[{'id':r['id'],'fingerprint':r['fingerprint'],'name':(r['firstName']+' '+r['lastName']).strip(),'date':r['date'],'publicationApproval':r['publicationApproval'],'basis':r['basis'],'featured':r['featured']} for r in reviewed]}
    (private/'recommendation-approval-ledger.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    private_cards=''.join(f'<section><p class="rec-label">Review ID: {esc(r["id"])} · {esc(r["publicationApproval"])}</p>{card(r)}</section>' for r in reviewed)
    css=(repo/'assets/css/recommendations.css').read_text(encoding='utf-8')
    (private/'recommendations-private-preview.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private recommendation review</title><style>:root{{--bg:#0a0d0c;--surface:#121615;--border-strong:#34423c;--text:#edf2f0;--text-dim:#acb9b3;--accent:#00e08f;--font-mono:monospace}}body{{background:var(--bg);color:var(--text);font:16px/1.6 system-ui;max-width:1200px;margin:auto;padding:24px}}{css}</style><h1>Voices of My Professional Network — private review</h1><p>Not for publication. Review each recommendation and record its republication basis in the private ledger. VISIBLE does not establish permission.</p><div class="rec-grid">{private_cards}</div></html>',encoding='utf-8')
    out=blocks(reviewed)
    if a.publish:
        replace_region(repo/'index.html','featured',out['featured']);replace_region(repo/'index.html','summary',out['summary']);replace_region(repo/'recommendations/index.html','archive',out['archive']);replace_region(repo/'recommendations/index.html','summary',out['summary']);replace_region(repo/'recommendations/index.html','results',f"{out['approved_count']} of {out['approved_count']} published recommendations")
    print(json.dumps({'records':len(records),'visible':sum(r['sourceStatus']=='VISIBLE' for r in records),'hidden':sum(r['sourceStatus']=='HIDDEN' for r in records),'texts':sum(bool(r['text'].strip()) for r in records),'company':sum(bool(r['company'].strip()) for r in records),'title':sum(bool(r['jobTitle'].strip()) for r in records),'dateRange':[min(r['date'] for r in records),max(r['date'] for r in records)],'approved':out['approved_count'],'featured':out['featured_count'],'new':sum(r['id'] not in previous for r in records),'changed':sum(r['id'] in previous and previous[r['id']].get('fingerprint')!=r['fingerprint'] for r in records),'removed':len(set(previous)-{r['id'] for r in records})}))

if __name__=='__main__': main()
