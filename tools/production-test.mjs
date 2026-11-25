import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const base='https://indrajithbandara.is-a.dev/',release=process.env.GITHUB_SHA||'local-check';
const files=['index.html','assets/js/motion.js','assets/css/style.css','assets/css/credentials.css','credential-directory.json','platform.html','assets/js/platform.js','assets/js/platform-shell.js','assets/js/platform-data.js','assets/js/preferences.js','assets/css/platform.css','manifest.webmanifest','sw.js','offline.html'];
let matched=false;
for(let attempt=0;attempt<18;attempt++){
  try{const checks=await Promise.all(files.map(async path=>{const r=await fetch(base+path+'?release='+release,{signal:AbortSignal.timeout(10000),cache:'no-store'});return r.ok&&Buffer.from(await r.arrayBuffer()).equals(readFileSync(path));}));matched=checks.every(Boolean);if(matched)break;}catch{}
  console.log('Awaiting GitHub Pages propagation',attempt+1);await new Promise(r=>setTimeout(r,10000));
}
assert.ok(matched,'Deployed asset bytes do not yet match this revision');
const browser=await chromium.launch({headless:true});
try{for(const [width,height] of [[390,844],[1440,900]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?release='+release,{waitUntil:'domcontentloaded'});
  await page.locator('#terminalBody').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('terminalBody').classList.contains('terminal-animate'));
  assert.equal(await page.locator('#typedName .terminal-typed').getAttribute('aria-hidden'),'true');
  await page.locator('#badges').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#cd-status').textContent.includes('of 280 records'));
  assert.equal(await page.locator('.cd-card').count(),18);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'platform.html#credentials',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#platform-view').textContent.includes('280 results'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.keyboard.press('Control+k');await page.locator('#command-palette').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.locator('#command-palette').waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);console.log('PRODUCTION PASS '+width+'x'+height+' — typing, credential count, platform, palette, no horizontal overflow or JS errors');await context.close();
}}finally{await browser.close();}
