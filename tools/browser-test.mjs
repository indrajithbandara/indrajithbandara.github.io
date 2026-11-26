import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const serverless=process.env.PORTFOLIO_SERVERLESS_CHROMIUM?require('@sparticuz/chromium').default:null;
const browser=await chromium.launch({headless:true,...(serverless?{executablePath:await serverless.executablePath(),args:serverless.args}:{})});
try{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('https://api.github.com/**',route=>route.abort());
  await page.route('https://dev.to/**',route=>route.abort());
  await page.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');
  assert.equal(await page.locator('#typedName').innerText(),'Indrajith Bandara');
  assert.equal(await page.locator('#cmdCursor').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.locator('#badges').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.getElementById('cd-status').textContent==='Showing 1–18 of 280 records');
  assert.equal(await page.locator('.cd-card').count(),18);
  await page.locator('#cd-more').click();assert.match(await page.locator('#cd-status').innerText(),/19–36/);
  await page.locator('#cd-search').fill('Google IT Support');assert.match(await page.locator('#cd-status').innerText(),/of 1 records/);
  await page.locator('#cd-issuer').selectOption('Coursera');assert.equal(await page.locator('.cd-card').count(),1);
  assert.equal(new URL(page.url()).searchParams.get('cd-issuer'),'Coursera');await page.reload();await page.waitForFunction(()=>document.getElementById('cd-status').textContent.includes('of 1 records'));assert.equal(await page.locator('.cd-card').count(),1);
  await page.locator('.cd-card button').first().click();assert.ok(await page.locator('#cd-dialog').isVisible());assert.match(await page.locator('#cd-detail').innerText(),/foundational IT service/);await page.keyboard.press('Escape');assert.ok(!(await page.locator('#cd-dialog').isVisible()));
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#cd-export').click()]);assert.equal(download.suggestedFilename(),'credentials-filtered.csv');
  const [json]=await Promise.all([page.waitForEvent('download'),page.locator('#cd-json').click()]);assert.equal(json.suggestedFilename(),'public-credentials.json');
  await page.locator('#cd-reset').click();await page.locator('#cd-sort').selectOption('old');assert.match(await page.locator('.cd-card').first().innerText(),/2021-03-23/);
  for(const width of [320,360,375,390,414,430,768,1024,1440,1920]){await page.setViewportSize({width,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).slice(0,12).map(e=>[e.tagName,String(e.className),e.clientWidth,e.scrollWidth])}));assert.ok(result.scrollWidth<=width+1,`Horizontal overflow at ${width}px: ${JSON.stringify(result)}`);}
  await page.locator('#github-stats').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('github-live-languages').textContent.includes('unavailable'));
  await page.locator('#blog').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('articles-container').textContent.includes('Unable'));
  await page.locator('#themeToggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  const {AxeBuilder}=require('@axe-core/playwright');
  for(const theme of ['light','dark']){if(theme==='dark')await page.locator('#themeToggle').click();const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();console.log('Axe '+theme+': '+JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));assert.equal(results.violations.length,0,'Accessibility violations in '+theme);}
  await page.locator('#name').fill('Portfolio QA');await page.locator('#email').fill('qa@example.invalid');await page.locator('#message').fill('Synthetic test only; no message is sent.');assert.match(await page.locator('#contactForm').getAttribute('action'),/^mailto:/);await page.locator('#contactForm button').click();assert.match(await page.locator('#formNote').innerText(),/Send the message there/);
  console.log('Directory, pagination, combined filters, details, CSV, sort, responsive widths and theme passed.');
  const normal=await browser.newContext({reducedMotion:'no-preference',viewport:{width:1440,height:900}}),motion=await normal.newPage(),errors=[];motion.on('pageerror',error=>errors.push(error.message));
  await motion.route('https://**',r=>r.abort());
  await motion.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');
  await motion.waitForFunction(()=>document.getElementById('terminalBody').classList.contains('terminal-animate'));
  assert.equal(await motion.locator('#typedName .terminal-typed').getAttribute('aria-hidden'),'true');
  assert.equal(await motion.locator('#typedRole .terminal-typed').getAttribute('aria-hidden'),'true');
  assert.equal(await motion.locator('#typedName .terminal-source').textContent(),'Indrajith Bandara');
  await motion.locator('#badges').scrollIntoViewIfNeeded();await motion.waitForFunction(()=>document.querySelector('#cd-status').textContent.includes('of 280 records'));
  await motion.locator('.cd-card').first().scrollIntoViewIfNeeded();await motion.waitForFunction(()=>document.querySelector('.cd-card').classList.contains('motion-seen'));
  await motion.waitForFunction(()=>!document.querySelector('.cd-card').classList.contains('motion-enter'));
  await motion.locator('#cd-stats').scrollIntoViewIfNeeded();await motion.waitForFunction(()=>document.querySelector('#cd-stats .cd-stat').classList.contains('motion-seen')&&document.querySelector('#cd-stats strong').textContent==='280'&&!document.querySelector('#cd-stats strong').classList.contains('motion-count'));
  for(const width of [320,360,375,390,414,430,768,1024,1440,1920]){await motion.setViewportSize({width,height:900});assert.ok(await motion.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Motion overflow at ${width}px`);}
  await motion.setViewportSize({width:390,height:900});await motion.locator('#navToggle').click();assert.equal(await motion.locator('#navToggle').getAttribute('aria-expanded'),'true');await motion.keyboard.press('Escape');assert.equal(await motion.locator('#navToggle').getAttribute('aria-expanded'),'false');
  await motion.emulateMedia({reducedMotion:'reduce'});await motion.waitForFunction(()=>document.documentElement.dataset.motion==='reduce'&&getComputedStyle(document.getElementById('cmdCursor')).animationName==='none'&&!document.querySelector('.terminal-typed'));assert.equal(await motion.locator('#cmdCursor').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await motion.locator('#typedName .terminal-typed').getAttribute('aria-hidden'),'true');assert.deepEqual(errors,[]);
  const mobile=await browser.newContext({reducedMotion:'no-preference',viewport:{width:320,height:640}}),mobilePage=await mobile.newPage();await mobilePage.route('https://**',r=>r.abort());await mobilePage.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');assert.ok(!(await mobilePage.locator('#terminalBody').getAttribute('class')).includes('terminal-animate'));await mobilePage.locator('#terminalBody').scrollIntoViewIfNeeded();await mobilePage.waitForFunction(()=>document.getElementById('terminalBody').classList.contains('terminal-animate'));assert.equal(await mobilePage.locator('#typedName .terminal-typed').getAttribute('aria-hidden'),'true');await mobilePage.waitForFunction(()=>document.querySelector('#typedRole .terminal-typed')?.textContent?.length>0);const roleText=await mobilePage.locator('#typedRole .terminal-typed').textContent();assert.ok('Networking · Cybersecurity · AI · Cloud'.startsWith(roleText));await mobilePage.waitForFunction(()=>!document.querySelector('#terminalBody').classList.contains('terminal-animate'));assert.equal(await mobilePage.locator('#typedRole').innerText(),'Networking · Cybersecurity · AI · Cloud');
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),fallback=await plain.newPage();await fallback.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');assert.equal(await fallback.locator('#typedName').innerText(),'Indrajith Bandara');assert.ok(await fallback.locator('.nav__link').first().isVisible());assert.ok(await fallback.locator('#about [data-aos]').first().isVisible());assert.equal(await fallback.locator('#about [data-aos]').first().evaluate(e=>getComputedStyle(e).opacity),'1');
  console.log('Motion typing, once-only reveals, counters, normal-motion widths, mobile navigation, reduced motion and no-JS fallback passed.');
}finally{await browser.close();}
