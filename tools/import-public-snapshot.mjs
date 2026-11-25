import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import assert from 'node:assert/strict';
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
const date=s=>new Date(s+' UTC').toISOString().slice(0,10);
const records=input.filter(r=>r.path).map(r=>{
  assert.match(r.path,/^\/badges\/[a-f0-9-]{36}$/i);assert.ok(r.title&&r.issuer);
  const image=new URL(r.image);assert.equal(image.protocol,'https:');assert.equal(image.hostname,'images.credly.com');
  const [verb,...parts]=r.dateLabel.split(' '),when=date(parts.join(' '));assert.ok(['Issued','Expired','Expires'].includes(verb));
  return {publicCredentialId:r.path.split('/').pop(),title:r.title,issuer:r.issuer,issueDate:verb==='Issued'?when:null,expirationDate:verb==='Issued'?null:when,status:verb==='Issued'?'unavailable':verb==='Expired'?'expired':'active',badgeImage:image.href,verificationUrl:'https://www.credly.com'+r.path};
});
assert.ok(records.length>=275,'Snapshot is incomplete');assert.equal(records.length,new Set(records.map(r=>r.publicCredentialId)).size);
const snapshot={capturedAt:new Date().toISOString(),source:'Public Credly badge wallet; manually observed rendered cards',otherPublicCount:input.length-records.length,records};
writeFileSync('credly-public-snapshot.json.tmp',JSON.stringify(snapshot,null,2)+'\n');renameSync('credly-public-snapshot.json.tmp','credly-public-snapshot.json');
console.log(`Imported ${records.length} unique public Credly cards; ${snapshot.otherPublicCount} external cards excluded.`);
