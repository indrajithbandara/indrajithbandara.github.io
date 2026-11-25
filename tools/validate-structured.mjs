import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{parse}=require('parse5'),Ajv=require('ajv');
const schema=JSON.parse(readFileSync('credential-directory.schema.json','utf8'));
const validate=new Ajv({allErrors:true}).compile(schema);
assert.ok(validate(JSON.parse(readFileSync('credential-directory.json','utf8'))),JSON.stringify(validate.errors));
for(const file of ['index.html','404.html','platform.html','offline.html','recommendations/index.html']){const errors=[];parse(readFileSync(file,'utf8'),{onParseError:e=>errors.push({code:e.code,line:e.startLine})});assert.deepEqual(errors,[],file+' HTML parsing errors');}
console.log('JSON Schema and HTML5 parser validation passed.');
