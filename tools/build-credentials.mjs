import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { summarize } from './dashboard-summary.mjs';

const source = JSON.parse(readFileSync('credentials.json', 'utf8'));
const badges = JSON.parse(readFileSync('badges.json', 'utf8'));
const metadata = JSON.parse(readFileSync('credential-descriptions.json','utf8'));
if(metadata.length!==source.length)throw Error('Incomplete transcript metadata');
const snapshot = existsSync('credly-public-snapshot.json') ? JSON.parse(readFileSync('credly-public-snapshot.json','utf8')) : null;
if(snapshot&&(!Array.isArray(snapshot.records)||snapshot.records.length<275||new Set(snapshot.records.map(r=>r.publicCredentialId)).size!==snapshot.records.length))throw Error('Invalid or incomplete public snapshot');
const rules = [
  ['Cybersecurity', /security|cyber|malware|threat|hacking|forensic|penetration|privacy/i],
  ['Artificial Intelligence', /\bai\b|artificial intelligence|machine learning|neural|computer vision/i],
  ['Generative AI', /generative|\bgenai\b|\bllm\b|prompt engineering|chatgpt/i],
  ['Data Science and Analytics', /data science|analytics|data analyst|statistics|pandas|data visualization/i],
  ['Computer Networking', /network|routing|switching|packet tracer|ccna|ccnp|wireless/i],
  ['Cloud Computing', /cloud|\baws\b|azure|google cloud/i],
  ['DevOps', /devops|gitops|kubernetes|docker|container|ci\/cd/i],
  ['Software Development', /software|programming|python|javascript|coding|developer|java\b/i],
  ['Linux and Open Source', /linux|open source|ubuntu|red hat/i],
  ['IT Support', /it support|technical support|hardware|troubleshooting/i],
  ['Project Management', /project management|scrum|agile/i],
  ['Business and Professional Development', /business|marketing|career|leadership|communication|entrepreneur/i]
];
const normalize = s => s.trim().toLowerCase().replace('owasp¨','owasp®');
const matching = (a,b) => normalize(a.title) === normalize(b.title) && normalize(a.issuer) === normalize(b.issuer);
const safe = (value, host) => { try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === host ? u.href : null; } catch { return null; } };
const records = source.map(r => {
  const matches = badges.filter(b => matching(r,b));
  const match = matches.length === 1 && source.filter(s => matching(s,r)).length === 1 ? matches[0] : null;
  const domains = rules.filter(([,pattern]) => pattern.test(r.title)).map(([name]) => name);
  const issueDate = new Date(r.issued + ' UTC').toISOString().slice(0,10);
  const transcriptMatch=metadata.filter(x=>x.title===r.title&&x.issuer===r.issuer&&x.issued===r.issued);
  if(transcriptMatch.length!==1)throw Error('Ambiguous transcript metadata: '+r.title);
  const transcriptMetadata=transcriptMatch[0],transcriptExpiry=transcriptMetadata.expirationDate?new Date(transcriptMetadata.expirationDate+' UTC').toISOString().slice(0,10):null;
  const publicMatches=(snapshot?.records??[]).filter(b=>matching(r,b)&&(b.issueDate?b.issueDate===issueDate:source.filter(s=>matching(s,r)).length===1));
  const publicMatch=publicMatches.length===1?publicMatches[0]:null;
  if(publicMatch?.expirationDate&&transcriptExpiry&&publicMatch.expirationDate!==transcriptExpiry)throw Error('Public and transcript expiration conflict: '+r.title);
  const type=/training badge/i.test(r.title)?'Training badge (title label)':/professional certificate/i.test(r.title)?'Professional certificate (title label)':/\bcertification\b/i.test(r.title)?'Certification (title label)':/\bcertificate\b/i.test(r.title)?'Certificate (title label)':null;
  return {
    id: 'transcript-' + createHash('sha256').update(JSON.stringify([r.title,r.issuer,r.authorized || null,issueDate])).digest('hex').slice(0,24),
    title:r.title, issuer:r.issuer, authorizingOrganization:r.authorized || null, issueDate,
    expirationDate:publicMatch?.expirationDate??transcriptExpiry, status:publicMatch?.status??'unavailable', badgeImage:publicMatch ? safe(publicMatch.badgeImage,'images.credly.com') : match ? safe(match.image,'images.credly.com') : null,
    verificationUrl:publicMatch ? safe(publicMatch.verificationUrl,'www.credly.com') : match ? safe(match.url,'www.credly.com') : null,
    publicCredentialId:publicMatch?.publicCredentialId??null,
    domains:domains.length ? domains : ['Other Learning'], domainClassification:'inferred', type,
    description:transcriptMetadata.description||null, skills:[], source:'Credly transcript (2026-11-22; description excerpt)'+(publicMatch?' + public Credly snapshot (2026-11-25)':''), lastSynchronized:publicMatch?snapshot.capturedAt:null
  };
});
if (records.length !== 280 || new Set(records.map(r=>r.id)).size !== records.length) throw new Error('Unexpected record count or duplicate credential ID');
if(snapshot&&records.filter(r=>r.publicCredentialId).length!==snapshot.records.length)throw Error('Unreconciled public cards require review before replacing the directory');
writeFileSync('credential-directory.json.tmp', JSON.stringify({schemaVersion:1, transcriptDate:'2026-11-22', lastSuccessfulSync:snapshot?.capturedAt??null, publicCredentialCount:snapshot?.records.length??null, otherPublicCredentialCount:snapshot?.otherPublicCount??null, records})+'\n');
renameSync('credential-directory.json.tmp','credential-directory.json');
writeFileSync('dashboard-summary.json',JSON.stringify(summarize(JSON.parse(readFileSync('credential-directory.json','utf8'))))+'\n');
