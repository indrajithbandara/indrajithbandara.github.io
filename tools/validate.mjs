import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('credential-directory.json','utf8'));
const original=JSON.parse(readFileSync('credentials.json','utf8'));
assert.equal(data.records.length,original.length);assert.equal(original.length,280);
assert.equal(new Set(data.records.map(r=>r.id)).size,280);
assert.equal(new Set(data.records.map(r=>r.issuer)).size,29);
const linked=data.records.filter(r=>r.publicCredentialId);assert.equal(new Set(linked.map(r=>r.publicCredentialId)).size,linked.length);
if(data.publicCredentialCount!==null)assert.equal(linked.length,data.publicCredentialCount,'Public badge coverage');
assert.equal(data.records.filter(r=>r.description).length,280,'Transcript description coverage');
for(const r of data.records){assert.match(r.id,/^transcript-[a-f0-9]{24}$/);assert.ok(r.title&&r.issuer);assert.match(r.issueDate,/^\d{4}-\d{2}-\d{2}$/);assert.ok(['active','expired','no-expiration','unavailable'].includes(r.status));assert.ok(r.domains.length);assert.equal(r.domainClassification,'inferred');if(!r.expirationDate)assert.ok(['unavailable','no-expiration'].includes(r.status));for(const [key,host] of [['badgeImage','images.credly.com'],['verificationUrl','www.credly.com']])if(r[key]){const url=new URL(r[key]);assert.equal(url.protocol,'https:');assert.equal(url.hostname,host);}}
const html=readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const m of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)){const url=m[1];if(!/^(?:[a-z]+:|\/\/)/i.test(url))assert.ok(existsSync(url.split(/[?#]/)[0]),'Missing asset: '+url);}
for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]),'Broken fragment: '+m[1]);
assert.ok(!html.includes("script-src 'self' 'unsafe-inline'"));
assert.ok(!html.includes('api.web3forms.com')&&!html.includes('name="access_key"'),'Obsolete form integration present');
assert.equal(readFileSync('CNAME','utf8').trim(),'indrajithbandara.is-a.dev');
const platform=readFileSync('platform.html','utf8'),manifest=JSON.parse(readFileSync('manifest.webmanifest','utf8'));
for(const m of platform.matchAll(/\b(?:href|src)="([^"#]+)"/g)){const url=m[1];if(!/^(?:[a-z]+:|\/\/)/i.test(url))assert.ok(existsSync(url.split(/[?#]/)[0]),'Missing platform asset: '+url);}
for(const icon of manifest.icons)assert.ok(existsSync(icon.src));assert.equal(manifest.display,'standalone');
for(const file of ['assets/js/platform-data.js','assets/js/platform.js','assets/js/platform-shell.js','assets/js/preferences.js','sw.js']){const code=readFileSync(file,'utf8');assert.ok(!/\beval\s*\(|new Function\s*\(|\.innerHTML\s*=/.test(code),'Unsafe dynamic execution/rendering: '+file);}
assert.ok(!readFileSync('sw.js','utf8').includes('academic_transcript'));assert.ok(existsSync('assets/images/business-card-qr.png'));
console.log(`Validated ${data.records.length} records, 29 issuers, unique IDs, asset paths, fragments and custom domain.`);
